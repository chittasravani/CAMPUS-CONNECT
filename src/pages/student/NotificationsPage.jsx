import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDate, formatTime, getRelativeTime } from '../../utils/helpers';

export function NotificationsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    if (!currentUser?.id) return;
    try {
      const list = await notificationService.getNotifications(currentUser.id);
      setNotifications(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, [currentUser?.id]);

  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    await notificationService.markAllAsRead(currentUser.id);
    await loadNotifs();
    showToast('All notifications marked as read', 'info');
  };

  const handleClearAll = async () => {
    if (!currentUser?.id) return;
    await notificationService.clearAll(currentUser.id);
    setNotifications([]);
    showToast('Notification inbox cleared', 'info');
  };

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    await loadNotifs();
  };

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    if (type === 'alert') return <AlertCircle className="w-5 h-5 text-rose-600" />;
    return <Info className="w-5 h-5 text-brand-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stay updated with registration confirmations, schedule modifications, and certificates.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCheck className="w-4 h-4 text-brand-600" />
              <span>Mark All as Read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Inbox</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New updates regarding your events will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200/80 shadow-xs opacity-85'
                  : 'bg-brand-50/50 border-brand-200/90 shadow-card'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0 border border-slate-100">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {getRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
