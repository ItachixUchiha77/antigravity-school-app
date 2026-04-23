import React, { useEffect } from 'react';
import { useUIStore, useAuthStore, loadClassData } from '../store/index.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import QAView from '../components/qna/QAView.jsx';
import NotificationPanel from '../components/notifications/NotificationPanel.jsx';

export default function AppPage() {
  const { activeView, selectedClassId } = useUIStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    if (selectedClassId && currentUser?.role !== 'student') {
      loadClassData(selectedClassId);
    }
  }, [selectedClassId, currentUser?.role]);

  const renderMain = () => {
    switch (activeView) {
      case 'qna':           return <QAView />;
      default:              return <QAView />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-primary overflow-hidden">
        {/* Global people search bar — always visible at top */}
        <TopBar />

        {/* View content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderMain()}
        </div>
      </main>

      {/* Notification Panel (slide-in overlay) */}
      <NotificationPanel />
    </div>
  );
}
