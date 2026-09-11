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
  const relatedBusiness = businesses.find((b) => b.id === firstOrder.businessId);

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
            Campus Order Confirmed!
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Order <strong className="text-[#207559]">{firstOrder.orderNumber}</strong> placed successfully.
          </p>
        </div>

        {/* Fulfillment & Meetup spot recap */}
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#3B2F27]">
            <MapPin className="w-4 h-4 text-[#207559]" />
            <span>Meetup Spot: {firstOrder.meetupLocation}</span>
          </div>

          <p className="text-[11px] text-[#6E5D52]">
            Payment: <strong className="text-[#207559]">{firstOrder.paymentMethod}</strong> • Total: <strong className="text-[#3B2F27]">{formatPHP(firstOrder.totalAmount)}</strong>
          </p>

          <p className="text-[11px] text-[#8C7A6D]">
            Buyer: {firstOrder.customerName} ({firstOrder.customerContact})
          </p>
        </div>

        {/* Flow Demonstration Notice */}
        <div className="p-3 bg-[#EBFBF0] rounded-xl border border-[#B8E6D5] text-xs text-[#065F46] font-medium text-left flex items-start gap-2">
          <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
          <span>
            <strong>Data Synced!</strong> This order has deducted 1 inventory unit, added {formatPHP(firstOrder.totalAmount)} to {firstOrder.businessName}'s revenue, and updated their Business Health Score!
          </span>
        </div>

        {/* Dual Actions */}
        <div className="space-y-2 pt-2">
          {relatedBusiness && (
            <button
              onClick={() => {
                setActiveBusiness(relatedBusiness);
                setCurrentView('seller');
                setSellerTab('orders');
                onClose();
              }}
              className="w-full py-3 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
            >
              <Store className="w-4 h-4" />
              <span>Switch to Seller OS to fulfill this order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

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
