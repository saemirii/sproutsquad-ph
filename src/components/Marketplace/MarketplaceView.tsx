import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  ShoppingBag,
  Store,
  Star,
  CheckCircle2,
  Tag,
  ArrowRight,
  TrendingUp,
  Package,
  Heart
} from 'lucide-react';
import { useShop, useCart, useSession } from '../../context/AppContext';
import { Product, ProductCategory, CampusUniversity, Business } from '../../types';
import { formatPHP } from '../../utils/analytics';

interface MarketplaceViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectBusiness: (business: Business) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onSelectProduct,
  onSelectBusiness,
}) => {
  const {
    products,
    businesses,
    setActiveBusiness
  } = useShop();
  const { addToCart } = useCart();
  const {
    selectedCampusFilter,
    setSelectedCampusFilter,
    setCurrentView,
    setSellerTab,
  } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'name'>('popular');
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

      return matchesSearch && matchesCategory && matchesCampus;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.soldCount - a.soldCount;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedCampusFilter, sortBy]);

  // Featured Shops respects the same category/campus filters as the product
  // grid — previously the category pills only ever filtered products, so
  // every shop stayed listed no matter which category was selected.
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      const matchesCategory = selectedCategory === 'All' || biz.category === selectedCategory;
      const matchesCampus = selectedCampusFilter === 'All Campuses' || biz.university === selectedCampusFilter;
      return matchesCategory && matchesCampus;
    });
  }, [businesses, selectedCategory, selectedCampusFilter]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.inventoryCount <= 0) return;
    addToCart(product, 1);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Philippine Student Context */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#EDE4D8] p-6 sm:p-10 shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#EADBCE] text-[#7A341A] text-xs font-bold mb-4">
            <span className="text-sm">✨</span>
            <span>Support Student Makers Across Philippine Universities</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#3B2F27] tracking-tight font-['Nunito',sans-serif] leading-tight">
            Fresh treats, crafts & essentials made by your campus classmates.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#6B5B4F] leading-relaxed">
            Order for quick campus handoff at Gonzaga Hall, Sunken Garden, Arch of the Centuries, or Henry Sy. Every order feeds real-time financial tracking for the student maker!
          </p>

          {/* Quick Flow Visual Indicator */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B5B4F]">
            <span className="px-3 py-1.5 bg-[#FFF9E6] rounded-2xl border border-[#EDE4D8]">
              🐰 1. Browse Student Drops
            </span>
            <span className="text-[#A39284]">→</span>
            <span className="px-3 py-1.5 bg-[#A8D8EA] text-[#1B4E6B] rounded-2xl border border-[#8EC7DC] font-bold">
              🐥 2. Meetup at Campus Spot
            </span>
            <span className="text-[#A39284]">→</span>
            <span className="px-3 py-1.5 bg-[#B8E6D5] text-[#194E3B] rounded-2xl border border-[#9FD9C3] font-bold">
              🦉 3. Feeds Seller Health Score 📈
            </span>
          </div>
        </div>

        {/* Mascot Mascot Decoration */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
          <div className="bg-[#FFF9E6] p-4 rounded-3xl border border-[#EDE4D8] shadow-sm max-w-xs text-xs text-[#6B5B4F] space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD3BA] border border-[#F8BA9E] flex items-center justify-center text-xl shadow-xs">
                🐰
              </div>
              <div>
                <p className="font-extrabold text-xs text-[#3B2F27] font-['Nunito',sans-serif]">
                  Bella the Bunny
                </p>
                <span className="text-[10px] font-bold text-[#7A341A] bg-[#FFD3BA] px-1.5 py-0.5 rounded-md">
                  Campus Guide
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#6B5B4F] leading-relaxed">
              "When you place an order here, it automatically updates the student's revenue, calculates their profit margin, and feeds their Health Score!"
            </p>
          </div>
        </div>
      </section>

      {/* Featured Student Businesses Carousel / Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
              Featured Student Shops 🌱
            </h2>
            <p className="text-xs text-[#7A6B5F]">
              Verified student-run ventures with active campus meetup spots
            </p>
          </div>
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 text-center text-xs text-[#7A6B5F]">
            No shops match this category yet.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBusinesses.map((biz) => (
            <div
              key={biz.id}
              onClick={() => onSelectBusiness(biz)}
              className="group bg-white rounded-3xl border border-[#EDE4D8] hover:border-[#B8E6D5] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between btn-bouncy"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={biz.logo}
                    alt={biz.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#EDE4D8] group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-[#3B2F27] truncate group-hover:text-[#194E3B] transition-colors font-['Nunito',sans-serif]">
                      {biz.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#6B5B4F] mt-0.5">
                      <MapPin className="w-3 h-3 text-[#194E3B]" />
                      <span className="truncate">{biz.university}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#6B5B4F] line-clamp-2 leading-relaxed">
                  {biz.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 font-bold text-[#7A341A] bg-[#FFD3BA] px-2.5 py-1 rounded-xl text-[11px]">
                  <Star className="w-3 h-3 fill-[#7A341A] text-[#7A341A]" />
                  <span>{biz.rating} ({biz.reviewCount})</span>
                </div>

                <span className="text-xs font-extrabold text-[#194E3B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Shop <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        {/* Campus Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[#8A796D] uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-[#207559]" />
            Campus:
          </span>
          {campuses.map((camp) => (
            <button
              key={camp}
              onClick={() => setSelectedCampusFilter(camp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCampusFilter === camp
                  ? 'bg-[#B8E6D5] text-[#1B523E] border border-[#94D6C0] shadow-xs'
                  : 'bg-white text-[#6E5D52] border border-[#E8DFC8] hover:bg-[#FAF5ED]'
              }`}
            >
              {camp}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white p-3 rounded-2xl border border-[#EDE4D8] shadow-xs">
          {/* Search Field */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#9C8C7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cookies, crochet, stickers..."
              className="w-full pl-9.5 pr-4 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs sm:text-sm text-[#4A3D35] placeholder:text-[#9C8C7E] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8C7E] hover:text-[#4A3D35]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FFD3BA] text-[#7A2E1E] font-bold border border-[#F5BE9E]'
                    : 'bg-[#FAF7F2] text-[#6E5D52] hover:bg-[#F2EAE0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#8A796D] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E5DACD] text-[#52443C] text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#8A796D] uppercase tracking-wider">
            Showing {filteredProducts.length} campus creations
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-[#FFF0E6] text-[#E07A5F] rounded-2xl mx-auto flex items-center justify-center text-2xl">
              🌱
            </div>
            <h3 className="font-bold text-base text-[#3B2F27]">No products found matching filters</h3>
            <p className="text-xs text-[#7A6B5F] max-w-sm mx-auto">
              Try clearing your search query or selecting "All Campuses" to see more student goods.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCampusFilter('All Campuses');
              }}
              className="px-4 py-2 bg-[#B8E6D5] text-[#1A4E3B] rounded-xl text-xs font-bold hover:bg-[#A3DEC9] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const isLowStock = product.inventoryCount > 0 && product.inventoryCount <= 5;
              const isOutOfStock = product.inventoryCount === 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-3xl border border-[#EDE4D8] hover:border-[#B8E6D5] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between btn-bouncy"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-4/3 overflow-hidden bg-[#FFF9E6]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Badges on Image */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#A8D8EA] text-[#1B4E6B] shadow-xs">
                          {product.category}
                        </span>
                        {isLowStock && (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#FFD3BA] text-[#7A341A] border border-[#F8BA9E]">
                            Only {product.inventoryCount} left
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#FAF3DE] text-[#8C7A6D]">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* University Tag */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/95 text-[#3B2F27] shadow-xs">
                          📍 {product.university}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-1.5">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          const biz = businesses.find((b) => b.id === product.businessId);
                          if (biz) onSelectBusiness(biz);
                        }}
                        className="text-[11px] text-[#8C7A6D] font-medium truncate hover:text-[#207559] hover:underline w-fit cursor-pointer"
                      >
                        {product.businessName}
                      </p>

                      <h3 className="font-extrabold text-sm text-[#3B2F27] group-hover:text-[#194E3B] transition-colors line-clamp-1 font-['Nunito',sans-serif]">
                        {product.name}
                      </h3>

                      <p className="text-xs text-[#6B5B4F] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Cart Footer */}
                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-[#194E3B] font-['Nunito',sans-serif]">
                          {formatPHP(product.price)}
                        </span>
                        <span className="text-[10px] text-[#8C7A6D] ml-1">
                          / {product.unit}
                        </span>
                      </div>

                      <button
                        id={`add-to-cart-btn-${product.id}`}
                        disabled={isOutOfStock}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer btn-bouncy ${
                          isOutOfStock
                            ? 'bg-[#FAF3DE] text-[#A39284] cursor-not-allowed'
                            : quickAddedId === product.id
                            ? 'bg-[#194E3B] text-white'
                            : 'bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{quickAddedId === product.id ? 'Added! ✨' : 'Add to Bag'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
