import React from 'react';
import { ShoppingBag, Store, GraduationCap, Bot, Sparkles, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';

export type IosActiveTab = 'market' | 'ai-coach' | 'academy' | 'seller' | 'bag';

interface IosTabBarProps {
  activeTab: IosActiveTab;
  onTabChange: (tab: IosActiveTab) => void;
}

export const IosTabBar: React.FC<IosTabBarProps> = ({ activeTab, onTabChange }) => {
  const { cartCount, sellerOrders } = useApp();

  const pendingSellerOrders = sellerOrders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing'
  ).length;

  const tabs: {
    id: IosActiveTab;
    label: string;
    icon: string;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'market',
      label: 'Market',
      icon: '🛍️',
    },
    {
      id: 'ai-coach',
      label: 'Sprout AI',
      icon: '🦉',
    },
    {
      id: 'academy',
      label: 'Academy',
      icon: '🌱',
    },
    {
      id: 'seller',
      label: 'Shop OS',
      icon: '🐻',
      badge: pendingSellerOrders > 0 ? pendingSellerOrders : undefined,
      badgeColor: 'bg-[#FFD3BA] text-[#7A341A]',
    },
    {
      id: 'bag',
      label: 'My Bag',
      icon: '🎒',
      badge: cartCount > 0 ? cartCount : undefined,
      badgeColor: 'bg-[#194E3B] text-white',
    },
  ];

  return (
    <div className="w-full shrink-0 bg-[#FFF9E6]/95 backdrop-blur-xl border-t border-[#EDE4D8] px-3 pt-1.5 pb-1 select-none z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`ios-tab-${tab.id}`}
              onClick={() => {
                playIosTap();
                onTabChange(tab.id);
              }}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl cursor-pointer group active:scale-90 transition-transform"
            >
              {/* Active Pill Glow / Indicator */}
              <div
                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#B8E6D5] text-[#194E3B] shadow-xs'
                    : 'text-[#8C7A6D] group-hover:bg-white/50'
                }`}
              >
                <span className="text-base select-none leading-none">
                  {tab.icon}
                </span>
              </div>

              {/* Tab Title */}
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-['Nunito',sans-serif] ${
                  isActive
                    ? 'font-black text-[#194E3B]'
                    : 'font-semibold text-[#8C7A6D]'
                }`}
              >
                {tab.label}
              </span>

              {/* Notification Badges */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`absolute top-0 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-black flex items-center justify-center border border-white shadow-xs animate-in zoom-in-50 ${
                    tab.badgeColor || 'bg-[#FFD3BA] text-[#7A341A]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="pt-2 pb-1">
        <div className="w-32 h-1 bg-[#3B2F27]/25 rounded-full mx-auto" />
      </div>
    </div>
  );
};
