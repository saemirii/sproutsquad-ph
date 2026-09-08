import React, { useState } from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { makeDefaultShopDraft } from '../utils/shop';
import { openExternalUrl } from '../lib/platformLinks';

const SHOP_APPLICATION_FORM_URL = 'https://forms.gle/781mZpv46ToztEUYA';

type FlowStep = 'closed' | 'pending' | 'submitted';

interface CreateShopButtonProps {
  className: string;
  children: React.ReactNode;
  /** Optional side effect fired before the main click handling (e.g. closing a sheet, a haptic tap). */
  onBeforeClick?: () => void;
}

/**
 * The one "Create Shop" action, reused everywhere it appears. Real accounts
 * no longer get an instant self-service shop (a human reviews the Google
 * Form response and emails a BES key) — clicking opens the application
 * form and shows a small in-app confirmation flow. Offline/local-account
 * demo mode has no backend to review anything, so it keeps the old
 * instant-create behavior.
 */
export const CreateShopButton: React.FC<CreateShopButtonProps> = ({ className, children, onBeforeClick }) => {
  const { businesses, currentUser, createBusiness } = useApp();
  const [step, setStep] = useState<FlowStep>('closed');

  const handleClick = () => {
    onBeforeClick?.();

    if (!isSupabaseConfigured) {
      createBusiness(makeDefaultShopDraft(currentUser.id, businesses.length + 1, currentUser.university));
      return;
    }

    void openExternalUrl(SHOP_APPLICATION_FORM_URL);
    setStep('pending');
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>

      {step !== 'closed' && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#FFF9E6] rounded-3xl border border-[#EDE4D8] shadow-2xl p-6 space-y-4 text-center">
            {step === 'pending' ? (
              <>
                <span className="inline-flex w-11 h-11 rounded-2xl bg-[#B8E6D5] text-[#194E3B] items-center justify-center mx-auto">
                  <ExternalLink className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#3B2F27] font-['Nunito',sans-serif]">
                    We opened your Shop Application
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#7A6B5F]">
                    Fill it out in the new tab, then come back here and tap OK.
                  </p>
                </div>
                <button
                  onClick={() => setStep('submitted')}
                  className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] py-2.5 text-xs font-black text-white cursor-pointer"
                >
                  OK
                </button>
              </>
            ) : (
              <>
                <span className="inline-flex w-11 h-11 rounded-2xl bg-[#FFD3BA] text-[#7A341A] items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#3B2F27] font-['Nunito',sans-serif]">
                    Thanks for applying! 🌱
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#7A6B5F]">
                    We'll review your application and email your BES key soon — check your inbox (and spam folder) over the next few days.
                  </p>
                </div>
                <button
                  onClick={() => setStep('closed')}
                  className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] py-2.5 text-xs font-black text-white cursor-pointer"
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
