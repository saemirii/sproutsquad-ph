import React, { useState } from 'react';
import { X, Store, Copy, Check, Loader2 } from 'lucide-react';
import { useShop } from '../context/AppContext';
import { CampusUniversity, ProductCategory } from '../types';

interface CreateBusinessAdminScreenProps {
  onClose: () => void;
}

const campuses: CampusUniversity[] = ['MGC New Life Christian Academy'];

const categories: ProductCategory[] = [
  'Art & Creative',
  'Fashion & Accessories',
  'Food & Drinks',
  'Lifestyle & Gifts',
  'Digital & Tech',
  'Beauty & Self-Care',
  'Education & Services',
];

/** Lets an admin manually create a business for an applicant reviewed
 * outside the app (see CreateShopButton.tsx's Google Form) — the
 * applicant must already have a SproutSquad account, resolved here by
 * email (see admin_create_business, migration_31). Generates a fresh
 * Start-Up Key for the admin to relay back to them. */
export const CreateBusinessAdminScreen: React.FC<CreateBusinessAdminScreenProps> = ({ onClose }) => {
  const { createBusinessAsAdmin } = useShop();

  const [ownerEmail, setOwnerEmail] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [university, setUniversity] = useState<CampusUniversity>(campuses[0]);
  const [category, setCategory] = useState<ProductCategory>(categories[0]);
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [campusPickupSpots, setCampusPickupSpots] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ businessId: string; besKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setOwnerEmail('');
    setName('');
    setHandle('');
    setUniversity(campuses[0]);
    setCategory(categories[0]);
    setTagline('');
    setDescription('');
    setCampusPickupSpots('');
    setGcashNumber('');
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const spots = campusPickupSpots.split(',').map((s) => s.trim()).filter(Boolean);
    const submittedName = name.trim();
    const response = await createBusinessAsAdmin({
      ownerEmail: ownerEmail.trim(),
      name: submittedName,
      handle: handle.trim(),
      university,
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      campusPickupSpots: spots,
      gcashNumber: gcashNumber.trim(),
    });
    setIsSubmitting(false);
    if (!response.success || !response.businessId || !response.besKey) {
      setError(response.message || 'Could not create this business right now.');
      return;
    }
    setResult({ businessId: response.businessId, besKey: response.besKey, name: submittedName });
  };

  const handleCopyKey = () => {
    if (!result) return;
    void navigator.clipboard.writeText(result.besKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Store className="w-5 h-5" /> Create Business
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {result ? (
          <div className="bg-white rounded-2xl border-2 border-[#9FD9C3] p-5 space-y-3 text-center">
            <span className="inline-flex w-11 h-11 rounded-2xl bg-[#B8E6D5] text-[#194E3B] items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </span>
            <p className="text-sm font-black text-[#3B2F27]">{result.name} is live</p>
            <p className="text-[11px] text-[#7A6B5F]">
              Share this Start-Up Key with the owner — they can use it later to invite teammates.
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-[#E5DACD] bg-[#FAF7F2] px-3 py-2.5">
              <span className="flex-1 font-mono text-sm font-black text-[#194E3B] tracking-wide">{result.besKey}</span>
              <button
                onClick={handleCopyKey}
                className="shrink-0 rounded-lg bg-[#207559] hover:bg-[#194E3B] text-white p-1.5 cursor-pointer"
                title="Copy key"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={resetForm}
              className="w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] py-2.5 text-xs font-black text-white cursor-pointer"
            >
              Create another business
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-3">
            <p className="text-[11px] text-[#7A6B5F] leading-5">
              The owner needs a SproutSquad account already — look them up by the email they signed up with.
            </p>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Owner's account email
              <input
                required
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@campus.edu"
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Business name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Handle (must be unique)
              <input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. sprout-eats"
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-bold text-[#54453C]">
                University
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value as CampusUniversity)}
                  className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-2.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                >
                  {campuses.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-[11px] font-bold text-[#54453C]">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-2.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Tagline (optional)
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Description (optional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5] resize-none"
              />
            </label>

            <label className="block text-[11px] font-bold text-[#54453C]">
              Campus pickup spot(s), comma-separated (optional)
              <input
                value={campusPickupSpots}
                onChange={(e) => setCampusPickupSpots(e.target.value)}
                placeholder="Gate 1, Student Center Steps"
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            <label className="block text-[11px] font-bold text-[#54453C]">
              GCash number (optional)
              <input
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                placeholder="0917-XXX-XXXX"
                className="mt-1 w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </label>

            {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#207559] hover:bg-[#194E3B] disabled:opacity-50 py-2.5 text-xs font-black text-white cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Store className="w-3.5 h-3.5" />}
              {isSubmitting ? 'Creating...' : 'Create business & generate key'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
