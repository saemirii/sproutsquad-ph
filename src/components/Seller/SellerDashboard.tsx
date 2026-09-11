import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  BookOpen,
  Settings,
  Store,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Truck
} from 'lucide-react';
import { useShop, useSession } from '../../context/AppContext';
import { SellerTab } from '../../types';
import { SellerOverview } from './SellerOverview';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { ExpenseTracker } from './ExpenseTracker';
import { DeliveryManager } from './DeliveryManager';
import { AcademyRoot } from '../Academy/AcademyRoot';
import { BusinessSettings } from './BusinessSettings';

export const SellerDashboard: React.FC = () => {
  const {
    activeBusiness,
    sellerOrders,
    sellerProducts,
    activeBusinessMetrics
  } = useShop();
  const { sellerTab, setSellerTab } = useSession();

  const pendingOrdersCount = sellerOrders.filter((o) => o.orderStatus === 'Pending').length;
  const lowStockCount = sellerProducts.filter((p) => p.inventoryCount <= 5).length;

  const tabs: { id: SellerTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'overview',
      label: 'Overview & Health',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: `${activeBusinessMetrics.healthScore} pts`,
    },
    {
      id: 'products',
      label: 'Products & Margins',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
    },
    {
      id: 'orders',
      label: 'Campus Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : undefined,
    },
    {
      id: 'delivery',
      label: 'Delivery Dispatch',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Expense Tracker',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'academy',
      label: 'Sprout Academy',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Shop Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EDE4D8] scrollbar-none">
        {tabs.map((tab) => {
          const isActive = sellerTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`seller-tab-${tab.id}`}
              onClick={() => setSellerTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer btn-bouncy ${
                isActive
                  ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3] shadow-xs'
                  : 'bg-white text-[#6B5B4F] hover:bg-[#FAF3DE] hover:text-[#3B2F27] border border-[#EDE4D8]'
              }`}
            >
              <span className={isActive ? 'text-[#194E3B]' : 'text-[#8C7A6D]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    typeof tab.badge === 'string' && tab.badge.includes('low')
                      ? 'bg-[#FFD3BA] text-[#7A341A] border border-[#F8BA9E]'
                      : typeof tab.badge === 'string' && tab.badge.includes('new')
                      ? 'bg-[#A8D8EA] text-[#1B4E6B] border border-[#8EC7DC]'
                      : 'bg-white text-[#194E3B] border border-[#9FD9C3]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="transition-all">
        {sellerTab === 'overview' && (
          <SellerOverview />
        )}
        {sellerTab === 'products' && <ProductManager />}
        {sellerTab === 'orders' && <OrderManager />}
        {sellerTab === 'delivery' && <DeliveryManager />}
        {sellerTab === 'expenses' && <ExpenseTracker />}
        {sellerTab === 'academy' && <AcademyRoot />}
        {sellerTab === 'settings' && <BusinessSettings />}
      </div>
    </div>
  );
};
