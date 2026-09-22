import React, { useState, useMemo } from 'react';
import { Search, MapPin, ChevronDown, ShoppingBag, Star, Sparkles, Filter, X } from 'lucide-react';
import { useShop, useCart, useSession } from '../../context/AppContext';
import { Product, ProductCategory, CampusUniversity, Business } from '../../types';
import { formatPHP } from '../../utils/analytics';
import { CampusStories } from './CampusStories';
import { playIosTap, playIosSuccess } from '../../utils/haptics';
import { Icon } from '../Icon';

interface IosMarketplaceViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectBusiness: (business: Business) => void;
  onShowAlert?: (icon: string, title: string, subtitle?: string) => void;
}

export const IosMarketplaceView: React.FC<IosMarketplaceViewProps> = ({
  onSelectProduct,
  onSelectBusiness,
  onShowAlert,
}) => {
  const {
    products,
    businesses,
    activeBusiness,
    setActiveBusiness,
    accessibleBusinessIds,
  } = useShop();
  const { addToCart, cartCount } = useCart();
  const { selectedCampusFilter, setSelectedCampusFilter } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [isCampusSheetOpen, setIsCampusSheetOpen] = useState(false);
  const [isBizSheetOpen, setIsBizSheetOpen] = useState(false);
  // Hidden by default — there's no point browsing something you can no
  // longer buy; this just lets someone opt back in to see them.
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Art & Creative',
    'Fashion & Accessories',
    'Food & Drinks',
    'Lifestyle & Gifts',
    'Digital & Tech',
    'Beauty & Self-Care',
    'Education & Services',
  ];

  const campuses: (CampusUniversity | 'All Campuses')[] = [
    'All Campuses',
    'MGC New Life Christian Academy',
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesCampus = selectedCampusFilter === 'All Campuses' || p.university === selectedCampusFilter;
      // Product Drop Scheduler: hide anything scheduled for a future drop —
      // it shows up automatically once that moment passes, no seller action needed.
      const hasDropped = !p.dropDate || new Date(p.dropDate).getTime() <= Date.now();
      const matchesStock = showSoldOut || p.inventoryCount > 0;

      return matchesSearch && matchesCategory && matchesCampus && hasDropped && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedCampusFilter, showSoldOut]);

  const handleQuickAdd = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.inventoryCount <= 0) return;
    if (accessibleBusinessIds.includes(product.businessId)) {
      onShowAlert?.('badge-low-stock', "That's your own shop", "You can't buy your own business' products.");
      return;
    }
    playIosSuccess();
    const { added, available, blocked } = await addToCart(product, 1);

    if (blocked === 'own-business') {
      onShowAlert?.('badge-low-stock', "That's your own shop", "You can't buy your own business' products.");
      return;
    }

    if (added <= 0) {
      onShowAlert?.(
        'badge-low-stock',
        available <= 0 ? `${product.name} just sold out` : `${product.name} is already in your bag`,
        available <= 0 ? 'Sorry — someone else got the last one.' : `Only ${available} available — you already have them all.`
      );
      return;
    }
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1000);
    onShowAlert?.('tab-my-bag', `Added ${product.name}`, `${formatPHP(product.price)} • In your bag`);
  };

  return (
    <div className="flex flex-col space-y-3.5 pb-6">
      
      {/* iOS Top App Header */}
      <div className="px-4 pt-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Icon name="level-sprout" className="w-4 h-4" />
            <h1 className="font-black text-xl tracking-tight text-[#3B2F27] font-['Nunito',sans-serif]">
              Sprout<span className="text-[#194E3B]">Squad</span>
            </h1>
          </div>
          <p className="text-[10px] text-[#6B5B4F] font-medium">
            Philippine Campus Student Marketplace
          </p>
        </div>

        {/* Campus Location Picker Button */}
        <button
          onClick={() => {
            playIosTap();
            setIsCampusSheetOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF3DE] border border-[#EDE4D8] rounded-2xl text-xs font-bold text-[#194E3B] shadow-xs active:scale-95 transition-transform"
        >
          <MapPin className="w-3.5 h-3.5 text-[#194E3B]" />
          <span className="truncate max-w-[100px] text-[11px]">{selectedCampusFilter}</span>
          <ChevronDown className="w-3 h-3 text-[#6B5B4F]" />
        </button>
      </div>

      {/* iOS Search Bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C7A6D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student bakes, crochet, stickers..."
            className="w-full pl-10 pr-9 py-2 bg-[#FAF3DE] border border-[#EDE4D8] rounded-2xl text-xs text-[#3B2F27] placeholder:text-[#8C7A6D] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                playIosTap();
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EDE4D8] text-[#6B5B4F] flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Campus Stories Carousel of Student Shops */}
      <div className="px-3">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] font-extrabold text-[#8C7A6D] uppercase tracking-wider">
            Verified Student Makers
          </span>
        </div>
        <CampusStories onSelectBusiness={onSelectBusiness} categoryFilter={selectedCategory} />
      </div>

      {/* Category Filter Pills (Horizontal Scroll) */}
      <div className="px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playIosTap();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedCategory === cat
                ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3] shadow-xs'
                : 'bg-white text-[#6B5B4F] border border-[#EDE4D8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid (2-Column Mobile Feed) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[11px] font-bold text-[#8C7A6D] shrink-0">
            {filteredProducts.length} campus creations
          </span>
          <button
            onClick={() => {
              playIosTap();
              setShowSoldOut((v) => !v);
            }}
            className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-all active:scale-95 ${
              showSoldOut ? 'bg-[#B8E6D5] text-[#194E3B] border-[#9FD9C3]' : 'bg-white text-[#6B5B4F] border-[#EDE4D8]'
            }`}
          >
            {showSoldOut ? '✓ ' : ''}Show sold out
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-8 text-center space-y-2">
            <Icon name="level-sprout" className="w-8 h-8 mx-auto" />
            <p className="font-bold text-xs text-[#3B2F27]">No creations found</p>
            <p className="text-[11px] text-[#6B5B4F]">Try adjusting your search or campus filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCampusFilter('All Campuses');
                setShowSoldOut(false);
              }}
              className="mt-2 px-3 py-1.5 bg-[#B8E6D5] text-[#194E3B] text-[11px] font-bold rounded-xl"
            >
              Reset All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.inventoryCount <= 0;
              const isLowStock = product.inventoryCount > 0 && product.inventoryCount <= 5;
              const isOwnProduct = accessibleBusinessIds.includes(product.businessId);

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    playIosTap();
                    onSelectProduct(product);
                  }}
                  className="bg-white rounded-2xl border border-[#EDE4D8] overflow-hidden flex flex-col justify-between shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative aspect-square overflow-hidden bg-[#FAF3DE]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Category Chip */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black bg-[#A8D8EA] text-[#1B4E6B] shadow-xs">
                        {product.category.split(' ')[0]}
                      </span>

                      {/* Bundle / Pre-Order Chip */}
                      {product.bundledProductIds && product.bundledProductIds.length > 0 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-black bg-[#B8E6D5] text-[#194E3B] shadow-xs flex items-center gap-1">
                          <Icon name="bundle-badge" className="w-2.5 h-2.5" /> Bundle
                        </span>
                      )}
                      {product.isPreOrder && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-black bg-[#FFD3BA] text-[#7A341A] shadow-xs flex items-center gap-1">
                          <Icon name="pre-order-badge" className="w-2.5 h-2.5" /> Pre-Order
                        </span>
                      )}

                      {/* Stock Warning */}
                      {isLowStock && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-black bg-[#FFD3BA] text-[#7A341A]">
                          Only {product.inventoryCount} left
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-black bg-[#FAF3DE] text-[#8C7A6D]">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 space-y-1">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          const biz = businesses.find((b) => b.id === product.businessId);
                          if (biz) onSelectBusiness(biz);
                        }}
                        className="text-[10px] text-[#8C7A6D] font-medium truncate w-fit cursor-pointer"
                      >
                        {product.businessName}
                      </p>
                      <h3 className="font-extrabold text-xs text-[#3B2F27] line-clamp-1 font-['Nunito',sans-serif]">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-[#194E3B] font-bold flex items-center gap-1">
                        <Icon name="campus-pin" className="w-2.5 h-2.5" /> {product.university.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Bag Row */}
                  <div className="p-2.5 pt-0">
                    <div className="pt-2 border-t border-[#EDE4D8] flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs text-[#194E3B] font-['Nunito',sans-serif]">
                          {formatPHP(product.price)}
                        </span>
                      </div>

                      <button
                        disabled={isOutOfStock || isOwnProduct}
                        onClick={(e) => handleQuickAdd(e, product)}
                        title={isOwnProduct ? "That's your own shop's product" : undefined}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          isOutOfStock || isOwnProduct
                            ? 'bg-[#FAF3DE] text-[#A39284] cursor-not-allowed'
                            : quickAddedId === product.id
                            ? 'bg-[#194E3B] text-white'
                            : 'bg-[#B8E6D5] text-[#194E3B] active:scale-90 shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* iOS Action Sheet: Campus Selector */}
      {isCampusSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 space-y-4 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-[#D4C8B8] rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#3B2F27] flex items-center gap-1.5">
                  Select Campus <Icon name="select-campus" className="w-4 h-4" />
                </h3>
                <p className="text-[11px] text-[#6B5B4F]">Filter student goods by university</p>
              </div>
              <button
                onClick={() => setIsCampusSheetOpen(false)}
                className="p-1.5 rounded-full bg-[#FAF3DE] text-[#6B5B4F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {campuses.map((camp) => (
                <button
                  key={camp}
                  onClick={() => {
                    playIosTap();
                    setSelectedCampusFilter(camp);
                    setIsCampusSheetOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center justify-between ${
                    selectedCampusFilter === camp
                      ? 'bg-[#B8E6D5] text-[#194E3B] border border-[#9FD9C3]'
                      : 'hover:bg-[#FAF3DE] text-[#3B2F27]'
                  }`}
                >
                  <span>{camp}</span>
                  {selectedCampusFilter === camp && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
