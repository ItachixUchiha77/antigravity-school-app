import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, useUIStore, useChatStore } from '../../store/index.js';
import { USERS, CLASSES } from '../../data/mockData.js';
import { Avatar, Timestamp, EmptyState } from '../ui/index.jsx';
import { Send, Image, Lock } from 'lucide-react';

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, isMine, sender }) {
  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && (
        <Avatar initials={sender?.initials || '?'} size="sm" role={sender?.role} className="mb-1" />
      )}
      <div className={isMine ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
        {!isMine && (
          <span className="text-xs text-text-muted mb-1 ml-1">{sender?.name}</span>
        )}
        <div className={isMine ? 'message-bubble-sent' : 'message-bubble-received'}>
          <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">{message.text}</p>
        </div>
        <div className={`text-[10px] text-text-muted mt-1 ${isMine ? 'mr-1 text-right' : 'ml-1'}`}>
          <Timestamp date={message.createdAt} />
          {isMine && <span className="ml-1">✓✓</span>}
        </div>
      </div>
      {isMine && (
        <Avatar initials={USERS[message.senderId]?.initials || '?'} size="sm" role={USERS[message.senderId]?.role} className="mb-1" />
      )}
    </div>
  );
}

// ─── Message Input ────────────────────────────────────────────────────────────
function MessageInput({ onSend, placeholder }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="p-4 border-t border-border-subtle bg-bg-secondary flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="p-2 text-text-muted hover:text-text-secondary hover:bg-bg-elevated rounded-lg transition-colors" title="Attach image (coming soon)">
          <Image size={18} />
        </button>
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder}
          className="input-field flex-1 py-2.5 text-sm"
        />
        <button
          id="send-btn"
          onClick={handleSend}
          disabled={!text.trim()}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Private Chat View ────────────────────────────────────────────────────────
export function PrivateChatView() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { selectedConvId } = useUIStore();
  const { privateMessages, sendPrivateMessage } = useChatStore();
  const bottomRef    = useRef(null);

  const conv = selectedConvId ? privateMessages[selectedConvId] : null;
  const messages = conv?.messages || [];
  const otherUserId = conv?.participants.find((p) => p !== currentUser?.id);
  const otherUser   = USERS[otherUserId];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!selectedConvId || !conv) {
    return (
      <EmptyState
        icon="💬"
        title="No conversation selected"
        description="Select a private conversation from the sidebar to start chatting."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar initials={otherUser?.initials || '?'} size="md" role={otherUser?.role} />
          <div>
            <h2 className="font-bold text-text-primary">{otherUser?.name}</h2>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Lock size={11} />
              <span>Private conversation · Not anonymous</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs text-success">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Start the conversation"
            description={`Send a private message to ${otherUser?.name}.`}
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUser?.id}
              sender={USERS[msg.senderId]}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={(text) => sendPrivateMessage(selectedConvId, text, currentUser?.id)}
        placeholder={`Message ${otherUser?.name}...`}
      />
    </div>
  );
}

// ─── Group Chat View ──────────────────────────────────────────────────────────
export function GroupChatView() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { selectedClassId } = useUIStore();
  const { groupMessages, sendGroupMessage } = useChatStore();
  const bottomRef    = useRef(null);

  const selectedClass = CLASSES.find((c) => c.id === selectedClassId);
  const messages = groupMessages[selectedClassId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-lg">
            👥
          </div>
          <div>
            <h2 className="font-bold text-text-primary">{selectedClass?.name} · General</h2>
            <p className="text-text-muted text-xs">{selectedClass?.studentCount} students · Not anonymous</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.length === 0 ? (
          <EmptyState icon="👥" title="No messages yet" description="Be the first to say something in the group!" />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUser?.id}
              sender={USERS[msg.senderId]}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={(text) => sendGroupMessage(selectedClassId, text, currentUser?.id)}
        placeholder={`Message ${selectedClass?.name}...`}
      />
    </div>
  );
}
