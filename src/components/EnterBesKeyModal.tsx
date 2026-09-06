import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EnterBesKeyModalProps {
  onClose: () => void;
}

/**
 * A single, standalone way to join a business by BES key — deliberately
 * does not show or require picking from a list of every business (see
 * ProfileSheet.tsx, which used to list all of them just for this).
 */
export const EnterBesKeyModal: React.FC<EnterBesKeyModalProps> = ({ onClose }) => {
  const { unlockBusinessByKey, setActiveBusiness, businesses } = useApp();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [successName, setSuccessName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!key.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const result = await unlockBusinessByKey(key.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'That BES key is not valid.');
      return;
    }

    setSuccessName(result.businessName || 'your shop');
    const matched = businesses.find((b) => b.id === result.businessId);
    if (matched) setActiveBusiness(matched);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#FFF9E6] rounded-3xl border border-[#EDE4D8] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#3B2F27] font-['Nunito',sans-serif]">Enter BES Key</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#8C7A6D] hover:bg-[#F2EAE0]" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {successName ? (
          <div className="text-center space-y-3 py-2">
            <span className="inline-flex w-11 h-11 rounded-2xl bg-[#B8E6D5] text-[#194E3B] items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </span>
            <p className="text-xs leading-5 text-[#3B2F27]">
              You now have management access to <span className="font-black">{successName}</span>.
            </p>
            <button
              onClick={onClose}
              className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] py-2.5 text-xs font-black text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs leading-5 text-[#7A6B5F]">
              Enter the Business Entry &amp; Sharing key you received by email to get manager access to that shop.
            </p>
            <input
              value={key}
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') void handleSubmit(); }}
              placeholder="e.g. BES-XXXXXX"
              className="w-full rounded-xl border border-[#E5DACD] bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
            {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}
            <button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !key.trim()}
              className="btn-bouncy w-full flex items-center justify-center gap-2 rounded-xl bg-[#7A341A] hover:brightness-110 disabled:opacity-50 py-2.5 text-xs font-black text-white cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {isSubmitting ? 'Checking...' : 'Unlock Shop'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
