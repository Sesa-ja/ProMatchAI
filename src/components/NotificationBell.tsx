import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationBellProps {
  onClick: () => void;
  userProfile: any;
}

export default function NotificationBell({ onClick, userProfile }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const notificationsKey = `promatchai_notifications_${userProfile.id}`;
      const storedNotifications = localStorage.getItem(notificationsKey);

      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
        return;
      }

      setUnreadCount(0);
    };

    updateUnreadCount();

    const handleStorageChange = () => updateUnreadCount();
    const handleFocus = () => updateUnreadCount();
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string }>;
      if (!customEvent.detail?.userId || String(customEvent.detail.userId) === String(userProfile.id)) {
        updateUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('promatchai-notifications-updated', handleNotificationEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('promatchai-notifications-updated', handleNotificationEvent as EventListener);
    };
  }, [userProfile.id]);

  return (
    <button
      onClick={onClick}
      className="relative rounded-full p-2 transition-colors hover:bg-slate-50"
      aria-label="Notifications"
    >
      <Bell className="w-4.5 h-4.5 text-slate-700" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-lg animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
}
