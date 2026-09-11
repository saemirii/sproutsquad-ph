import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Store,
  MapPin,
  ShoppingBag,
  TrendingUp,
  X
} from 'lucide-react';
import { useSession, useShop } from '../../context/AppContext';
import { Order } from '../../types';
import { formatPHP } from '../../utils/analytics';

interface OrderSuccessModalProps {
  orders: Order[] | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orders,
  onClose,
}) => {
  const { setCurrentView, setSellerTab } = useSession();
  const { setActiveBusiness, businesses } = useShop();

  if (!orders || orders.length === 0) return null;

  const firstOrder = orders[0];
  const isMultiShop = orders.length > 1;
  // Each order in this array came from a different shop (see placeOrder in
  // AppContext.tsx, which splits a mixed-shop cart into one order per
  // business) — dedupe in case the same business somehow appears twice.
  const relatedBusinesses = Array.from(new Map(
    orders.map((o) => [o.businessId, businesses.find((b) => b.id === o.businessId)])
  ).values()).filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A231E]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center relative animate-in zoom-in-95 duration-200 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#7A6B5F] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot & Success Icon */}
        <div className="relative inline-block">
          <div className="w-18 h-18 bg-[#B8E6D5] text-[#194E3B] rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xs">
            🎉
          </div>
          <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-[#B8E6D5] text-xs">
            ✨
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#3B2F27] font-['Nunito',sans-serif]">
            Campus Order{isMultiShop ? 's' : ''} Confirmed!
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            {isMultiShop
              ? `${orders.length} separate orders placed successfully — one per shop.`
              : <>Order <strong className="text-[#207559]">{firstOrder.orderNumber}</strong> placed successfully.</>}
          </p>
        </div>

        {/* Meetup spot + buyer info are shared across every order in this
            checkout (chosen once in the bag), so they're shown once here
            rather than repeated per order below. */}
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#3B2F27]">
            <MapPin className="w-4 h-4 text-[#207559]" />
            <span>Meetup Spot: {firstOrder.meetupLocation}</span>
          </div>
          <p className="text-[11px] text-[#8C7A6D]">
            Buyer: {firstOrder.customerName} ({firstOrder.customerContact})
          </p>
        </div>

        {/* One card per shop — each is its own order with its own total
            and its own payment destination, since this app has no single
            combined checkout gateway; the buyer pays each shop directly. */}
        <div className="space-y-2 text-left">
          {orders.map((order) => {
            const business = businesses.find((b) => b.id === order.businessId);
            const payTo =
              order.paymentMethod === 'Maya' ? business?.mayaNumber
                : order.paymentMethod === 'GCash' ? business?.gcashNumber
                : null;
            return (
              <div key={order.id} className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#3B2F27] truncate">{order.businessName}</span>
                  <span className="text-[10px] font-bold text-[#8C7A6D] shrink-0">#{order.orderNumber}</span>
                </div>
                <p className="text-[11px] text-[#6E5D52]">
                  Payment: <strong className="text-[#207559]">{order.paymentMethod}</strong> • Total: <strong className="text-[#3B2F27]">{formatPHP(order.totalAmount)}</strong>
                </p>
                {payTo && (
                  <p className="text-[11px] text-[#6E5D52]">
                    Send to: <strong className="text-[#3B2F27]">{payTo}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Flow Demonstration Notice */}
        <div className="p-3 bg-[#EBFBF0] rounded-xl border border-[#B8E6D5] text-xs text-[#065F46] font-medium text-left flex items-start gap-2">
          <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
          <span>
            <strong>Data Synced!</strong> {isMultiShop ? `These orders have` : 'This order has'} deducted inventory, added revenue, and updated the Business Health Score for {isMultiShop ? `all ${relatedBusinesses.length} shops` : firstOrder.businessName}!
          </span>
        </div>

        {/* Dual Actions */}
        <div className="space-y-2 pt-2">
          {relatedBusinesses.map((business) => (
            <button
              key={business.id}
              onClick={() => {
                setActiveBusiness(business);
                setCurrentView('seller');
                setSellerTab('orders');
                onClose();
              }}
              className="w-full py-3 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
            >
              <Store className="w-4 h-4" />
              <span>Switch to Seller OS for {business.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#FAF3DE] text-[#54453C] font-bold text-xs rounded-2xl transition-colors cursor-pointer btn-bouncy"
          >
            Continue Browsing Campus Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
