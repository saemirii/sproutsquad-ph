import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppProvider, AuthenticatedUser, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { safeSetItem } from './utils/safeStorage';
import { IPhoneFrame } from './components/IOS/IPhoneFrame';
import { IosActiveTab } from './components/IOS/IosTabBar';
import { DynamicIslandAlert } from './components/IOS/DynamicIsland';
import { IosMarketplaceView } from './components/IOS/IosMarketplaceView';
import { IosAiCoachTab } from './components/IOS/IosAiCoachTab';
import { IosSellerView } from './components/IOS/IosSellerView';
import { IosBagView } from './components/IOS/IosBagView';
import { SproutAcademy } from './components/Seller/SproutAcademy';
import { BusinessDetailView } from './components/Marketplace/BusinessDetailView';
import { ProductDetailModal } from './components/Marketplace/ProductDetailModal';
import { OrderSuccessModal } from './components/Marketplace/OrderSuccessModal';
import { SproutBloomLoader } from './components/SproutBloomLoader';
import { Product, Business, Order } from './types';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, isRemoteDataLoading } = useApp();

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

      {/* 🦉 Tab 2: Sprout AI Co-Pilot (Peanut the Owl) */}
      {activeTab === 'ai-coach' && <IosAiCoachTab />}

      {/* 🌱 Tab 3: Sprout Academy (Pip the Sprout) */}
      {activeTab === 'academy' && (
        <div className="p-4 space-y-4">
          <SproutAcademy />
        </div>
      )}

      {/* 🐻 Tab 4: Shop OS (Seller Operating System) */}
      {activeTab === 'seller' && (
        <IosSellerView onOpenAiCoachTab={() => setActiveTab('ai-coach')} />
      )}

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

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sproutsquad_local_session');
    setLocalUser(null);
  };

  if (!isSupabaseConfigured && localUser) {
    return (
      <AppProvider authUser={localUser} onSignOut={handleSignOut}>
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
    <AppProvider authUser={session.user} onSignOut={handleSignOut}>
      <MainAppContent />
    </AppProvider>
  );
}
