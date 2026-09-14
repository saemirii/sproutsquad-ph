import React from 'react';
import { Icon } from '../Icon';

export const NotificationEmptyState: React.FC = () => (
  <div className="py-10 px-6 text-center space-y-1.5">
    <Icon name="level-sprout" className="w-9 h-9 mx-auto" />
    <p className="text-xs font-bold text-[#3B2F27]">You're all caught up</p>
    <p className="text-[11px] text-[#8C7A6D]">Order updates, shop activity, and account notices will show up here.</p>
  </div>
);
