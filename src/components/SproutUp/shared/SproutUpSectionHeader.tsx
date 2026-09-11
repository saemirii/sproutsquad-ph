import React from 'react';

interface SproutUpSectionHeaderProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

/** Shared section header giving every SproutUp category its own colored
 * icon badge — the one visual thread tying the 5 recognition types
 * together while still telling them apart at a glance. */
export const SproutUpSectionHeader: React.FC<SproutUpSectionHeaderProps> = ({ icon, iconBg, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-2.5">
      <span className={`w-9 h-9 rounded-2xl ${iconBg} flex items-center justify-center text-base shrink-0 shadow-xs`}>
        {icon}
      </span>
      <div className="pt-0.5">
        <h2 className="text-sm font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">{title}</h2>
        <p className="text-[11px] text-[#8C7A6D]">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);
