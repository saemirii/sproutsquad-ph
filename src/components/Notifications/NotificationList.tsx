import React, { useState } from 'react';
import { useNotifications } from '../../context/AppContext';
import { AppNotification } from '../../types';
import { NotificationItem } from './NotificationItem';
import { NotificationEmptyState } from './NotificationEmptyState';

interface NotificationListProps {
  notifications: AppNotification[];
  onNavigate?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications, onNavigate }) => {
  const { loadMoreNotifications } = useNotifications();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const rows = await loadMoreNotifications();
    if (rows.length < 50) setHasMore(false);
    setIsLoadingMore(false);
  };

  if (notifications.length === 0) return <NotificationEmptyState />;

  return (
    <div>
      <div className="divide-y divide-[#F5EFEB]">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onNavigate={onNavigate} />
        ))}
      </div>
      {hasMore && notifications.length >= 50 && (
        <button
          onClick={() => void handleLoadMore()}
          disabled={isLoadingMore}
          className="w-full py-3 text-[11px] font-bold text-[#207559] hover:bg-[#FAF7F2] cursor-pointer disabled:opacity-60"
        >
          {isLoadingMore ? 'Loading...' : 'Load older notifications'}
        </button>
      )}
    </div>
  );
};
