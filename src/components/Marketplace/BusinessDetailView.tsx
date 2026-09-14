import React, { useEffect, useState } from 'react';
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
  Heart,
  MessageSquareText,
  Loader2,
  Flag,
  X,
} from 'lucide-react';
import { Business, Product, BusinessReview, REVIEW_REPORT_REASONS } from '../../types';
import { useShop, useCart, useSession, useNotifications } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { SproutedUpBadge } from '../SproutUp/SproutedUpBadge';
import { Icon } from '../Icon';

// `Business.badges` stores each badge as a display string with a trailing
// emoji (e.g. "New Sprout 🌱") rather than a separate icon field — this
// strips that emoji for display and looks up the matching illustrated icon
// by the remaining label text instead.
const BADGE_ICON: Record<string, string> = {
  'New Sprout': 'level-sprout',
  'Campus Verified': 'decision-confirmed',
  'Top Rated': 'medal-1st',
  'Eco Packaging': 'badge-eco-certified',
  'Eco Certified': 'badge-eco-certified',
  'Handmade Master': 'achievements-header',
  'Bestseller': 'celebration-burst',
};

const parseBadge = (raw: string): { label: string; icon?: string } => {
  const label = raw.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, '').trim();
  return { label, icon: BADGE_ICON[label] };
};

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
  const {
    products, setActiveBusiness, fetchBusinessReviews, fetchBusinessFollowerCount,
    reviewReportsByOrderId, fetchReviewReportsForOrders, reportReview,
  } = useShop();
  const { addToCart } = useCart();
  const { setCurrentView, setSellerTab, currentUser } = useSession();
  const { favoritedBusinessIds, toggleFavoriteBusiness } = useNotifications();
  const isFavorited = favoritedBusinessIds.includes(business.id);
  const isOwnBusiness = business.sellerId === currentUser.id;

  // A product scheduled for a future drop should stay invisible to buyers
  // until that moment passes (same rule IosMarketplaceView's grid already
  // applies) — this shop-profile grid had no such check at all, so a
  // scheduled product was visible here immediately, just not in the main
  // marketplace grid. The owner can still preview their own upcoming drop
  // on their own shop page.
  const bizProducts = products.filter((p) => {
    if (p.businessId !== business.id) return false;
    if (isOwnBusiness) return true;
    return !p.dropDate || new Date(p.dropDate).getTime() <= Date.now();
  });

  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  // Transient per-product label shown on the quick-add button itself — this
  // grid has no toast mechanism, so a capped/sold-out add is surfaced right
  // on the button instead (addToCart re-checks live stock; the cached
  // `inventoryCount` here can be stale by the time it's clicked).
  const [quickAddFeedback, setQuickAddFeedback] = useState<Record<string, string>>({});

  const handleQuickAdd = async (product: Product) => {
    const { added, available } = await addToCart(product, 1);
    const message = added > 0 ? 'Added!' : available <= 0 ? 'Sold out' : `Only ${available} left`;
    setQuickAddFeedback((prev) => ({ ...prev, [product.id]: message }));
    setTimeout(() => {
      setQuickAddFeedback((prev) => {
        const { [product.id]: _removed, ...rest } = prev;
        return rest;
      });
    }, 1500);
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoadingReviews(true);
    fetchBusinessReviews(business.id).then((data) => {
      if (!cancelled) {
        setReviews(data);
        setIsLoadingReviews(false);
        void fetchReviewReportsForOrders(data.map((r) => r.orderId));
      }
    });
    return () => { cancelled = true; };
  }, [business.id]);

  // "Report a review" — which review's inline form is open, plus its draft.
  const [reportingReviewOrderId, setReportingReviewOrderId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>(REVIEW_REPORT_REASONS[0]);
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const openReviewReportForm = (orderId: string) => {
    setReportingReviewOrderId(orderId);
    setReportReason(REVIEW_REPORT_REASONS[0]);
    setReportMessage('');
    setReportError('');
  };

  const handleSubmitReviewReport = async (orderId: string) => {
    setIsSubmittingReport(true);
    setReportError('');
    const result = await reportReview(orderId, reportReason, reportMessage);
    setIsSubmittingReport(false);
    if (!result.success) {
      setReportError(result.message || 'Could not submit your report right now.');
      return;
    }
    setReportingReviewOrderId(null);
  };

  // Refetches when this viewer's own follow state changes too, so the count
  // reflects their own follow/unfollow immediately without a full reload.
  useEffect(() => {
    let cancelled = false;
    fetchBusinessFollowerCount(business.id).then((count) => {
      if (!cancelled) setFollowerCount(count);
    });
    return () => { cancelled = true; };
  }, [business.id, isFavorited]);

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
          {/* Avatar alone in its own row — only this element overlaps the
              banner, via its own negative margin. Kept independent of the
              name/badges block below so a long name or wrapping badges can
              never push text up into the banner image (the old layout put
              them side-by-side in one bottom-aligned flex row sharing a
              single overlap margin sized only for the avatar's height). */}
          <img
            src={business.logo}
            alt={business.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white -mt-12 sm:-mt-14"
          />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">
                  {business.name}
                </h1>
                {business.badges.map((b) => {
                  const { label, icon } = parseBadge(b);
                  return (
                    <span
                      key={b}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B8E6D5] text-[#194E3B] inline-flex items-center gap-1"
                    >
                      {icon && <Icon name={icon} className="w-3 h-3" />} {label}
                    </span>
                  );
                })}
                <SproutedUpBadge businessId={business.id} />
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
                {followerCount !== null && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-[#194E3B]">
                      <Heart className="w-3.5 h-3.5" />
                      {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
                    </span>
                  </>
                )}
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

              {/* Only the shop's own owner can jump into Seller OS from here —
                  this used to show on every shop's public page and silently
                  pointed Shop OS at whatever business a buyer last viewed,
                  making revenue/orders there read 0 (it was filtering by the
                  wrong business, not losing any data). */}
              {isOwnBusiness && (
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
              )}
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
                <span>Direct Payment & Contact:</span>
              </h3>
              <p className="text-xs text-[#6E5D52]">
                <strong className="text-[#3B2F27]">GCash:</strong> {business.gcashNumber}
              </p>
              {business.mayaNumber && (
                <p className="text-xs text-[#6E5D52]">
                  <strong className="text-[#3B2F27]">Maya:</strong> {business.mayaNumber}
                </p>
              )}
              {business.instagramHandle && (
                <p className="text-xs text-[#6E5D52]">
                  <strong className="text-[#3B2F27]">Instagram:</strong> {business.instagramHandle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif] flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-[#207559]" />
          Reviews {business.reviewCount > 0 && `(${business.reviewCount})`}
        </h2>

        {isLoadingReviews ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 flex justify-center">
            <Loader2 className="w-5 h-5 text-[#207559] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-6 text-center text-xs text-[#7A6B5F]">
            No reviews yet — be the first to complete an order and rate this shop!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.orderId} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B2F27]">{review.customerName}</span>
                  <span className="text-[10px] text-[#8C7A6D]">{formatRelativeTime(review.createdAt)}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-3.5 h-3.5 ${n <= review.stars ? 'fill-[#F7C948] text-[#F7C948]' : 'text-[#E5DACD]'}`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-xs text-[#6E5D52] leading-relaxed">{review.comment}</p>
                )}
                {review.images.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Review attachment"
                        className="w-16 h-16 rounded-xl object-cover border border-[#EDE4D8]"
                      />
                    ))}
                  </div>
                )}

                {reviewReportsByOrderId[review.orderId] ? (
                  <span className="inline-flex items-center gap-1.5 pt-1 text-[10px] font-bold text-[#92400E]">
                    <Flag className="w-3 h-3" />
                    Reported — pending review
                  </span>
                ) : (
                  <button
                    onClick={() => openReviewReportForm(review.orderId)}
                    className="inline-flex items-center gap-1.5 pt-1 text-[10px] font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer"
                  >
                    <Flag className="w-3 h-3" />
                    Report this review
                  </button>
                )}

                {reportingReviewOrderId === review.orderId && (
                  <div className="rounded-2xl border border-[#EADBCE] bg-[#FAF7F2] p-3.5 space-y-2.5 mt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#3B2F27]">Report this review</p>
                      <button
                        onClick={() => setReportingReviewOrderId(null)}
                        className="p-1 rounded-lg text-[#8C7A6D] hover:bg-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    >
                      {REVIEW_REPORT_REASONS.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                    <textarea
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      placeholder="Add any details (optional)"
                      rows={2}
                      className="w-full px-2.5 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5] resize-none"
                    />
                    {reportError && <p className="text-[11px] font-bold text-[#991B1B]">{reportError}</p>}
                    <button
                      onClick={() => void handleSubmitReviewReport(review.orderId)}
                      disabled={isSubmittingReport}
                      className="w-full py-2 bg-[#7A341A] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

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
                    disabled={product.inventoryCount <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleQuickAdd(product);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{quickAddFeedback[product.id] || (product.inventoryCount <= 0 ? 'Sold out' : 'Add')}</span>
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
