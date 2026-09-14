import React, { useState } from 'react';
import { X, ShieldCheck, Store, Users, Rocket, Flag, MessageSquareText, ChevronRight } from 'lucide-react';
import { SproutUpAdminScreen } from './SproutUp/Admin/SproutUpAdminScreen';
import { OrderIssuesAdminScreen } from './OrderIssuesAdminScreen';
import { ReviewReportsAdminScreen } from './ReviewReportsAdminScreen';
import { CreateBusinessAdminScreen } from './CreateBusinessAdminScreen';
import { UserRolesAdminScreen } from './UserRolesAdminScreen';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminScreenId = 'create-business' | 'user-roles' | 'sproutup' | 'order-issues' | 'review-reports';

const MENU: { id: AdminScreenId; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'create-business',
    label: 'Create Business',
    description: 'Manually add a business and generate its Start-Up Key',
    icon: <Store className="w-4.5 h-4.5" />,
  },
  {
    id: 'user-roles',
    label: 'User Roles',
    description: 'Grant or revoke admin/ambassador access',
    icon: <Users className="w-4.5 h-4.5" />,
  },
  {
    id: 'sproutup',
    label: 'SproutUp! Admin Tools',
    description: 'Moderate nominations, ambassador picks & featured sprouts',
    icon: <Rocket className="w-4.5 h-4.5" />,
  },
  {
    id: 'order-issues',
    label: 'Reported Order Issues',
    description: 'Review disputes flagged by buyers or sellers',
    icon: <Flag className="w-4.5 h-4.5" />,
  },
  {
    id: 'review-reports',
    label: 'Reported Reviews',
    description: 'Dismiss or remove flagged shop reviews',
    icon: <MessageSquareText className="w-4.5 h-4.5" />,
  },
];

/** Single entry point for every admin capability — replaces the 3
 * scattered admin buttons that used to live directly in ProfileSheet.tsx.
 * Each section stays its own already-tested screen; this is just the hub
 * that opens them. */
export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [openScreen, setOpenScreen] = useState<AdminScreenId | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9E6] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#FFF9E6]/95 backdrop-blur-md border-b border-[#EDE4D8] px-4 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-extrabold text-base text-[#194E3B] font-['Nunito',sans-serif] flex items-center gap-1.5">
          <ShieldCheck className="w-5 h-5" /> Admin Panel
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-[#EDE4D8] flex items-center justify-center cursor-pointer">
          <X className="w-4 h-4 text-[#6B5B4F]" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {MENU.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenScreen(item.id)}
            className="btn-bouncy w-full flex items-center gap-3 rounded-2xl bg-white border border-[#EDE4D8] p-4 text-left hover:bg-[#FAF7F2] cursor-pointer"
          >
            <span className="shrink-0 w-10 h-10 rounded-xl bg-[#F2FBF7] text-[#194E3B] flex items-center justify-center">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-[#3B2F27]">{item.label}</span>
              <span className="block text-[10px] text-[#8C7A6D]">{item.description}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-[#B8AA9C] shrink-0" />
          </button>
        ))}
      </div>

      {openScreen === 'create-business' && <CreateBusinessAdminScreen onClose={() => setOpenScreen(null)} />}
      {openScreen === 'user-roles' && <UserRolesAdminScreen onClose={() => setOpenScreen(null)} />}
      {openScreen === 'sproutup' && <SproutUpAdminScreen onClose={() => setOpenScreen(null)} />}
      {openScreen === 'order-issues' && <OrderIssuesAdminScreen onClose={() => setOpenScreen(null)} />}
      {openScreen === 'review-reports' && <ReviewReportsAdminScreen onClose={() => setOpenScreen(null)} />}
    </div>
  );
};
