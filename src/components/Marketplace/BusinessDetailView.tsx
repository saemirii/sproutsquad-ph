import React from 'react';
import {
  MapPin,
  Star,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Store,
  CheckCircle2,
  Calendar,
  Instagram,
  QrCode,
  Tag,
  Heart
} from 'lucide-react';
import { Business, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';

interface BusinessDetailViewProps {
  business: Business;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export const BusinessDetailView: React.FC<BusinessDetailViewProps> = ({
  business,
  onBack,
  onSelectProduct,
}) => {
  const { products, addToCart, setCurrentView, setSellerTab, setActiveBusiness, favoritedBusinessIds, toggleFavoriteBusiness } = useApp();
  const isFavorited = favoritedBusinessIds.includes(business.id);

  const bizProducts = products.filter((p) => p.businessId === business.id);

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-xs font-bold text-[#594A42] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Marketplace</span>
      </button>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-[#EDE4D8] shadow-xs">
        {/* Banner */}
        <div className="h-44 sm:h-56 w-full relative bg-[#FAF7F2]">
          <img
            src={business.banner}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Content */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <img
                src={business.logo}
                alt={business.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
              />
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">
                    {business.name}
                  </h1>
                  {business.badges.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B8E6D5] text-[#194E3B]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B5B4F] flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-[#194E3B]">
                    <MapPin className="w-3.5 h-3.5" />
                    {business.university}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-[#7A341A]">
                    <Star className="w-3.5 h-3.5 fill-[#FFD3BA] text-[#7A341A]" />
                    {business.rating} ({business.reviewCount} campus orders)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => void toggleFavoriteBusiness(business.id)}
                title={isFavorited ? 'Unfollow this shop' : 'Follow this shop for new-product & restock alerts'}
                className={`px-3 py-2 font-extrabold text-xs rounded-2xl border shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer btn-bouncy ${
                  isFavorited ? 'bg-[#FFD3BA] border-[#F8BA9E] text-[#7A341A]' : 'bg-white border-[#EDE4D8] text-[#6B5B4F] hover:border-[#F8BA9E]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#7A341A]' : ''}`} />
                <span>{isFavorited ? 'Following' : 'Follow'}</span>
              </button>

              {/* Quick Switch to Manage Business (For Demo ease!) */}
              <button
                onClick={() => {
                  setActiveBusiness(business);
                  setCurrentView('seller');
                  setSellerTab('overview');
                }}
                className="px-4 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-extrabold text-xs rounded-2xl border border-[#9FD9C3] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer btn-bouncy"
              >
                <Store className="w-4 h-4" />
                <span>Manage this Shop in Seller OS</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-[#6E5D52] max-w-3xl leading-relaxed">
            {business.description}
          </p>

          {/* Campus Meetup Spots Grid */}
          <div className="mt-6 pt-5 border-t border-[#F0E9DF] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-2">
              <h3 className="text-xs font-bold text-[#4A3D35] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#207559]" />
                <span>Designated Campus Meetup Locations:</span>
              </h3>
              <ul className="text-xs text-[#6E5D52] space-y-1">
                {business.campusPickupSpots.map((spot, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#207559]" />
                    <span>{spot}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EDE4D8] space-y-2">
              <h3 className="text-xs font-bold text-[#4A3D35] flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#207559]" />
                <span>Direct GCash & Contact:</span>
              </h3>
              <p className="text-xs text-[#6E5D52]">
                <strong className="text-[#3B2F27]">GCash:</strong> {business.gcashNumber}
              </p>
              {business.instagramHandle && (
                <p className="text-xs text-[#6E5D52]">
                  <strong className="text-[#3B2F27]">Instagram:</strong> {business.instagramHandle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products list for this business */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
              Products by {business.name} ({bizProducts.length})
            </h2>
            <p className="text-xs text-[#7A6B5F]">
              Handmade & baked fresh on campus
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {bizProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group bg-white rounded-2xl border border-[#EDE4D8] hover:border-[#B8E6D5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-4/3 overflow-hidden bg-[#FAF7F2] relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {product.inventoryCount <= 5 && product.inventoryCount > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF0E6] text-[#C2410C] border border-[#FFD3BA]">
                      Only {product.inventoryCount} left
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-[#3B2F27] group-hover:text-[#207559] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6E5D52] line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-[#207559] font-['Nunito',sans-serif]">
                      {formatPHP(product.price)}
                    </span>
                    <span className="text-[10px] text-[#8C7A6D] ml-1">/ {product.unit}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
