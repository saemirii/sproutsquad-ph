import React, { useEffect, useState } from 'react';
import { X, Loader2, Ban, Trash2, Flag, Star } from 'lucide-react';
import { useShop } from '../context/AppContext';
import { playIosTap } from '../utils/haptics';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { Icon } from './Icon';

interface ReviewReportsAdminScreenProps {
  onClose: () => void;
}

/** Minimal admin queue for "Report a review" — mirrors
 * OrderIssuesAdminScreen.tsx's structure. Every action here is
 * re-validated server-side by is_admin() (RLS + moderate_review_report()),
 * this screen is a UI convenience only, not the real security boundary. */
export const ReviewReportsAdminScreen: React.FC<ReviewReportsAdminScreenProps> = ({ onClose }) => {
  const { openReviewReports, isReviewReportsAdminLoading, fetchOpenReviewReports, moderateReviewReport } = useShop();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchOpenReviewReports();
  }, []);

  const handleDecision = async (reportId: string, decision: 'dismissed' | 'removed') => {
    setBusyId(reportId);
    setError('');
    const result = await moderateReviewReport(reportId, decision);
    if (!result.success) setError(result.message || 'Failed to process this report.');
    setBusyId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <Flag className="w-5 h-5" /> Reported Reviews
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {error && <p className="text-[11px] font-bold text-[#991B1B]">{error}</p>}

        {isReviewReportsAdminLoading ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 flex justify-center">
            <Loader2 className="w-5 h-5 text-[#207559] animate-spin" />
          </div>
        ) : openReviewReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EDE4D8] p-8 text-center space-y-2">
            <Icon name="decision-confirmed" className="w-8 h-8 mx-auto" />
            <p className="text-xs text-[#8C7A6D]">No open reports — all clear.</p>
          </div>
        ) : (
          openReviewReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-[#EDE4D8] p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-xs text-[#3B2F27]">
                  {report.businessName || 'Unknown shop'} — review by {report.reviewCustomerName || 'a customer'}
                </h3>
                {report.reviewStars !== null && (
                  <span className="shrink-0 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3 h-3 ${n <= (report.reviewStars || 0) ? 'fill-[#F7C948] text-[#F7C948]' : 'text-[#E5DACD]'}`}
                      />
                    ))}
                  </span>
                )}
              </div>
              {report.reviewComment && (
                <p className="text-[11px] text-[#6E5D52] italic">"{report.reviewComment}"</p>
              )}
              <p className="text-xs font-bold text-[#7A2E1E]">Reason: {report.reason}</p>
              {report.message && <p className="text-[11px] text-[#6E5D52]">Reporter's note: "{report.message}"</p>}
              <p className="text-[10px] text-[#A39284]">{formatRelativeTime(report.createdAt)}</p>
              <div className="flex gap-2 pt-1">
                <button
                  disabled={busyId === report.id}
                  onClick={() => { playIosTap(); void handleDecision(report.id, 'dismissed'); }}
                  className="flex-1 py-2 bg-[#B8E6D5] text-[#194E3B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" /> Dismiss
                </button>
                <button
                  disabled={busyId === report.id}
                  onClick={() => { playIosTap(); void handleDecision(report.id, 'removed'); }}
                  className="px-3 py-2 bg-[#FEE2E2] text-[#991B1B] rounded-xl text-[11px] font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
