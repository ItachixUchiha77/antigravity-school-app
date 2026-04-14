import React, { useState } from 'react';
import { useAuthStore, useUIStore, useNotificationStore } from '../../store/index.js';
import { CLASSES, SUBJECTS, USERS, PRIVATE_MESSAGES } from '../../data/mockData.js';
import { Avatar, RoleBadge } from '../ui/index.jsx';
import {
  Hash, MessageSquare, Megaphone, Users, ChevronDown, ChevronRight,
  Bell, LogOut, Settings, BookOpen, Menu, X
} from 'lucide-react';

export default function Sidebar() {
  const currentUser      = useAuthStore((s) => s.currentUser);
  const logout           = useAuthStore((s) => s.logout);
  const { selectedClassId, selectedSubjectId, activeView, selectedConvId,
          setSelectedClass, setSelectedSubject, setActiveView, setSelectedConv,
          toggleNotificationPanel } = useUIStore();
  const notifications    = useNotificationStore((s) => s.notifications);
  const unreadCount      = notifications.filter((n) => !n.read).length;

  const [classExpanded, setClassExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen]       = useState(false);

  const selectedClass = CLASSES.find((c) => c.id === selectedClassId);

  // Private conversations for this user
  const myConversations = Object.entries(PRIVATE_MESSAGES)
    .filter(([, conv]) => conv.participants.includes(currentUser?.id))
    .map(([convId, conv]) => {
      const otherId = conv.participants.find((p) => p !== currentUser?.id);
      const other   = USERS[otherId];
      const lastMsg = conv.messages[conv.messages.length - 1];
      return { convId, other, lastMsg };
    });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <span className="text-xl">🎭</span>
          </div>
          <div>
            <h1 className="font-black text-text-primary text-lg leading-none">AnonyASK</h1>
            <p className="text-text-muted text-[10px] mt-0.5">School Q&A Platform</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">

        {/* Class Selector */}
        <div className="px-2 mb-3">
          <select
            id="class-selector"
            value={selectedClassId}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-bg-elevated border border-border-default text-text-primary text-sm rounded-lg px-3 py-2 outline-none focus:border-accent-blue/60 cursor-pointer"
          >
            {CLASSES.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {/* Channels Section */}
        <button
          className="w-full flex items-center justify-between px-2 py-1 text-text-muted hover:text-text-secondary transition-colors text-xs font-semibold uppercase tracking-wider"
          onClick={() => setClassExpanded(!classExpanded)}
        >
          <span className="flex items-center gap-1">
            {classExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Subjects — {selectedClass?.name}
          </span>
        </button>

        {classExpanded && (
          <div className="space-y-0.5 animate-fade-in">
            {SUBJECTS.map((subj) => (
              <button
                key={subj.id}
                id={`subject-${subj.id}`}
                onClick={() => { setSelectedSubject(subj.id); setMobileOpen(false); }}
                className={`channel-item w-full text-left ${activeView === 'qna' && selectedSubjectId === subj.id ? 'active' : ''}`}
              >
                <span className="text-base">{subj.emoji}</span>
                <span className="truncate">{subj.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="my-3 border-t border-border-subtle" />

        {/* Announcements */}
        <button
          id="nav-announcements"
          onClick={() => { setActiveView('announcements'); setMobileOpen(false); }}
          className={`sidebar-item w-full text-left ${activeView === 'announcements' ? 'active' : ''}`}
        >
          <Megaphone size={18} />
          <span>Announcements</span>
        </button>

        {/* Group Chat */}
        <button
          id="nav-group-chat"
          onClick={() => { setActiveView('group-chat'); setMobileOpen(false); }}
          className={`sidebar-item w-full text-left ${activeView === 'group-chat' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Group Chat</span>
          <span className="ml-auto text-xs text-text-muted">{selectedClass?.name}</span>
        </button>

        <div className="my-3 border-t border-border-subtle" />

        {/* Private Chats */}
        <button
          className="w-full flex items-center justify-between px-2 py-1 text-text-muted hover:text-text-secondary transition-colors text-xs font-semibold uppercase tracking-wider"
          onClick={() => setChatsExpanded(!chatsExpanded)}
        >
          <span className="flex items-center gap-1">
            {chatsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Direct Messages
          </span>
        </button>

        {chatsExpanded && (
          <div className="space-y-0.5 animate-fade-in">
            {myConversations.length === 0 ? (
              <p className="text-text-muted text-xs px-3 py-2">No conversations yet</p>
            ) : (
              myConversations.map(({ convId, other, lastMsg }) => (
                <button
                  key={convId}
                  id={`conv-${convId}`}
                  onClick={() => { setSelectedConv(convId); setMobileOpen(false); }}
                  className={`channel-item w-full text-left ${activeView === 'private-chat' && selectedConvId === convId ? 'active' : ''}`}
                >
                  <Avatar initials={other?.initials || '?'} size="xs" role={other?.role} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium">{other?.name}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom user section */}
      <div className="p-3 border-t border-border-subtle flex-shrink-0 bg-bg-secondary">
        <div className="flex items-center gap-3">
          <Avatar initials={currentUser?.initials || '?'} size="sm" role={currentUser?.role} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">{currentUser?.name}</div>
            <RoleBadge role={currentUser?.role} />
          </div>
          <div className="flex items-center gap-1">
            <button
              id="notification-bell"
              onClick={toggleNotificationPanel}
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="notification-dot">{unreadCount}</span>
              )}
            </button>
            <button
              id="logout-btn"
              onClick={logout}
              className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-subtle h-screen flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-bg-secondary border border-border-default rounded-xl text-text-primary"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-bg-secondary h-full flex flex-col shadow-xl">
            <div className="absolute top-4 right-4">
              <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
