import React from 'react';
import { useUIStore } from '../store/index.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import QAView from '../components/qna/QAView.jsx';
import { PrivateChatView, GroupChatView } from '../components/chat/ChatView.jsx';
import AnnouncementsView from '../components/announcements/AnnouncementsView.jsx';
import NotificationPanel from '../components/notifications/NotificationPanel.jsx';

export default function AppPage() {
  const { activeView } = useUIStore();

  const renderMain = () => {
    switch (activeView) {
      case 'qna':           return <QAView />;
      case 'private-chat':  return <PrivateChatView />;
      case 'group-chat':    return <GroupChatView />;
      case 'announcements': return <AnnouncementsView />;
      default:              return <QAView />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        {renderMain()}
      </main>

      {/* Notification Panel (slide-in overlay) */}
      <NotificationPanel />
    </div>
  );
}
