import React from 'react';
import { useNotificationStore, useUIStore } from '../../store/index.js';
import { Timestamp } from '../ui/index.jsx';
import { Bell, X, CheckCheck, MessageSquare, Megaphone, MessageCircle } from 'lucide-react';

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

export default function NotificationPanel() {
  const { notifications, markAllRead } = useNotificationStore();
  const { notificationPanelOpen, closeNotificationPanel } = useUIStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                id="mark-all-read-btn"
                onClick={markAllRead}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
              >
                <CheckCheck size={14} /> Mark all read
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={40} className="text-text-muted mb-3 opacity-40" />
              <p className="text-text-muted text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.announcement;
              return (
                <div
                  key={notif.id}
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
