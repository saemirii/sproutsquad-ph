import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, Flag } from 'lucide-react';
import { useShop } from '../context/AppContext';
import { playIosTap } from '../utils/haptics';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { formatPHP } from '../utils/analytics';
import { Icon } from './Icon';

interface OrderIssuesAdminScreenProps {
  onClose: () => void;
}

/** Minimal admin queue for "Report an Issue" — mirrors
 * SproutUp/Admin/SproutUpAdminScreen.tsx's structure. Every action here is
 * re-validated server-side by is_admin() (RLS on order_issues); this
 * screen is a UI convenience only, not the real security boundary. */
export const OrderIssuesAdminScreen: React.FC<OrderIssuesAdminScreenProps> = ({ onClose }) => {
  const { openOrderIssues, isOrderIssuesAdminLoading, fetchOpenOrderIssues, resolveOrderIssue } = useShop();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchOpenOrderIssues();
  }, []);

  const handleResolve = async (issueId: string) => {
    setBusyId(issueId);
    setError('');
    const result = await resolveOrderIssue(issueId);
    if (!result.success) setError(result.message || 'Failed to resolve.');
    setBusyId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Flag className="w-5 h-5" /> Reported Order Issues
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

        {isOrderIssuesAdminLoading ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 flex justify-center">
            <Loader2 className="w-5 h-5 text-[#207559] animate-spin" />
          </div>
        ) : openOrderIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-2">
            <Icon name="decision-confirmed" className="w-8 h-8 mx-auto" />
            <p className="text-xs text-[#8C7A6D]">No open reports — all clear.</p>
          </div>
        ) : (
          openOrderIssues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-xs text-[#3B2F27]">
                  {issue.order?.orderNumber || issue.orderId} — {issue.order?.businessName || 'Unknown shop'}
                </h3>
                <span className="shrink-0 text-[9px] font-black uppercase text-[#7A5B0E] bg-[#FFE9A8] rounded-full px-1.5 py-0.5">
                  Reported by {issue.reporterRole}
                </span>
              </div>
              {issue.order && (
                <p className="text-[11px] text-[#8C7A6D]">
                  {formatPHP(issue.order.totalAmount)} • {issue.order.orderStatus} • {issue.order.customerName}
                </p>
              )}
              <p className="text-xs font-bold text-[#7A2E1E]">{issue.reason}</p>
              {issue.message && <p className="text-[11px] text-[#6E5D52] italic">"{issue.message}"</p>}
              <p className="text-[10px] text-[#A39284]">{formatRelativeTime(issue.createdAt)}</p>
              <button
                disabled={busyId === issue.id}
                onClick={() => { playIosTap(); void handleResolve(issue.id); }}
                className="w-full py-2 bg-[#B8E6D5] text-[#194E3B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
