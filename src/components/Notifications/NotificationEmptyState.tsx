import React from 'react';

export const NotificationEmptyState: React.FC = () => (
  <div className="py-10 px-6 text-center space-y-1.5">
    <span className="text-3xl block">🌱</span>
    <p className="text-xs font-bold text-[#3B2F27]">You're all caught up</p>
    <p className="text-[11px] text-[#8C7A6D]">Order updates, shop activity, and account notices will show up here.</p>
  </div>
);
