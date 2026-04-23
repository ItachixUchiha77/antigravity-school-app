import React from 'react';
import { useNotificationStore, useUIStore, useAuthStore } from '../../store/index.js';
import { USERS, PRIVATE_MESSAGES } from '../../data/mockData.js';
import { Timestamp } from '../ui/index.jsx';
import { Bell, X, MessageSquare, Megaphone, MessageCircle } from 'lucide-react';

const TYPE_CONFIG = {
  answer: {
    icon: <MessageSquare size={16} className="text-accent-blue-light" />,
    bg: 'bg-accent-blue/10',
  },
  announcement: {
    icon: <Megaphone size={16} className="text-warning" />,
    bg: 'bg-warning/10',
  },
  message: {
    icon: <MessageCircle size={16} className="text-accent-purple-light" />,
    bg: 'bg-accent-purple/10',
  },
};

// Filter notifications by role:
// - Admin: only announcements + messages from teachers
// - Student/Teacher: all notifications
function filterByRole(notifications, currentUser) {
  if (!currentUser || currentUser.role !== 'admin') return notifications;
  return notifications.filter((n) => {
    if (n.type === 'announcement') return true;
    if (n.type === 'message' && n.convId) {
      const conv = PRIVATE_MESSAGES[n.convId];
      if (!conv) return false;
      const otherUserId = conv.participants.find((p) => p !== currentUser.id);
      const other = USERS[otherUserId];
      return other?.role === 'teacher'; // admin sees only teacher DMs
    }
    return false;
  });
}

export default function NotificationPanel() {
  const { notifications, markRead, markAllRead } = useNotificationStore();
  const { notificationPanelOpen, closeNotificationPanel, setActiveView, setSelectedConv } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  function handleNotifClick(notif) {
    markRead(notif.id);
    if (notif.type === 'message' && notif.convId) {
      setSelectedConv(notif.convId); // sets activeView to 'private-chat'
    } else if (notif.type === 'announcement') {
      setActiveView('announcements');
    } else {
      setActiveView('qna');
    }
    closeNotificationPanel();
  }

  const visible     = filterByRole(notifications, currentUser);
  const unreadCount = visible.filter((n) => !n.read).length;

  if (!notificationPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeNotificationPanel}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l border-border-subtle z-50 flex flex-col shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-accent-blue-light" />
            <h2 className="font-bold text-text-primary">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent-blue-light hover:text-accent-blue transition-colors px-2 py-1 rounded-lg hover:bg-accent-blue/10"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={closeNotificationPanel}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={40} className="text-text-muted mb-3 opacity-40" />
              <p className="text-text-muted text-sm">No notifications yet</p>
            </div>
          ) : (
            visible.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.announcement;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-bg-elevated cursor-pointer ${
                    !notif.read ? 'bg-bg-elevated border border-border-default' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? 'text-text-muted' : 'text-text-primary font-medium'}`}>
                      {notif.text}
                    </p>
                    <Timestamp date={notif.createdAt} />
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-accent-blue rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
