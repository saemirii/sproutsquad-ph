import React, { useState } from 'react';
import { Tag, Plus, Trash2, Percent, Banknote, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Coupon, DiscountType } from '../../types';
import { formatPHP } from '../../utils/analytics';

export const CouponManager: React.FC = () => {
  const { sellerCoupons, addCoupon, updateCoupon, deleteCoupon } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [maxRedemptions, setMaxRedemptions] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMaxRedemptions('');
    setExpiresAt('');
    setError('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError('Enter a coupon code.');
      return;
    }
    if (sellerCoupons.some((c) => c.code === trimmedCode)) {
      setError('You already have a coupon with this code.');
      return;
    }
    if (discountValue <= 0 || (discountType === 'percentage' && discountValue > 100)) {
      setError(discountType === 'percentage' ? 'Percentage must be between 1 and 100.' : 'Enter a discount amount greater than 0.');
      return;
    }

    addCoupon({
      code: trimmedCode,
      discountType,
      discountValue,
      isActive: true,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    resetForm();
    setIsCreating(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#7A6B5F]">
          {sellerCoupons.length === 0 ? 'No coupons yet.' : `${sellerCoupons.length} coupon${sellerCoupons.length === 1 ? '' : 's'} for this shop.`}
        </p>
        <button
          type="button"
          onClick={() => { setIsCreating((prev) => !prev); resetForm(); }}
          className="btn-bouncy inline-flex items-center gap-1.5 rounded-xl bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] text-[11px] font-black px-3 py-1.5"
        >
          {isCreating ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isCreating ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#E5DACD] bg-[#FAF7F2] p-3.5 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[#54453C] mb-1">Coupon Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="w-full px-3 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs font-bold uppercase tracking-wide text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#54453C] mb-1">Discount Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`py-2 rounded-xl text-[11px] font-black border flex items-center justify-center gap-1 ${discountType === 'percentage' ? 'bg-[#B8E6D5] text-[#194E3B] border-[#9FD9C3]' : 'bg-white text-[#6B5B4F] border-[#E5DACD]'}`}
                >
                  <Percent className="w-3 h-3" /> %
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`py-2 rounded-xl text-[11px] font-black border flex items-center justify-center gap-1 ${discountType === 'fixed' ? 'bg-[#B8E6D5] text-[#194E3B] border-[#9FD9C3]' : 'bg-white text-[#6B5B4F] border-[#E5DACD]'}`}
                >
                  <Banknote className="w-3 h-3" /> ₱
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#54453C] mb-1">
                {discountType === 'percentage' ? 'Percent Off' : 'Amount Off (₱)'}
              </label>
              <input
                type="number"
                min={1}
                max={discountType === 'percentage' ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs font-bold text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#54453C] mb-1">Max Redemptions (optional)</label>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-3 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#54453C] mb-1">Expires (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-[#991B1B]">{error}</p>}

          <button
            type="submit"
            className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black py-2.5 flex items-center justify-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            Create Coupon
          </button>
        </form>
      )}

      {sellerCoupons.length > 0 && (
        <div className="space-y-2">
          {sellerCoupons.map((coupon: Coupon) => {
            const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false;
            const isMaxedOut = coupon.maxRedemptions !== null && coupon.redemptionCount >= coupon.maxRedemptions;
            return (
              <div key={coupon.id} className="flex items-center gap-2.5 rounded-xl border border-[#EDE4D8] bg-white p-3">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-[#FFD3BA] text-[#7A341A] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-black text-[#3B2F27] tracking-wide">{coupon.code}</p>
                    <span className="text-[10px] font-bold text-[#207559] bg-[#EAF6F0] rounded-full px-2 py-0.5">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `${formatPHP(coupon.discountValue)} off`}
                    </span>
                    {!coupon.isActive && (
                      <span className="text-[10px] font-bold text-[#8C7A6D] bg-[#F2EAE0] rounded-full px-2 py-0.5">Paused</span>
                    )}
                    {isExpired && (
                      <span className="text-[10px] font-bold text-[#991B1B] bg-[#FEE2E2] rounded-full px-2 py-0.5">Expired</span>
                    )}
                    {isMaxedOut && (
                      <span className="text-[10px] font-bold text-[#991B1B] bg-[#FEE2E2] rounded-full px-2 py-0.5">Limit reached</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8C7A6D] mt-0.5">
                    Used {coupon.redemptionCount}{coupon.maxRedemptions !== null ? `/${coupon.maxRedemptions}` : ''} times
                    {coupon.expiresAt ? ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateCoupon({ ...coupon, isActive: !coupon.isActive })}
                  title={coupon.isActive ? 'Pause coupon' : 'Activate coupon'}
                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${coupon.isActive ? 'text-[#207559] hover:bg-[#EAF6F0]' : 'text-[#8C7A6D] hover:bg-[#F2EAE0]'}`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm(`Delete coupon "${coupon.code}"?`)) deleteCoupon(coupon.id); }}
                  title="Delete coupon"
                  className="shrink-0 p-1.5 rounded-lg text-[#A39284] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
