import React, { useEffect, useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, MapPin, CheckCircle2, ArrowRight, Clock, Store, Tag, X, Instagram, PackageCheck, Star, ImagePlus, Loader2 } from 'lucide-react';
import { useCart, useShop, useSession } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { CampusUniversity, PaymentMethod, FulfillmentType, Order } from '../../types';
import { playIosTap, playIosSuccess } from '../../utils/haptics';
import { OrderStatusStepper } from '../Marketplace/OrderStatusStepper';
import { openExternalUrl } from '../../lib/platformLinks';
import { isNativeApp } from '../../utils/platform';

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
  } = useCart();
  const {
    orders,
    businesses,
    validateCoupon,
    confirmOrderReceived,
    myReviews,
    submitReview,
  } = useShop();
  const {
    currentUser,
    pendingNavigation,
    setPendingNavigation,
  } = useSession();

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

  const [orderError, setOrderError] = useState('');
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<{ orderId: string; message: string } | null>(null);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<{ orderId: string; message: string } | null>(null);
  const [expandedReviewOrderId, setExpandedReviewOrderId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { stars: number; comment: string; images: string[] }>>({});

  // A notification's deep link ("your order is ready") should land right on
  // that order, not just "somewhere in My Bag" — this jumps to Orders
  // History, scrolls the specific order into view, and briefly highlights
  // it, then clears the one-shot navigation request.
  useEffect(() => {
    if (pendingNavigation?.tab !== 'bag') return;
    setActiveSegment('orders');
    if (pendingNavigation.orderId) {
      const targetId = pendingNavigation.orderId;
      setHighlightedOrderId(targetId);
      setTimeout(() => {
        document.getElementById(`order-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      setTimeout(() => setHighlightedOrderId((current) => (current === targetId ? null : current)), 3500);
    }
    setPendingNavigation(null);
  }, [pendingNavigation]);

  const handleConfirmReceived = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    setConfirmError(null);
    playIosSuccess();
    const result = await confirmOrderReceived(orderId);
    setConfirmingOrderId(null);
    if (!result.success) setConfirmError({ orderId, message: result.message || 'Could not confirm this order right now.' });
  };

  // A star tap stages a draft (comment/photos are optional, added before the
  // real submit) rather than posting immediately — pre-filled from any
  // existing review so re-opening one to edit never silently drops a
  // previously attached comment/photos.
  const getReviewDraft = (orderId: string) => reviewDrafts[orderId] || {
    stars: myReviews[orderId]?.stars || 0,
    comment: myReviews[orderId]?.comment || '',
    images: myReviews[orderId]?.images || [],
  };

  const handleStarTap = (orderId: string, stars: number) => {
    playIosTap();
    setExpandedReviewOrderId(orderId);
    setReviewDrafts((prev) => ({
      ...prev,
      [orderId]: {
        stars,
        comment: prev[orderId]?.comment ?? (myReviews[orderId]?.comment || ''),
        images: prev[orderId]?.images ?? (myReviews[orderId]?.images || []),
      },
    }));
  };

  const handleDraftCommentChange = (orderId: string, comment: string) => {
    setReviewDrafts((prev) => ({ ...prev, [orderId]: { ...(prev[orderId] || getReviewDraft(orderId)), comment } }));
  };

  const handleDraftImageUpload = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Please choose an image smaller than 2MB.'); return; }
    if (getReviewDraft(orderId).images.length >= 3) { alert('You can attach up to 3 photos.'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setReviewDrafts((prev) => {
        const draft = prev[orderId] || getReviewDraft(orderId);
        return { ...prev, [orderId]: { ...draft, images: [...draft.images, dataUrl] } };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDraftImage = (orderId: string, idx: number) => {
    setReviewDrafts((prev) => {
      const draft = prev[orderId] || getReviewDraft(orderId);
      return { ...prev, [orderId]: { ...draft, images: draft.images.filter((_, i) => i !== idx) } };
    });
  };

  const handleSubmitReview = async (orderId: string) => {
    const draft = getReviewDraft(orderId);
    if (draft.stars < 1) return;
    setRatingOrderId(orderId);
    setRatingError(null);
    const result = await submitReview(orderId, draft.stars, draft.comment, draft.images);
    setRatingOrderId(null);
    if (result.success) {
      playIosSuccess();
      setExpandedReviewOrderId(null);
    } else {
      setRatingError({ orderId, message: result.message || "Couldn't submit your rating right now." });
    }
  };

  // RLS on `orders` lets a user read both orders they placed as a customer
  // AND every order on a business they own as a seller (so Shop OS's own
  // order manager works) — without this filter, a seller who's also placed
  // test orders as a buyer would see their own customers' orders mixed into
  // this personal "My Bag" screen, and tapping "I Received My Order" on one
  // would fail server-side since it genuinely isn't their order.
  const myOrders = orders.filter((order) => order.customerId === currentUser.id);

  // Active orders (still moving) surface above old completed/cancelled ones,
  // so a customer with order history doesn't have to hunt for the one that
  // actually needs their attention. Each group stays newest-first.
  const sortedOrders = [...myOrders].sort((a, b) => {
    const isDoneA = a.orderStatus === 'Completed' || a.orderStatus === 'Cancelled';
    const isDoneB = b.orderStatus === 'Completed' || b.orderStatus === 'Cancelled';
    if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setOrderError('');
    playIosSuccess();

    try {
      const result = await placeOrder({
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

      if (!result.success) {
        setOrderError(`Sorry — ${result.failureReason}. Please update your bag and try again.`);
        return;
      }

      setActiveSegment('orders');
      setAppliedCoupon(null);
      setCouponInput('');
      if (onOrderCompleted) {
        onOrderCompleted(result.orders);
      }
    } catch {
      setIsSubmitting(false);
      setOrderError('Something went wrong placing your order. Please try again.');
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
            📋 Orders History ({myOrders.length})
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

                {orderError && (
                  <p className="text-[11px] font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#EF4444]/30 rounded-xl px-3 py-2.5">
                    {orderError}
                  </p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] disabled:opacity-60 text-[#194E3B] font-black text-xs rounded-2xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Placing order...' : `Confirm Campus Order (${formatPHP(finalTotal)}) ✨`}</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* Orders History List */
          <div className="space-y-3">
            {sortedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EDE4D8] p-8 text-center space-y-2">
                <p className="text-xs text-[#6B5B4F]">No recorded campus orders yet.</p>
              </div>
            ) : (
              sortedOrders.map((order) => {
                const canConfirmReceived = order.orderStatus === 'Ready for Pickup' || order.orderStatus === 'Out for Delivery';
                const business = businesses.find((b) => b.id === order.businessId);
                const isHighlighted = order.id === highlightedOrderId;

                return (
                  <div
                    key={order.id}
                    id={`order-${order.id}`}
                    className={`bg-white rounded-2xl border p-3.5 space-y-3 shadow-xs transition-all duration-500 ${
                      isHighlighted ? 'border-[#207559] ring-2 ring-[#B8E6D5]' : 'border-[#EDE4D8]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C7A6D]">
                          {order.orderNumber} • {formatRelativeTime(order.createdAt)}
                        </span>
                        <p className="font-extrabold text-xs text-[#3B2F27] truncate">
                          {order.businessName}
                        </p>
                      </div>
                      <span className="font-black text-xs text-[#194E3B] shrink-0">
                        {formatPHP(order.totalAmount)}
                      </span>
                    </div>

                    <OrderStatusStepper status={order.orderStatus} fulfillmentType={order.fulfillmentType} />

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
                      {business?.instagramHandle && (
                        <a
                          href={`https://instagram.com/${business.instagramHandle.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // A native WKWebView's default target="_blank" handling has no
                            // "back to app" affordance — route through the Browser plugin
                            // there instead; web keeps the plain anchor behavior.
                            if (!isNativeApp) return;
                            e.preventDefault();
                            void openExternalUrl(`https://instagram.com/${business.instagramHandle!.replace(/^@/, '')}`);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#C13584] hover:underline"
                        >
                          <Instagram className="w-3 h-3" />
                          Message the shop
                        </a>
                      )}
                    </div>

                    {canConfirmReceived && (
                      <div className="pt-1 space-y-1.5">
                        <button
                          onClick={() => void handleConfirmReceived(order.id)}
                          disabled={confirmingOrderId === order.id}
                          className="btn-bouncy w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#B8E6D5] hover:bg-[#A3DEC9] disabled:opacity-60 text-[#194E3B] font-black text-xs cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          {confirmingOrderId === order.id ? 'Confirming...' : 'I Received My Order ✓'}
                        </button>
                        {confirmError?.orderId === order.id && (
                          <p className="text-[10px] font-bold text-[#991B1B] text-center">{confirmError.message}</p>
                        )}
                      </div>
                    )}

                    {order.orderStatus === 'Completed' && (() => {
                      const draft = getReviewDraft(order.id);
                      const isExpanded = expandedReviewOrderId === order.id;
                      const hasExistingReview = Boolean(myReviews[order.id]);
                      return (
                        <div className="pt-2 border-t border-[#EDE4D8] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-[#8C7A6D]">
                              {hasExistingReview ? 'Your rating' : 'Rate this shop'}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => handleStarTap(order.id, n)}
                                  disabled={ratingOrderId === order.id}
                                  title={`${n} star${n > 1 ? 's' : ''}`}
                                  className="p-0.5 disabled:opacity-50 cursor-pointer active:scale-90 transition-transform"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      n <= draft.stars ? 'fill-[#F7C948] text-[#F7C948]' : 'text-[#D7CBBE]'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={draft.comment}
                                onChange={(e) => handleDraftCommentChange(order.id, e.target.value)}
                                placeholder="Add a description (optional)"
                                rows={2}
                                className="w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5] resize-none"
                              />

                              <div className="flex items-center gap-2 flex-wrap">
                                {draft.images.map((img, idx) => (
                                  <div key={idx} className="relative w-12 h-12 shrink-0">
                                    <img src={img} alt="Attached" className="w-full h-full rounded-lg object-cover border border-[#E5DACD]" />
                                    <button
                                      onClick={() => handleRemoveDraftImage(order.id, idx)}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#3B2F27] text-white flex items-center justify-center cursor-pointer"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                                {draft.images.length < 3 && (
                                  <label className="w-12 h-12 shrink-0 rounded-lg border border-dashed border-[#D7CBBE] flex items-center justify-center cursor-pointer text-[#8C7A6D] hover:border-[#B8E6D5]">
                                    <ImagePlus className="w-4 h-4" />
                                    <input type="file" accept="image/*" onChange={(e) => handleDraftImageUpload(order.id, e)} className="sr-only" />
                                  </label>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => setExpandedReviewOrderId(null)}
                                  className="flex-1 rounded-xl border border-[#E5DACD] bg-white text-[#6B5B4F] text-[11px] font-black py-2 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => void handleSubmitReview(order.id)}
                                  disabled={ratingOrderId === order.id || draft.stars < 1}
                                  className="flex-1 rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-[11px] font-black py-2 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  {ratingOrderId === order.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : hasExistingReview ? 'Update review' : 'Submit review'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {ratingError?.orderId === order.id && (
                      <p className="text-[10px] font-bold text-[#991B1B] text-center">{ratingError.message}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
