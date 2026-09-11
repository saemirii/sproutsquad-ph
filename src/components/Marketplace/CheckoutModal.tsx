import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  QrCode,
  Wallet,
  Coins,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Store
} from 'lucide-react';
import { useCart, useShop } from '../../context/AppContext';
import { CampusUniversity, PaymentMethod, FulfillmentType, DeliveryMethod } from '../../types';
import { formatPHP } from '../../utils/analytics';
import { triggerConfetti } from '../../utils/confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlacedSuccess: (createdOrders: any[]) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlacedSuccess,
}) => {
  const { cart, cartTotal, placeOrder } = useCart();
  const { businesses, activeBusiness } = useShop();

  const [customerName, setCustomerName] = useState('Mika Reyes');
  const [customerContact, setCustomerContact] = useState('0917-555-1234');
  const [customerUniversity, setCustomerUniversity] = useState<CampusUniversity>('Ateneo de Manila');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Lalamove');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('Campus Meetup');
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [meetupLocation, setMeetupLocation] = useState('Gonzaga Hall Cafeteria Booth #2');
  const [notes, setNotes] = useState('Will pickup during 11:30 AM class break! Thanks!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (!isOpen || cart.length === 0) return null;

  // Gather unique businesses in cart
  const cartBusinessIds = Array.from(new Set(cart.map((item) => item.product.businessId)));
  const cartBusinesses = businesses.filter((b) => cartBusinessIds.includes(b.id));

  const availablePickupSpots = cartBusinesses.flatMap((b) => b.campusPickupSpots || []);
  const uniqueSpots = Array.from(new Set(availablePickupSpots));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerContact) {
      alert('Please fill out your name and contact number.');
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    const result = await placeOrder({
      customerName,
      customerContact,
      customerUniversity,
      paymentMethod,
      fulfillmentType: deliveryMethod === 'Cash on Delivery' ? 'Dorm Delivery' : fulfillmentType,
      deliveryMethod,
      deliveryDate,
      meetupLocation: meetupLocation || 'Campus Student Center',
      notes,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setOrderError(`Sorry — ${result.failureReason}. Please update your cart and try again.`);
      return;
    }

    triggerConfetti();
    onClose();
    onOrderPlacedSuccess(result.orders);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A231E]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs p-5 border-b border-[#F0E9DF] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#B8E6D5] text-[#1B523E] flex items-center justify-center font-bold">
              🛍️
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                Campus Order & Meetup Checkout
              </h2>
              <p className="text-[11px] text-[#8C7A6D]">
                Connecting directly to student founder inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A6B5F] hover:text-[#3B2F27] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          {/* Order Summary Pill */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#4A3D35]">
              <span>Items in Order ({cart.length}):</span>
              <span className="text-[#207559] font-black text-sm">{formatPHP(cartTotal)}</span>
            </div>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-xs text-[#6E5D52]">
                  <span className="truncate max-w-[240px]">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-semibold text-[#3B2F27]">
                    {formatPHP(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Buyer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] flex items-center gap-1.5">
              <span>👤</span>
              <span>Student Buyer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                  Full Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                  Mobile / GCash Number
                </label>
                <input
                  type="text"
                  required
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="0917-XXX-XXXX"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Your Campus / University
              </label>
              <select
                value={customerUniversity}
                onChange={(e: any) => setCustomerUniversity(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              >
                <option value="MGC New Life Christian Academy">MGC New Life Christian Academy</option>
              </select>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] flex items-center gap-1.5">
              <span>🚚</span>
              <span>Delivery Option</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['Lalamove', 'J&T Express', 'Cash on Delivery'] as DeliveryMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setDeliveryMethod(method)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    deliveryMethod === method
                      ? 'bg-[#EBFBF0] border-[#10B981] text-[#065F46] font-bold shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E5DACD] text-[#54453C] hover:bg-[#F2EAE0]'
                  }`}
                >
                  <div className="text-lg mb-1">{method === 'Lalamove' ? '🚚' : method === 'J&T Express' ? '📦' : '💵'}</div>
                  <div className="text-[10px] font-bold leading-tight">{method}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Dispatch / Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] flex items-center gap-1.5">
              <span>📍</span>
              <span>{deliveryMethod === 'Cash on Delivery' ? 'Delivery Address / Drop Point' : 'Campus Meetup / Drop Point'}</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                {deliveryMethod === 'Cash on Delivery' ? 'Delivery destination or building access' : 'Select Designated Campus Spot'}
              </label>
              <select
                value={meetupLocation}
                onChange={(e) => setMeetupLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              >
                {deliveryMethod === 'Cash on Delivery' ? (
                  <>
                    <option value="Main Gate Security Booth">Main Gate Security Booth</option>
                    <option value="Dorm Lobby / Reception Desk">Dorm Lobby / Reception Desk</option>
                    <option value="College Building Admin Office">College Building Admin Office</option>
                    <option value="Home or Hostel Address">Home or Hostel Address</option>
                  </>
                ) : uniqueSpots.length > 0 ? (
                  uniqueSpots.map((spot, i) => (
                    <option key={i} value={spot}>
                      {spot}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Gonzaga Hall Cafeteria">Gonzaga Hall Cafeteria</option>
                    <option value="Sunken Garden Grandstand">Sunken Garden Grandstand</option>
                    <option value="Arch of the Centuries Plaza">Arch of the Centuries Plaza</option>
                    <option value="Henry Sy Sr. Hall Grounds">Henry Sy Sr. Hall Grounds</option>
                  </>
                )}
                <option value="Custom Meetup Spot">Other Location (Specify in notes)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Delivery / meetup instructions for seller (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={deliveryMethod === 'Cash on Delivery' ? 'e.g. Leave at dorm lobby and call when there is a courier update' : 'e.g. Meet between 1:00 PM and 1:30 PM near the bulletin board'}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D] flex items-center gap-1.5">
              <span>💳</span>
              <span>Payment Option (Simulated)</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('GCash')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'GCash'
                    ? 'bg-[#EBF5FB] border-[#3B82F6] text-[#1E40AF] font-bold shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E5DACD] text-[#54453C] hover:bg-[#F2EAE0]'
                }`}
              >
                <div className="text-lg mb-1">📱</div>
                <div className="text-xs font-bold">GCash</div>
                <div className="text-[10px] text-[#6B7280]">Scan/Direct</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Maya')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'Maya'
                    ? 'bg-[#EBFBF0] border-[#10B981] text-[#065F46] font-bold shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E5DACD] text-[#54453C] hover:bg-[#F2EAE0]'
                }`}
              >
                <div className="text-lg mb-1">💚</div>
                <div className="text-xs font-bold">Maya</div>
                <div className="text-[10px] text-[#6B7280]">Wallet QR</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Campus Meetup')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'Cash on Campus Meetup'
                    ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] font-bold shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E5DACD] text-[#54453C] hover:bg-[#F2EAE0]'
                }`}
              >
                <div className="text-lg mb-1">💵</div>
                <div className="text-xs font-bold">Cash</div>
                <div className="text-[10px] text-[#6B7280]">On Meetup</div>
              </button>
            </div>

            {/* GCash / Maya Details Box */}
            {paymentMethod !== 'Cash on Campus Meetup' && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE4D8] flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#E0D5C5]">
                  <QrCode className="w-7 h-7 text-[#2A231E]" />
                </div>
                <div className="text-[11px] text-[#54453C]">
                  <p className="font-bold">
                    Direct {paymentMethod} to Student Sellers:
                  </p>
                  <p className="text-[#8C7A6D]">
                    {cartBusinesses.map((b) => `${b.name}: ${b.gcashNumber}`).join(' • ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Place Order Button */}
          <div className="pt-3 border-t border-[#F0E9DF]">
            {orderError && (
              <p className="text-[11px] font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#EF4444]/30 rounded-xl px-3 py-2.5 mb-3">
                {orderError}
              </p>
            )}
            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Placing Order...' : `Confirm Order • ${formatPHP(cartTotal)}`}
              </span>
            </button>
            <p className="text-[10px] text-center text-[#8C7A6D] mt-2">
              🌱 This order will immediately appear in the student seller's Operating System dashboard.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
