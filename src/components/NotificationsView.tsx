import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, CheckCircle, Briefcase, MessageSquare, 
  AlertCircle, Calendar, TrendingUp, X, Check 
} from 'lucide-react';
import { Button } from './ui/button';
import { getTranslation } from '../utils/translations';
import { readNotifications, writeNotifications } from '../utils/notifications';

interface Notification {
  id: string;
  type: 'application_status' | 'new_match' | 'message' | 'reminder' | 'interview' | 'shortlist' | 'course';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  actionUrl?: string;
}

interface NotificationsViewProps {
  userProfile: any;
  onBack: () => void;
}

export default function NotificationsView({ userProfile, onBack }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const t = getTranslation(userProfile.language);

  useEffect(() => {
    loadNotifications();
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string }>;
      if (!customEvent.detail?.userId || String(customEvent.detail.userId) === String(userProfile.id)) {
        loadNotifications();
      }
    };

    window.addEventListener('promatchai-notifications-updated', handleNotificationEvent as EventListener);
    window.addEventListener('focus', loadNotifications);

    return () => {
      window.removeEventListener('promatchai-notifications-updated', handleNotificationEvent as EventListener);
      window.removeEventListener('focus', loadNotifications);
    };
  }, [userProfile.id]);

  const loadNotifications = () => {
    if (!userProfile?.id) {
      setNotifications([]);
      return;
    }

    setNotifications(readNotifications(String(userProfile.id)));
  };

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    writeNotifications(String(userProfile.id), updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    writeNotifications(String(userProfile.id), updatedNotifications);
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    writeNotifications(String(userProfile.id), updatedNotifications);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return <Briefcase className="w-5 h-5" />;
      case 'new_match':
        return <TrendingUp className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'reminder':
        return <AlertCircle className="w-5 h-5" />;
      case 'interview':
        return <Calendar className="w-5 h-5" />;
      case 'shortlist':
        return <CheckCircle className="w-5 h-5" />;
      case 'course':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'application_status':
        return 'bg-gradient-to-br from-green-400 to-green-600';
      case 'new_match':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'message':
        return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'reminder':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 'interview':
        return 'bg-gradient-to-br from-teal-400 to-teal-600';
      case 'shortlist':
        return 'bg-gradient-to-br from-violet-400 to-violet-600';
      case 'course':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#E8F4F8]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[#DCE8F2] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={onBack}
                className="rounded-full p-2 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 text-lg font-medium text-slate-700">
                  <Bell className="h-5 w-5 text-[#2E63C3]" />
                  Notifications
                </h1>
                <p className="text-sm text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'border-[#2E63C3] bg-[#E9F1FF] text-[#2E63C3]'
                  : 'border-[#D7E5F3] bg-transparent text-slate-600 hover:border-[#C8D8EA] hover:bg-[#F7FAFD]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'border-[#E38B2C] bg-[#FFF2E2] text-[#B86A16]'
                  : 'border-[#D7E5F3] bg-transparent text-slate-600 hover:border-[#C8D8EA] hover:bg-[#F7FAFD]'
              }`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#CFE5D9] bg-[#EDF8F1] px-3 py-1.5 text-xs font-medium text-[#2F7A5D] transition-colors hover:bg-[#E2F3E8]"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mx-auto max-w-4xl px-5 py-5">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-[28px] border border-[#D7E5F3] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3F7]">
              <Bell className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mb-2 text-slate-700">No notifications</h3>
            <p className="text-sm text-slate-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You'll see notifications here when you have updates."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[24px] border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  !notification.read ? 'border-[#CFE0F3]' : 'border-[#D7E5F3]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`${getIconColor(notification.type)} flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h3 className={`text-sm ${!notification.read ? 'text-slate-800' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-slate-500">
                      {notification.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 rounded-full bg-[#EEF4FF] px-3 py-1.5 text-xs text-[#2E63C3] transition-colors hover:bg-[#E3EEFF]"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 rounded-full bg-[#FFF1F1] px-3 py-1.5 text-xs text-[#E05555] transition-colors hover:bg-[#FFE5E5]"
                      >
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#2E63C3]"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
