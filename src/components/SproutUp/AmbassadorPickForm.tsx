import React, { useState } from 'react';
import { useShop, useSproutUp } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';

interface AmbassadorPickFormProps {
  onClose: () => void;
}

export const AmbassadorPickForm: React.FC<AmbassadorPickFormProps> = ({ onClose }) => {
  const { businesses } = useShop();
  const { submitAmbassadorPick } = useSproutUp();
  const sortedBusinesses = [...businesses].sort((a, b) => a.name.localeCompare(b.name));

  const [businessId, setBusinessId] = useState(sortedBusinesses[0]?.id || '');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!businessId || !headline.trim() || !description.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const result = await submitAmbassadorPick(businessId, headline.trim(), description.trim());
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 1400);
    } else {
      setError(result.message || 'Could not submit this pick right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-[#D4C8B8] rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#3B2F27]">🌟 Submit an Ambassador Pick</h3>
            <p className="text-[11px] text-[#6B5B4F]">Recommend a shop you genuinely believe deserves exposure.</p>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-[#8C7A6D]">Cancel</button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-1.5">
            <span className="text-3xl block">🌟</span>
            <p className="text-xs font-bold text-[#194E3B]">Pick submitted!</p>
            <p className="text-[11px] text-[#8C7A6D]">An admin will review it soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#6B5B4F]">Which shop?</label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              >
                {sortedBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6B5B4F]">Short headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={120}
                placeholder="e.g. Turns simple products into something unique"
                className="mt-1 w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6B5B4F]">Why this shop?</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell students why this shop deserves the spotlight..."
                className="mt-1 w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5] resize-none"
              />
            </div>

            {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

            <button
              onClick={() => { playIosTap(); void handleSubmit(); }}
              disabled={!businessId || !headline.trim() || !description.trim() || isSubmitting}
              className="w-full py-3 bg-[#194E3B] hover:bg-[#0E2B25] text-white font-black text-sm rounded-2xl disabled:opacity-50 cursor-pointer btn-bouncy"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Pick'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
