import React, { useState } from 'react';
import {
  X,
  MapPin,
  Sparkles,
  ShoppingBag,
  Store,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Minus,
  Tag
} from 'lucide-react';
import { Product, Business } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onViewBusiness: (biz: Business) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onViewBusiness,
}) => {
  const { businesses, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const business = businesses.find((b) => b.id === product.businessId);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="bg-white rounded-t-[36px] sm:rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* iOS Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-[#D4C8B8] rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 p-2 rounded-full bg-[#FAF3DE] hover:bg-[#EDE4D8] text-[#3B2F27] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col">
          {/* Product Image */}
          <div className="relative aspect-4/3 w-full bg-[#FAF7F2] overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[#3B2F27]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl">
              📍 {product.university}
            </div>
          </div>

          {/* Product Content & Actions */}
          <div className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              {/* Seller badge */}
              {business && (
                <button
                  onClick={() => {
                    onClose();
                    onViewBusiness(business);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#FAF3DE] hover:bg-[#F2EAE0] border border-[#EDE4D8] text-xs font-bold text-[#194E3B] transition-colors cursor-pointer active:scale-95"
                >
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{business.name}</span>
                </button>
              )}

              <h2 className="text-xl font-black text-[#3B2F27] font-['Nunito',sans-serif] leading-tight">
                {product.name}
              </h2>

              {/* Price & Unit */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#194E3B] font-['Nunito',sans-serif]">
                  {formatPHP(product.price)}
                </span>
                <span className="text-xs text-[#8C7A6D]">
                  / {product.unit}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#6B5B4F] leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FAF3DE] text-[#6B5B4F]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Campus Meetup Locations Info */}
              {business && business.campusPickupSpots && (
                <div className="p-3 bg-[#FAF3DE] rounded-2xl border border-[#EDE4D8] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3B2F27]">
                    <MapPin className="w-3.5 h-3.5 text-[#194E3B]" />
                    <span>Campus Pickup Spots:</span>
                  </div>
                  <ul className="text-[11px] text-[#6B5B4F] space-y-0.5 list-disc list-inside">
                    {business.campusPickupSpots.slice(0, 3).map((spot, i) => (
                      <li key={i}>{spot}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add Button */}
            <div className="space-y-3 pt-3 border-t border-[#EDE4D8]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3B2F27]">Quantity:</span>
                <div className="flex items-center gap-2 bg-[#FAF3DE] border border-[#EDE4D8] rounded-xl p-1">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white text-[#3B2F27] flex items-center justify-center font-bold disabled:opacity-40 active:scale-90 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-[#3B2F27]">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.inventoryCount}
                    onClick={() => setQuantity(Math.min(product.inventoryCount, quantity + 1))}
                    className="w-7 h-7 rounded-lg bg-white text-[#3B2F27] flex items-center justify-center font-bold disabled:opacity-40 active:scale-90 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                id="modal-add-to-cart-btn"
                disabled={product.inventoryCount <= 0}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 ${
                  product.inventoryCount <= 0
                    ? 'bg-[#FAF3DE] text-[#A39284] cursor-not-allowed'
                    : isAdded
                    ? 'bg-[#194E3B] text-white'
                    : 'bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {product.inventoryCount <= 0
                    ? 'Out of Stock'
                    : isAdded
                    ? 'Added to Bag! ✨'
                    : `Add ${quantity} to Bag • ${formatPHP(product.price * quantity)}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
