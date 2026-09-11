import React, { useState } from 'react';
import { useShop, useSproutUp } from '../../context/AppContext';
import { playIosTap } from '../../utils/haptics';

interface NominationFormProps {
  onClose: () => void;
}

export const NominationForm: React.FC<NominationFormProps> = ({ onClose }) => {
  const { businesses } = useShop();
  const { submitNomination } = useSproutUp();
  const sortedBusinesses = [...businesses].sort((a, b) => a.name.localeCompare(b.name));

  const [businessId, setBusinessId] = useState(sortedBusinesses[0]?.id || '');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!businessId || !reason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const result = await submitNomination(businessId, reason.trim());
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 1400);
    } else {
      setError(result.message || 'Could not submit your nomination right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[32px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-[#D4C8B8] rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-[#3B2F27]">💌 Nominate a Shop</h3>
            <p className="text-[11px] text-[#6B5B4F]">Know a business that deserves a little more love?</p>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-[#8C7A6D]">Cancel</button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-1.5">
            <span className="text-3xl block">🎉</span>
            <p className="text-xs font-bold text-[#194E3B]">Nomination submitted!</p>
            <p className="text-[11px] text-[#8C7A6D]">Our team will take a look soon.</p>
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
              <label className="text-[11px] font-bold text-[#6B5B4F]">Why do they deserve a boost?</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell us what makes this shop special..."
                className="mt-1 w-full rounded-xl border border-[#EDE4D8] bg-[#FAF3DE] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5] resize-none"
              />
            </div>

            {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

            <button
              onClick={() => { playIosTap(); void handleSubmit(); }}
              disabled={!businessId || !reason.trim() || isSubmitting}
              className="w-full py-3 bg-[#194E3B] hover:bg-[#0E2B25] text-white font-black text-sm rounded-2xl disabled:opacity-50 cursor-pointer btn-bouncy"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Nomination'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
