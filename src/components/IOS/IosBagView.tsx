import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, CheckCircle2, ArrowRight, Clock, Store, Tag, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';
import { CampusUniversity, PaymentMethod, FulfillmentType, Order } from '../../types';
import { playIosTap, playIosSuccess } from '../../utils/haptics';

interface IosBagViewProps {
  onOpenCheckoutModal?: () => void;
  onExploreMarket?: () => void;
  onOrderCompleted?: (orders: Order[]) => void;
}

export const IosBagView: React.FC<IosBagViewProps> = ({
  onOpenCheckoutModal,
  onExploreMarket,
  onOrderCompleted,
}) => {
  const {
    cart,
    cartCount,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    orders,
    currentUser,
    validateCoupon,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<'bag' | 'orders'>('bag');
  const [customerName, setCustomerName] = useState(currentUser.name);
  const [customerContact, setCustomerContact] = useState('0917-888-2345');
  const [customerUniversity, setCustomerUniversity] = useState<CampusUniversity>(currentUser.university);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('Campus Meetup');
  const [meetupLocation, setMeetupLocation] = useState('Gonzaga Hall Entrance / Main Quad');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    setCouponError('');
    const businessIdsInCart = Array.from(new Set(cart.map((item) => item.product.businessId)));

    for (const businessId of businessIdsInCart) {
      const subtotalForBusiness = cart
        .filter((item) => item.product.businessId === businessId)
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const result = validateCoupon(couponInput, businessId, subtotalForBusiness);
      if ('coupon' in result) {
        setAppliedCoupon({ code: result.coupon.code, discount: result.discount });
        playIosSuccess();
        return;
      }
    }
    setAppliedCoupon(null);
    setCouponError('That coupon code is not valid for the items in your bag.');
  };

  const discount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const campusPickupSpots: Record<CampusUniversity, string[]> = {
    'MGC New Life Christian Academy': ['Main Gate', 'Student Center', 'Covered Court', 'Library Entrance'],
    'UP Diliman': ['Sunken Garden Bleachers', 'Vinzons Hall', 'AS Steps / Palma Hall', 'Area 2 Food Stalls'],
    'Ateneo de Manila': ['Gonzaga Hall Walkway', 'SEC Foyer', 'Kostka Extension', 'Xavier Hall steps'],
    'UST Manila': ['Arch of the Centuries', 'Plaza Mayor benches', 'Albertus Magnus bldg', 'Carpa Stalls'],
    'DLSU Manila': ['Henry Sy Grounds', 'Yuch Hall lobby', 'Bloemen Hall cafeteria', 'Agno Food Court'],
    'PUP Sta. Mesa': ['Mabini Obelisk', 'Linear Park lagoon', 'Main Building East Wing', 'Charlie Del Rosario'],
    'Mapua University': ['Intramuros Main Gate', 'Student Lounge', 'South Building Courtyard'],
    'FEU Manila': ['Freedom Park benches', 'FEU Chapel grounds', 'Admin Building gazebo'],
    'Polytechnic & State Universities': ['Main Gate Security / Guard Post', 'Student Activity Center', 'Library Steps'],
    'All Campuses': ['Campus Main Gate Security', 'Central Cafeteria entrance', 'Student Union Building'],
  };

  const currentSpots = campusPickupSpots[customerUniversity] || campusPickupSpots['All Campuses'];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    playIosSuccess();

    try {
      const createdOrders = placeOrder({
        customerName: customerName || 'Student Shopper',
        customerContact: customerContact || '0917-000-0000',
        customerUniversity,
        paymentMethod,
        fulfillmentType,
        meetupLocation,
        notes,
        couponCode: appliedCoupon?.code,
      });

      setIsSubmitting(false);
      setActiveSegment('orders');
      setAppliedCoupon(null);
      setCouponInput('');
      if (onOrderCompleted) {
        onOrderCompleted(createdOrders);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9E6]">
      {/* iOS Segmented Control Header */}
      <div className="sticky top-0 z-20 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <h1 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
            Bag & Meetup Drops
          </h1>
          <span className="text-[11px] font-bold text-[#6B5B4F]">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in bag
          </span>
        </div>

        <div className="bg-[#FAF3DE] p-1 rounded-2xl flex items-center border border-[#EDE4D8]">
          <button
            onClick={() => {
              playIosTap();
              setActiveSegment('bag');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSegment === 'bag'
                ? 'bg-white text-[#194E3B] shadow-xs border border-[#EDE4D8]'
                : 'text-[#6B5B4F] hover:text-[#3B2F27]'
            }`}
          >
            🛍️ Active Bag ({cartCount})
          </button>
          <button
            onClick={() => {
              playIosTap();
              setActiveSegment('orders');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSegment === 'orders'
                ? 'bg-white text-[#194E3B] shadow-xs border border-[#EDE4D8]'
                : 'text-[#6B5B4F] hover:text-[#3B2F27]'
            }`}
          >
            📋 Orders History ({orders.length})
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-20">
        {activeSegment === 'bag' ? (
          cart.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-[#EDE4D8] p-8 text-center space-y-3 mt-4">
              <div className="w-16 h-16 bg-[#FFF0E6] rounded-2xl mx-auto flex items-center justify-center text-3xl">
                🐰
              </div>
              <h2 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                Your bag is empty!
              </h2>
              <p className="text-xs text-[#6B5B4F] max-w-xs mx-auto">
                Support student makers by browsing freshly baked cookies, hand-made crochet, and study stationery on campus.
              </p>
              {onExploreMarket && (
                <button
                  onClick={() => {
                    playIosTap();
                    onExploreMarket();
                  }}
                  className="px-5 py-2.5 bg-[#B8E6D5] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Browse Campus Marketplace →
                </button>
              )}
            </div>
          ) : (
            /* Items & Checkout Form */
            <div className="space-y-4">
              {/* Cart Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#8C7A6D] uppercase tracking-wider">
                    Selected Items
                  </span>
                  <button
                    onClick={() => {
                      playIosTap();
                      clearCart();
                    }}
                    className="text-[11px] text-[#A39284] hover:text-[#7A341A] font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl border border-[#EDE4D8] p-3 flex items-center gap-3 shadow-xs"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#EDE4D8]"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#8C7A6D] truncate">
                        {item.product.businessName}
                      </p>
                      <h4 className="font-extrabold text-xs text-[#3B2F27] truncate font-['Nunito',sans-serif]">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-black text-[#194E3B] mt-0.5">
                        {formatPHP(item.product.price)}
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-1.5 bg-[#FAF3DE] px-2 py-1 rounded-xl border border-[#EDE4D8]">
                      <button
                        onClick={() => {
                          playIosTap();
                          updateCartQuantity(item.product.id, item.quantity - 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-white text-[#6B5B4F] flex items-center justify-center text-xs font-bold active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-[#3B2F27] w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          playIosTap();
                          updateCartQuantity(item.product.id, item.quantity + 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-white text-[#6B5B4F] flex items-center justify-center text-xs font-bold active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campus Meetup Logistics */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#EDE4D8] pb-2">
                  <span className="text-base">📍</span>
                  <h3 className="font-extrabold text-xs text-[#3B2F27] font-['Nunito',sans-serif]">
                    Campus Hand-off Location
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#6B5B4F] block">
                    Campus Hand-off Spot:
                  </label>
                  <select
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full bg-[#FAF3DE] border border-[#EDE4D8] rounded-xl px-3 py-2 text-xs font-semibold text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  >
                    {currentSpots.map((spot) => (
                      <option key={spot} value={spot}>
                        {spot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B5B4F] block">
                    Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['GCash', 'Maya', 'Cash on Campus Meetup'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          playIosTap();
                          setPaymentMethod(method);
                        }}
                        className={`p-2 rounded-xl text-[10px] font-black border transition-all text-center ${
                          paymentMethod === method
                            ? 'bg-[#B8E6D5] text-[#194E3B] border-[#9FD9C3] shadow-xs'
                            : 'bg-[#FAF3DE] text-[#6B5B4F] border-[#EDE4D8]'
                        }`}
                      >
                        {method === 'GCash' && '📱 GCash'}
                        {method === 'Maya' && '💳 Maya'}
                        {method === 'Cash on Campus Meetup' && '💵 Cash'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Contact */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#8C7A6D] block">Your Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#FAF3DE] border border-[#EDE4D8] rounded-xl px-2.5 py-1.5 text-xs text-[#3B2F27]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#8C7A6D] block">Contact Number</label>
                    <input
                      type="text"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full bg-[#FAF3DE] border border-[#EDE4D8] rounded-xl px-2.5 py-1.5 text-xs text-[#3B2F27]"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-4 shadow-xs">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-2 bg-[#EAF6F0] border border-[#9FD9C3] rounded-xl px-3 py-2">
                    <span className="flex items-center gap-1.5 text-xs font-black text-[#194E3B]">
                      <Tag className="w-3.5 h-3.5" />
                      {appliedCoupon.code} applied — −{formatPHP(appliedCoupon.discount)}
                    </span>
                    <button
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); }}
                      className="p-1 rounded-lg text-[#207559] hover:bg-white/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#6B5B4F] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#8C7A6D]" />
                      Have a coupon code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                        placeholder="e.g. WELCOME10"
                        className="min-w-0 flex-1 bg-[#FAF3DE] border border-[#EDE4D8] rounded-xl px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-[#3B2F27]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim()}
                        className="px-3.5 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-xl disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-[#991B1B]">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Order Breakdown & Submit */}
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-4 space-y-3 shadow-xs">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6B5B4F]">
                    <span>Items Subtotal:</span>
                    <span>{formatPHP(cartTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#207559] font-bold">
                      <span>Coupon Discount:</span>
                      <span>−{formatPHP(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#194E3B] font-bold">
                    <span>Campus Meetup Fee:</span>
                    <span>FREE ₱0</span>
                  </div>
                  <div className="pt-2 border-t border-[#EDE4D8] flex justify-between font-black text-sm text-[#3B2F27]">
                    <span>Total Amount:</span>
                    <span className="text-[#194E3B]">{formatPHP(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Campus Order ({formatPHP(finalTotal)}) ✨</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* Orders History List */
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-8 text-center space-y-2">
                <p className="text-xs text-[#6B5B4F]">No recorded campus orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#EDE4D8] p-3.5 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#8C7A6D]">
                        {order.orderNumber}
                      </span>
                      <p className="font-extrabold text-xs text-[#3B2F27] truncate">
                        {order.businessName}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        order.orderStatus === 'Completed'
                          ? 'bg-[#B8E6D5] text-[#194E3B]'
                          : order.orderStatus === 'Preparing'
                          ? 'bg-[#FFD3BA] text-[#7A341A]'
                          : 'bg-[#A8D8EA] text-[#1B4E6B]'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-[#6B5B4F]">
                        <span className="flex items-center gap-1">
                          {it.quantity}x {it.productName}
                          {it.isPreOrder && (
                            <span className="shrink-0 text-[8px] font-black uppercase text-[#1B4E6B] bg-[#A8D8EA] rounded-full px-1 py-0.5">Pre-Order</span>
                          )}
                        </span>
                        <span className="font-bold text-[#3B2F27]">
                          {formatPHP(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#EDE4D8] flex items-center justify-between text-[11px] text-[#6B5B4F]">
                    <span className="flex items-center gap-1 text-[10px]">
                      <MapPin className="w-3 h-3 text-[#194E3B]" />
                      {order.meetupLocation}
                    </span>
                    <span className="font-black text-xs text-[#194E3B]">
                      {formatPHP(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
