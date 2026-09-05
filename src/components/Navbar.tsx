import React, { useState } from 'react';
import {
  Sprout,
  ShoppingBag,
  Store,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Plus,
  Compass,
  CheckCircle2,
  RefreshCw,
  Search,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampusUniversity } from '../types';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenCreateBusiness: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenCreateBusiness }) => {
  const {
    currentView,
    setCurrentView,
    sellerTab,
    setSellerTab,
    businesses,
    activeBusiness,
    setActiveBusiness,
    cartCount,
    selectedCampusFilter,
    setSelectedCampusFilter,
    sellerOrders,
    resetToDefaultData
  } = useApp();

  const [isBizDropdownOpen, setIsBizDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const campuses: (CampusUniversity | 'All Campuses')[] = [
    'All Campuses',
    'MGC New Life Christian Academy',
  ];

  const pendingSellerOrders = sellerOrders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="sproutsquad-logo-btn"
              onClick={() => setCurrentView('marketplace')}
              className="flex items-center gap-2.5 group text-left cursor-pointer btn-bouncy"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#B8E6D5] border border-[#9FD9C3] flex items-center justify-center shadow-xs group-hover:rotate-6 transition-transform">
                <span className="text-xl">🌱</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-[#3B2F27] font-['Nunito',sans-serif]">
                    Sprout<span className="text-[#194E3B]">Squad</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFD3BA] text-[#7A341A] rounded-full uppercase tracking-wider">
                    PH Student OS
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5B4F] -mt-0.5 hidden sm:block">
                  Campus Marketplace & Student Business OS
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Switcher */}
          <nav className="hidden md:flex items-center bg-[#FAF3DE] p-1.5 rounded-2xl border border-[#EDE4D8]">
            <button
              id="nav-marketplace-btn"
              onClick={() => setCurrentView('marketplace')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer btn-bouncy ${
                currentView === 'marketplace' || currentView === 'business-detail'
                  ? 'bg-white text-[#194E3B] shadow-xs border border-[#EDE4D8]'
                  : 'text-[#6B5B4F] hover:text-[#3B2F27] hover:bg-white/60'
              }`}
            >
              <span className="text-base">🐰</span>
              <span>Campus Marketplace</span>
            </button>

            <button
              id="nav-seller-btn"
              onClick={() => {
                setCurrentView('seller');
                setSellerTab('overview');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer btn-bouncy relative ${
                currentView === 'seller'
                  ? 'bg-[#B8E6D5] text-[#194E3B] shadow-xs border border-[#9FD9C3]'
                  : 'text-[#6B5B4F] hover:text-[#3B2F27] hover:bg-white/60'
              }`}
            >
              <span className="text-base">🦉</span>
              <span>Seller OS & Health</span>
              {pendingSellerOrders > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black text-[#7A341A] bg-[#FFD3BA] rounded-full border border-[#F8BA9E]">
                  {pendingSellerOrders}
                </span>
              )}
            </button>

            <button
              id="nav-academy-btn"
              onClick={() => {
                setCurrentView('academy');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer btn-bouncy ${
                currentView === 'academy'
                  ? 'bg-[#FFD3BA] text-[#7A341A] shadow-xs border border-[#F8BA9E]'
                  : 'text-[#6B5B4F] hover:text-[#3B2F27] hover:bg-white/60'
              }`}
            >
              <span className="text-base">🎓</span>
              <span>Sprout Academy</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Business Switcher */}
            <div className="relative">
              <button
                id="biz-switcher-btn"
                onClick={() => setIsBizDropdownOpen(!isBizDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#FAF4ED] border border-[#EDE4D8] rounded-2xl text-xs font-semibold text-[#3B2F27] shadow-xs transition-colors cursor-pointer btn-bouncy"
                title="Switch Active Student Business"
              >
                <img
                  src={activeBusiness.logo}
                  alt={activeBusiness.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#EDE4D8]"
                />
                <span className="hidden sm:inline font-bold truncate max-w-[120px]">
                  {activeBusiness.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B5B4F]" />
              </button>

              {isBizDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-lg border border-[#EDE4D8] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 border-b border-[#F0E9DF] mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🐻</span>
                      <p className="text-[11px] font-bold text-[#6B5B4F] uppercase tracking-wider">
                        Select Active Storefront
                      </p>
                    </div>
                    <p className="text-[11px] text-[#8C7A6D]">
                      Switch between student venture financial profiles
                    </p>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {businesses.map((biz) => (
                      <button
                        key={biz.id}
                        onClick={() => {
                          setActiveBusiness(biz);
                          setIsBizDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-left text-xs transition-colors cursor-pointer ${
                          biz.id === activeBusiness.id
                            ? 'bg-[#B8E6D5] text-[#194E3B] font-bold border border-[#9FD9C3]'
                            : 'hover:bg-[#FFF9E6] text-[#3B2F27]'
                        }`}
                      >
                        <img
                          src={biz.logo}
                          alt={biz.name}
                          className="w-7 h-7 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-bold">{biz.name}</p>
                          <p className="text-[10px] text-[#6B5B4F] truncate">{biz.university}</p>
                        </div>
                        {biz.id === activeBusiness.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#194E3B]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#F0E9DF]">
                    <button
                      onClick={() => {
                        setIsBizDropdownOpen(false);
                        setCurrentView('seller');
                        setSellerTab('settings');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#A8D8EA] hover:bg-[#97CCE0] text-[#1B4E6B] font-bold text-xs rounded-2xl transition-colors cursor-pointer btn-bouncy"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Edit or Create Student Venture</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 bg-white hover:bg-[#FAF4ED] border border-[#EDE4D8] rounded-2xl text-[#3B2F27] shadow-xs transition-colors cursor-pointer btn-bouncy"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#3B2F27]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1 bg-[#FFD3BA] text-[#7A341A] border border-[#F8BA9E] text-[11px] font-black rounded-full shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Demo Data Reset Trigger */}
            <button
              id="reset-data-btn"
              onClick={() => {
                if (confirm('Reset SproutSquad demo data to original campus state?')) {
                  resetToDefaultData();
                }
              }}
              className="p-2.5 text-[#8C7A6D] hover:text-[#3B2F27] hover:bg-[#FAF4ED] rounded-2xl transition-colors cursor-pointer btn-bouncy"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#EDE4D8] gap-1">
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer btn-bouncy ${
              currentView === 'marketplace' || currentView === 'business-detail'
                ? 'bg-white text-[#194E3B] border border-[#EDE4D8]'
                : 'text-[#6B5B4F]'
            }`}
          >
            <span>🐰</span>
            <span>Marketplace</span>
          </button>
          <button
            onClick={() => {
              setCurrentView('seller');
              setSellerTab('overview');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer btn-bouncy ${
              currentView === 'seller'
                ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3]'
                : 'text-[#6B5B4F]'
            }`}
          >
            <span>🦉</span>
            <span>Seller OS</span>
          </button>
          <button
            onClick={() => setCurrentView('academy')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer btn-bouncy ${
              currentView === 'academy'
                ? 'bg-[#FFD3BA] text-[#7A341A] border border-[#F8BA9E]'
                : 'text-[#6B5B4F]'
            }`}
          >
            <span>🎓</span>
            <span>Academy</span>
          </button>
        </div>
      </div>
    </header>
  );
};
