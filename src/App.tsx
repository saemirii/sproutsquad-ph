import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppProvider, AuthenticatedUser, useSession, useShop } from './context/AppContext';
import { AuthPage, LocalAccount } from './components/AuthPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { safeSetItem } from './utils/safeStorage';
import { IPhoneFrame } from './components/IOS/IPhoneFrame';
import { IosActiveTab } from './components/IOS/IosTabBar';
import { DynamicIslandAlert } from './components/IOS/DynamicIsland';
import { IosMarketplaceView } from './components/IOS/IosMarketplaceView';
import { SproutUpTab } from './components/SproutUp/SproutUpTab';
import { IosSellerView } from './components/IOS/IosSellerView';
import { IosBagView } from './components/IOS/IosBagView';
import { AcademyRoot } from './components/Academy/AcademyRoot';
import { BusinessDetailView } from './components/Marketplace/BusinessDetailView';
import { ProductDetailModal } from './components/Marketplace/ProductDetailModal';
import { OrderSuccessModal } from './components/Marketplace/OrderSuccessModal';
import { SproutBloomLoader } from './components/SproutBloomLoader';
import { Product, Business, Order } from './types';
import { isNativeApp, API_BASE_URL } from './utils/platform';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, isRemoteDataLoading, pendingNavigation, setPendingNavigation } = useSession();
  const { businesses } = useShop();

  // Active iOS Tab State
  const [activeTab, setActiveTab] = useState<IosActiveTab>('market');

  // Dynamic Island Alert State
  const [activeAlert, setActiveAlert] = useState<DynamicIslandAlert | null>(null);

  // Selected entities for drilldown
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [successfulOrders, setSuccessfulOrders] = useState<Order[] | null>(null);

  const showAlert = (icon: string, title: string, subtitle?: string) => {
    setActiveAlert({
      id: `alert-${Date.now()}`,
      icon,
      title,
      subtitle,
      duration: 3500,
    });
  };

  const handleTabChange = (tab: IosActiveTab) => {
    setActiveTab(tab);
    // Reset drilled-down subviews when navigating tabs
    if (tab === 'market') {
      setSelectedBusiness(null);
      setCurrentView('marketplace');
    } else if (tab === 'seller') {
      setCurrentView('seller');
    } else if (tab === 'academy') {
      setCurrentView('academy');
    }
  };

  // Deep-link bridge: a notification's action can request switching the
  // active iOS tab (and optionally focusing a business or order), which
  // lives here rather than in AppContext — applied once, then cleared.
  // The 'bag' + orderId case is deliberately NOT cleared here — IosBagView
  // itself reads pendingNavigation to highlight/scroll to that order, and
  // clears it once it has (clearing it here first would race it out from
  // under that component before it ever mounts/reads it).
  useEffect(() => {
    if (!pendingNavigation) return;
    setActiveTab(pendingNavigation.tab);
    if (pendingNavigation.tab === 'market') {
      const biz = pendingNavigation.businessId ? businesses.find((b) => b.id === pendingNavigation.businessId) : null;
      setSelectedBusiness(biz || null);
      setPendingNavigation(null);
    } else if (
      (pendingNavigation.tab !== 'bag' || !pendingNavigation.orderId) &&
      (pendingNavigation.tab !== 'sproutup' || !pendingNavigation.businessId)
    ) {
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleOrderSuccess = (createdOrders: Order[]) => {
    setSuccessfulOrders(createdOrders);
    showAlert('🎉', 'Campus Order Placed!', `${createdOrders.length} drop scheduled`);
  };

  if (isRemoteDataLoading) {
    return (
      <div className="min-h-screen bg-[#143D35] flex flex-col items-center justify-center gap-4 text-[#B8E6D5] font-bold">
        <SproutBloomLoader />
        Loading your campus data...
      </div>
    );
  }

  return (
    <IPhoneFrame
      activeTab={activeTab}
      onTabChange={handleTabChange}
      activeAlert={activeAlert}
      onClearAlert={() => setActiveAlert(null)}
      onOpenBag={() => setActiveTab('bag')}
    >
      {/* 🛍️ Tab 1: Marketplace / Discover */}
      {activeTab === 'market' && (
        <>
          {selectedBusiness ? (
            <div className="p-3">
              <BusinessDetailView
                business={selectedBusiness}
                onBack={() => setSelectedBusiness(null)}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            </div>
          ) : (
            <IosMarketplaceView
              onSelectProduct={(p) => setSelectedProduct(p)}
              onSelectBusiness={(b) => setSelectedBusiness(b)}
              onShowAlert={showAlert}
            />
          )}
        </>
      )}

      {/* 🚀 Tab 2: SproutUp! (business visibility & discovery) */}
      {activeTab === 'sproutup' && (
        <SproutUpTab
          onSelectBusiness={(b) => {
            setSelectedBusiness(b);
            setActiveTab('market');
          }}
        />
      )}

      {/* 🌱 Tab 3: Sprout Academy (Pip the Sprout) */}
      {activeTab === 'academy' && (
        <div className="p-4 space-y-4">
          <AcademyRoot />
        </div>
      )}

      {/* 🐻 Tab 4: Shop OS (Seller Operating System) */}
      {activeTab === 'seller' && <IosSellerView />}

      {/* 🎒 Tab 5: My Bag & Campus Orders */}
      {activeTab === 'bag' && (
        <IosBagView
          onExploreMarket={() => setActiveTab('market')}
          onOrderCompleted={handleOrderSuccess}
        />
      )}

      {/* Modals & Bottom Sheets */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onViewBusiness={(biz) => {
          setSelectedProduct(null);
          setSelectedBusiness(biz);
          setActiveTab('market');
        }}
      />

      <OrderSuccessModal
        orders={successfulOrders}
        onClose={() => setSuccessfulOrders(null)}
      />
    </IPhoneFrame>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [localUser, setLocalUser] = useState<AuthenticatedUser | null>(() => {
    const saved = localStorage.getItem('sproutsquad_local_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // One-time native status bar setup — the app's own UI reserves
  // safe-area-inset-top space (see IosStatusBar.tsx) rather than drawing a
  // fake status bar there, so the real one just needs its text style set to
  // match this app's light background.
  useEffect(() => {
    if (!isNativeApp) return;
    void import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      void StatusBar.setStyle({ style: Style.Light });
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // getSession() can hang indefinitely if a cached session's token needs a
    // refresh and that network call stalls or fails (e.g. the JWT clock-skew
    // issue that can produce "issued at future" errors) — with no .catch()
    // and no timeout, that used to leave the app stuck on this loading
    // screen forever. A stall now falls through to the sign-in screen after
    // a few seconds instead of hanging indefinitely; the listener below
    // still fires normally once auth genuinely settles.
    let isLoadingResolved = false;
    const resolveLoading = () => {
      if (isLoadingResolved) return;
      isLoadingResolved = true;
      setIsLoading(false);
    };
    const timeout = setTimeout(resolveLoading, 8000);

    supabase.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch((error) => console.error('Failed to restore session', error))
      .finally(() => { clearTimeout(timeout); resolveLoading(); });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      resolveLoading();
    });

    return () => {
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sproutsquad_local_session');
    setLocalUser(null);
  };

  // Apple Guideline 5.1.1(v): the app supports account creation, so it must
  // also offer in-app account deletion. Supabase mode deletes the real
  // auth.users row (and everything that cascades from it) via a server-side
  // call — the service-role key that requires can never reach the client.
  // Local-fallback mode has no server at all, so it just drops the account
  // from this device's own localStorage list.
  const handleDeleteAccount = async (): Promise<{ success: boolean; message?: string }> => {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return { success: false, message: 'Your session has expired. Please sign in again and retry.' };

      try {
        const response = await fetch(`${API_BASE_URL}/api/delete-account`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          return { success: false, message: body.error || 'Failed to delete account. Please try again.' };
        }
      } catch {
        return { success: false, message: 'Could not reach the server. Please check your connection and try again.' };
      }

      await supabase.auth.signOut();
    } else if (localUser) {
      const accounts: LocalAccount[] = JSON.parse(localStorage.getItem('sproutsquad_local_accounts') || '[]');
      const remaining = accounts.filter((account) => account.id !== localUser.id);
      safeSetItem('sproutsquad_local_accounts', JSON.stringify(remaining));
    }

    localStorage.removeItem('sproutsquad_local_session');
    setLocalUser(null);
    return { success: true };
  };

  if (!isSupabaseConfigured && localUser) {
    return (
      <AppProvider authUser={localUser} onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount}>
        <MainAppContent />
      </AppProvider>
    );
  }

  if (!isSupabaseConfigured || !session) {
    return isLoading ? (
      <div className="min-h-screen bg-[#143D35] flex items-center justify-center text-[#B8E6D5] font-bold">Loading SproutSquad...</div>
    ) : <AuthPage onLocalAuth={(user) => {
      safeSetItem('sproutsquad_local_session', JSON.stringify(user));
      setLocalUser(user);
    }} />;
  }

  return (
    <AppProvider authUser={session.user} onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount}>
      <MainAppContent />
    </AppProvider>
  );
}
