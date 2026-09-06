import React, { useEffect, useState } from 'react';
import { ChevronDown, Plus, CheckCircle2, Store, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SellerTab } from '../../types';
import { SellerOverview } from '../Seller/SellerOverview';
import { ProductManager } from '../Seller/ProductManager';
import { OrderManager } from '../Seller/OrderManager';
import { DeliveryManager } from '../Seller/DeliveryManager';
import { ExpenseTracker } from '../Seller/ExpenseTracker';
import { BusinessSettings } from '../Seller/BusinessSettings';
import { playIosTap } from '../../utils/haptics';
import { KeyRound, LockKeyhole } from 'lucide-react';
import { CreateShopButton } from '../CreateShopButton';

interface IosSellerViewProps {
  onOpenAiCoachTab?: () => void;
}

export const IosSellerView: React.FC<IosSellerViewProps> = ({ onOpenAiCoachTab }) => {
  const {
    activeBusiness,
    setActiveBusiness,
    businesses,
    sellerTab,
    setSellerTab,
    sellerOrders,
    sellerProducts,
    activeBusinessMetrics,
    currentUser,
    accessibleBusinessIds,
    unlockBusinessByKey,
  } = useApp();

  const [isStoreSheetOpen, setIsStoreSheetOpen] = useState(false);
  const [besKey, setBesKey] = useState('');
  const [accessError, setAccessError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const hasBusinessAccess = accessibleBusinessIds.includes(activeBusiness.id);

  const pendingCount = sellerOrders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing'
  ).length;

  const lowStockCount = sellerProducts.filter((p) => p.inventoryCount <= 5).length;
  const managedBusinesses = businesses.filter((business) => accessibleBusinessIds.includes(business.id));
  const hasNoShopsYet = managedBusinesses.length === 0;

  const handleUnlockActiveBusiness = async () => {
    if (!besKey.trim() || isUnlocking) return;
    setIsUnlocking(true);
    const result = await unlockBusinessByKey(besKey);
    setIsUnlocking(false);
    if (result.success) {
      setAccessError('');
      setBesKey('');
    } else {
      setAccessError(result.message || 'That BES key is not valid.');
    }
  };

  useEffect(() => {
    if (managedBusinesses.length > 0 && !accessibleBusinessIds.includes(activeBusiness.id)) {
      setActiveBusiness(managedBusinesses[0]);
    }
  }, [activeBusiness.id, accessibleBusinessIds, managedBusinesses, setActiveBusiness]);

  const tabs: { id: SellerTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Health' },
    { id: 'products', label: 'Products', badge: lowStockCount > 0 ? `${lowStockCount}` : undefined },
    { id: 'orders', label: 'Orders', badge: pendingCount > 0 ? `${pendingCount}` : undefined },
    { id: 'delivery', label: 'Delivery' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'settings', label: 'Store' },
  ];

  return (
    <div className="flex flex-col space-y-5 pb-6">
      {/* Top Store Header */}
      <div className="sticky top-0 z-20 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-3 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          {/* Active Store Switcher Trigger */}
          <button
            onClick={() => {
              playIosTap();
              setIsStoreSheetOpen(true);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-2xl text-left shadow-xs active:scale-95 transition-transform"
          >
            <img
              src={activeBusiness.logo}
              alt={activeBusiness.name}
              className="w-7 h-7 rounded-xl object-cover border border-[#EDE4D8]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs text-[#3B2F27] truncate max-w-[130px] font-['Nunito',sans-serif]">
                  {activeBusiness.name}
                </span>
                <ChevronDown className="w-3 h-3 text-[#6B5B4F]" />
              </div>
              <p className="text-[10px] text-[#8C7A6D] truncate max-w-[140px]">
                {activeBusiness.university}
              </p>
            </div>
          </button>

          {/* Health Score Pill */}
          <div className="flex items-center gap-1 bg-[#B8E6D5] text-[#194E3B] px-3 py-1.5 rounded-2xl border border-[#9FD9C3]">
            <span className="text-xs">🌱</span>
            <span className="font-black text-xs">
              {activeBusinessMetrics.healthScore} HP
            </span>
          </div>
        </div>

        {/* iOS Segmented Control */}
        <div className="bg-[#FAF3DE] p-1 rounded-2xl flex items-center border border-[#EDE4D8] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = sellerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playIosTap();
                  setSellerTab(tab.id);
                }}
                className={`flex-1 min-w-[64px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all shrink-0 relative flex items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#194E3B] shadow-xs border border-[#EDE4D8]'
                    : 'text-[#6B5B4F] hover:text-[#3B2F27]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-[#FFD3BA] text-[#7A341A] text-[9px] font-black flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab Content Area */}
      <div className="px-4 pt-1">
        {hasNoShopsYet ? (
          <div className="rounded-3xl border-2 border-[#B8E6D5] bg-[#F2FBF7] p-5 space-y-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-[#194E3B] shrink-0" />
              <div>
                <h2 className="text-base font-black text-[#194E3B]">Start your student shop</h2>
                <p className="mt-1 text-xs leading-5 text-[#194E3B]">You don't have a storefront yet. Apply for one to start adding products, tracking orders, and seeing real analytics.</p>
              </div>
            </div>
            <CreateShopButton className="btn-bouncy w-full flex items-center justify-center gap-2 rounded-2xl bg-[#194E3B] hover:bg-[#0E2B25] px-4 py-3.5 text-sm font-black text-white shadow-md cursor-pointer">
              <Plus className="w-4 h-4" />
              Create My Shop
            </CreateShopButton>
            <p className="text-[10px] text-[#6B5B4F]">Signed in as {currentUser.email}</p>
          </div>
        ) : !hasBusinessAccess ? (
          <div className="rounded-3xl border border-[#F8BA9E] bg-[#FFF0E8] p-5 space-y-4">
            <div className="flex items-start gap-3"><LockKeyhole className="w-5 h-5 text-[#7A341A] shrink-0" /><div><h2 className="text-base font-black text-[#7A341A]">BES key required</h2><p className="mt-1 text-xs leading-5 text-[#7A341A]">This business is private. Ask the owner for its shared Business Entry &amp; Sharing key to manage it.</p></div></div>
            <div className="flex gap-2"><input value={besKey} onChange={(event) => setBesKey(event.target.value)} placeholder="Enter BES key" className="min-w-0 flex-1 rounded-xl border border-[#F8BA9E] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#FFD3BA]" /><button onClick={() => void handleUnlockActiveBusiness()} disabled={isUnlocking} className="rounded-xl bg-[#7A341A] px-3 py-2 text-xs font-black text-white flex items-center gap-1.5 disabled:opacity-60"><KeyRound className="w-3.5 h-3.5" />{isUnlocking ? 'Checking...' : 'Unlock'}</button></div>
            {accessError && <p className="text-[11px] font-bold text-[#991B1B]">{accessError}</p>}
            <p className="text-[10px] text-[#8C7A6D]">Signed in as {currentUser.email}</p>
          </div>
        ) : sellerTab === 'overview' && (
          <SellerOverview onOpenAiCoach={() => onOpenAiCoachTab && onOpenAiCoachTab()} />
        )}
        {hasBusinessAccess && sellerTab === 'products' && <ProductManager />}
        {hasBusinessAccess && sellerTab === 'orders' && <OrderManager />}
        {hasBusinessAccess && sellerTab === 'delivery' && <DeliveryManager />}
        {hasBusinessAccess && sellerTab === 'expenses' && <ExpenseTracker />}
        {hasBusinessAccess && sellerTab === 'settings' && <BusinessSettings />}
      </div>

      {/* iOS Action Sheet: Store Switcher */}
      {isStoreSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 space-y-4 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-[#D4C8B8] rounded-full mx-auto" />
            
            <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#3B2F27]">
                  Switch Student Venture 🏪
                </h3>
                <p className="text-[11px] text-[#6B5B4F]">
                  Select the active student business profile
                </p>
              </div>
              <button
                onClick={() => setIsStoreSheetOpen(false)}
                className="text-xs font-bold text-[#8C7A6D]"
              >
                Done
              </button>
            </div>

            <div className="space-y-2">
              {managedBusinesses.map((biz) => {
                const isSelected = biz.id === activeBusiness.id;
                return (
                  <button
                    key={biz.id}
                    onClick={() => {
                      playIosTap();
                      setActiveBusiness(biz);
                      setIsStoreSheetOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3]'
                        : 'bg-[#FAF3DE] text-[#3B2F27] hover:bg-[#F2EAE0]'
                    }`}
                  >
                    <img
                      src={biz.logo}
                      alt={biz.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-xs truncate font-['Nunito',sans-serif]">
                        {biz.name}
                      </p>
                      <p className="text-[10px] text-[#6B5B4F] truncate">
                        {biz.category} • {biz.university}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#194E3B]" />}
                  </button>
                );
              })}
            </div>

            <CreateShopButton
              onBeforeClick={() => { playIosTap(); setIsStoreSheetOpen(false); }}
              className="btn-bouncy w-full py-3.5 bg-[#A8D8EA] hover:bg-[#93CBE3] text-[#1B4E6B] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create New Student Storefront</span>
            </CreateShopButton>
          </div>
        </div>
      )}
    </div>
  );
};
