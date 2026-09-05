import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Store,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#2A231E]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#EDE4D8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-[#F0E9DF] flex items-center justify-between bg-[#FFFDF7]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B8E6D5] flex items-center justify-center text-[#1A4E3B]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                  Your Campus Cart
                </h2>
                <p className="text-[11px] text-[#8C7A6D]">
                  {cartCount} item{cartCount === 1 ? '' : 's'} from student sellers
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FAF4ED] flex items-center justify-center text-3xl">
                  🛒
                </div>
                <h3 className="font-bold text-sm text-[#3B2F27]">Your cart is empty</h3>
                <p className="text-xs text-[#8C7A6D] max-w-xs">
                  Discover delicious home bakes, handmade crochet, and stationery from students!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-[#B8E6D5] text-[#1A4E3B] font-bold text-xs rounded-xl hover:bg-[#A3DEC9] transition-colors cursor-pointer"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8]"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-18 h-18 rounded-xl object-cover border border-[#E5DACD]"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-[#207559] truncate">
                          {item.product.businessName}
                        </p>
                        <h4 className="font-bold text-xs text-[#3B2F27] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-black text-[#207559] mt-0.5">
                          {formatPHP(item.product.price)}
                        </p>
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#EDE4D8]/60">
                        <div className="flex items-center gap-1.5 bg-white border border-[#E0D5C5] rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#594A42] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-[11px] font-bold text-[#3B2F27]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#594A42] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#991B1B] hover:text-[#DC2626] p-1 text-xs cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-[#8C7A6D] hover:text-[#991B1B] underline cursor-pointer"
                  >
                    Clear entire cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#F0E9DF] bg-[#FFFDF7] space-y-3">
              <div className="space-y-1.5 text-xs text-[#6E5D52]">
                <div className="flex justify-between font-bold text-sm text-[#3B2F27] pt-1">
                  <span>Total Amount:</span>
                  <span className="text-[#207559] text-base font-black font-['Nunito',sans-serif]">
                    {formatPHP(cartTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7A6D] italic">
                  💡 Zero platform markup. 100% goes directly to student creators.
                </p>
              </div>

              <button
                id="cart-checkout-proceed-btn"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
              >
                <span>Proceed to Campus Meetup Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
