import React from 'react';
import { Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SproutPlusGateProps {
  /** Plain-English name of the gated feature, e.g. "Bundle Builder". */
  featureName: string;
  children: React.ReactNode;
}

/**
 * Reusable Sprout+ entitlement gate. Wrap any feature's UI in this — if the
 * merchant has the `sprout_plus` entitlement, children render normally;
 * otherwise a locked-feature upgrade prompt is shown instead, matching the
 * app's existing design language. This is a UI/UX convenience only — it does
 * not grant or verify access on its own (see SECURITY notes in revenuecat.ts).
 */
export const SproutPlusGate: React.FC<SproutPlusGateProps> = ({ featureName, children }) => {
  const { hasSproutPlus, openSubscriptionPage } = useApp();

  if (hasSproutPlus) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2] p-5 text-center space-y-2.5">
      <span className="inline-flex w-9 h-9 rounded-xl bg-[#F2EAE0] text-[#8C7A6D] items-center justify-center">
        <Lock className="w-4 h-4" />
      </span>
      <p className="text-xs font-black text-[#3B2F27]">
        🌱 {featureName} is part of Sprout+
      </p>
      <p className="text-[11px] text-[#7A6B5F] leading-4 max-w-xs mx-auto">
        Upgrade to unlock {featureName.toLowerCase()} and other tools for growing student shops.
      </p>
      <button
        onClick={openSubscriptionPage}
        className="btn-bouncy inline-flex items-center gap-1.5 rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black px-4 py-2"
      >
        View Sprout+
      </button>
    </div>
  );
};
