import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  ArrowRight,
  Filter,
  CreditCard,
  MessageCircle,
  Truck,
  Download,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useShop, useSubscription } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { formatPHP } from '../../utils/analytics';
import { triggerConfetti } from '../../utils/confetti';
import { exportOrdersToCsv } from '../../utils/exportOrders';

export const OrderManager: React.FC = () => {
  const { sellerOrders, updateOrderStatus, markPaymentVerified, activeBusiness } = useShop();
  const { hasSproutPlus, openSubscriptionPage } = useSubscription();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<OrderStatus | 'All'>('All');

  const handleExport = () => {
    if (!hasSproutPlus) {
      openSubscriptionPage();
      return;
    }
    exportOrdersToCsv(filteredOrders, activeBusiness.name);
  };

  const filteredOrders = sellerOrders
    .filter((o) => selectedStatusFilter === 'All' || o.orderStatus === selectedStatusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FFF9E6] text-[#7A341A] border-[#EADBCE]';
      case 'Preparing':
        return 'bg-[#A8D8EA] text-[#1B4E6B] border-[#8EC7DC]';
      case 'Ready for Pickup':
        return 'bg-[#FFD3BA] text-[#7A341A] border-[#F8BA9E]';
      case 'Out for Delivery':
        return 'bg-[#E9D5FF] text-[#6B21A8] border-[#D8B4FE]';
      case 'Completed':
        return 'bg-[#B8E6D5] text-[#194E3B] border-[#9FD9C3]';
      case 'Cancelled':
        return 'bg-[#FAF3DE] text-[#8C7A6D] border-[#EADBCE]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Completed');
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Incoming Campus Orders ({sellerOrders.length})
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Live order queue from student buyers across Philippine campuses
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Pending', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#96D6C0] shadow-xs'
                  : 'bg-white text-[#6E5D52] border border-[#E8DFC8] hover:bg-[#FAF5ED]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          title={hasSproutPlus ? 'Download this list as a CSV file' : 'Sprout+ feature — tap to view plans'}
          className="btn-bouncy inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E5DACD] hover:bg-[#FAF7F2] text-[#3B2F27] text-xs font-bold px-3 py-2"
        >
          {hasSproutPlus ? <Download className="w-3.5 h-3.5 text-[#207559]" /> : <Lock className="w-3.5 h-3.5 text-[#8C7A6D]" />}
          Export CSV
          {!hasSproutPlus && <span className="text-[9px] font-black uppercase text-[#7A341A] bg-[#FFD3BA] rounded-full px-1.5 py-0.5">Sprout+</span>}
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-[#FAF7F2] text-[#A39284] rounded-2xl mx-auto flex items-center justify-center text-2xl">
            📦
          </div>
          <h3 className="font-bold text-base text-[#3B2F27]">No orders in this status</h3>
          <p className="text-xs text-[#7A6B5F] max-w-sm mx-auto">
            Place a simulated order in the Campus Marketplace to see it appear here immediately!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs hover:border-[#B8E6D5] transition-all space-y-4"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5EFEB]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[#3B2F27]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-[11px] text-[#8C7A6D]">
                      {new Date(order.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7A6B5F]">Payment:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        order.paymentStatus === 'Pending Verification'
                          ? 'text-[#92400E] bg-[#FFF7E6]'
                          : 'text-[#207559] bg-[#EBFBF0]'
                      }`}
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EDE4D8] px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#3B2F27]">
                    <Truck className="w-3.5 h-3.5 text-[#207559]" />
                    {order.deliveryMethod}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-[#F3F9FF] border border-[#D8ECFF] px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#1B4E6B]">
                    <Clock className="w-3.5 h-3.5" />
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No date set'}
                  </span>
                </div>

                {order.proofOfPaymentUrl && (
                  <div className="flex items-center gap-3 p-3 bg-[#FFF7E6] border border-[#FDE1A8] rounded-2xl">
                    <a href={order.proofOfPaymentUrl} target="_blank" rel="noreferrer">
                      <img
                        src={order.proofOfPaymentUrl}
                        alt="Buyer's proof of payment"
                        className="w-14 h-14 rounded-xl object-cover border border-[#FDE1A8] shrink-0 cursor-pointer"
                      />
                    </a>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#92400E]">Buyer attached proof of payment</p>
                      <p className="text-[11px] text-[#7A5B0E]">Tap the photo to view it full-size before confirming.</p>
                    </div>
                    {order.paymentStatus === 'Pending Verification' && (
                      <button
                        onClick={() => markPaymentVerified(order.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer btn-bouncy"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Mark Verified
                      </button>
                    )}
                  </div>
                )}

                {/* Main Order Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Buyer & Meetup info */}
                  <div className="space-y-1.5 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A796D]">
                      Student Buyer
                    </p>
                    <p className="font-bold text-[#3B2F27] text-sm">{order.customerName}</p>
                    <p className="text-[#6E5D52] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#8C7A6D]" />
                      <span>{order.customerContact}</span>
                    </p>
                    <p className="text-[#207559] font-medium">📍 {order.customerUniversity}</p>
                  </div>

                  {/* Designated Meetup Spot */}
                  <div className="space-y-1.5 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A796D]">
                      Campus Meetup Spot
                    </p>
                    <div className="flex items-start gap-1.5 text-[#3B2F27] font-bold">
                      <MapPin className="w-4 h-4 text-[#207559] shrink-0 mt-0.5" />
                      <span>{order.meetupLocation}</span>
                    </div>
                    {order.notes && (
                      <p className="text-[11px] text-[#6E5D52] italic bg-white p-2 rounded-lg border border-[#E5DACD]">
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="space-y-2 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A796D]">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="min-w-0 flex items-center gap-1">
                            <span className="truncate max-w-[150px] font-medium text-[#3B2F27]">
                              {item.quantity}x {item.productName}
                            </span>
                            {item.isPreOrder && (
                              <span className="shrink-0 text-[8px] font-black uppercase text-[#1B4E6B] bg-[#A8D8EA] rounded-full px-1 py-0.5">Pre-Order</span>
                            )}
                          </span>
                          <span className="font-bold text-[#207559]">
                            {formatPHP(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.couponCode && (
                      <div className="flex justify-between items-center text-[11px] text-[#207559] font-semibold">
                        <span>Coupon "{order.couponCode}"</span>
                        <span>−{formatPHP(order.discountAmount || 0)}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-[#EDE4D8] flex justify-between font-black text-[#207559] text-xs">
                      <span>Total Amount:</span>
                      <span>{formatPHP(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-[#8C7A6D]">
                    Updating order status automatically synchronizes with seller financial revenue.
                  </span>

                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Preparing')}
                        className="px-3 py-1.5 bg-[#EBF5FB] hover:bg-[#DBEAFE] text-[#1E40AF] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Start Preparing 🥣
                      </button>
                    )}

                    {(order.orderStatus === 'Pending' || order.orderStatus === 'Preparing') && (
                      order.fulfillmentType === 'Dorm Delivery' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                          className="px-3 py-1.5 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Mark Out for Delivery 🚚
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          className="px-3 py-1.5 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Mark Ready for Meetup 📍
                        </button>
                      )
                    )}

                    {(order.orderStatus === 'Ready for Pickup' || order.orderStatus === 'Out for Delivery') && (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="px-4 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 btn-bouncy"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Order & Collect ₱ ✨</span>
                      </button>
                    )}

                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Completed' && (
                      <button
                        onClick={() => {
                          if (confirm('Cancel this order?')) {
                            updateOrderStatus(order.id, 'Cancelled');
                          }
                        }}
                        className="px-2.5 py-1.5 text-[#991B1B] hover:bg-[#FEE2E2]/60 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
