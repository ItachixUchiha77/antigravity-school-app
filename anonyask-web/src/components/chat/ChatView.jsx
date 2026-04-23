import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, useUIStore, useChatStore } from '../../store/index.js';
import { USERS, CLASSES } from '../../data/mockData.js';
import { Avatar, Timestamp, EmptyState } from '../ui/index.jsx';
import { Send, Image, Lock, ShieldAlert, Mic, Square } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

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
          {message.type === 'voice' ? (
            <div className="flex items-center gap-2 min-w-[180px]">
              <Mic size={13} className="text-accent-blue-light flex-shrink-0" />
              <audio
                controls
                src={message.audioUrl}
                className="flex-1"
                style={{ height: '28px', maxWidth: '200px' }}
              />
              <span className="text-[10px] text-text-muted flex-shrink-0">{fmtTime(message.duration || 0)}</span>
            </div>
          ) : message.type === 'image' ? (
            <img
              src={message.imageUrl}
              alt="shared image"
              className="max-w-[240px] max-h-[320px] rounded-xl object-cover cursor-pointer"
              onClick={() => window.open(message.imageUrl, '_blank')}
            />
          ) : (
            <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">{message.text}</p>
          )}
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

// ─── Message Input (with mic + image) ────────────────────────────────────────
function MessageInput({ onSend, onSendVoice, onSendImage, placeholder }) {
  const [text,        setText]        = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recTime,     setRecTime]     = useState(0);
  const mediaRecRef  = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const recTimeRef   = useRef(0);
  const fileInputRef = useRef(null);
  const textRef      = useRef('');
  const sendingRef   = useRef(false);

  const handleChange = (e) => {
    setText(e.target.value);
    textRef.current = e.target.value;
  };

  const handleSend = () => {
    const val = textRef.current.trim();
    if (!val || sendingRef.current) return;
    // Lock synchronously before anything async can run
    sendingRef.current = true;
    textRef.current = '';
    setText('');
    onSend(val);
    // Release after the current event loop so fast typing isn't blocked
    setTimeout(() => { sendingRef.current = false; }, 0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        onSendVoice(url, recTimeRef.current);
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        recTimeRef.current = 0;
        setRecTime(0);
      };

      mediaRecRef.current.start();
      recTimeRef.current = 0;
      setRecTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        recTimeRef.current += 1;
        setRecTime(recTimeRef.current);
      }, 1000);
    } catch {
      alert('Microphone permission denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onSendImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  if (isRecording) {
    return (
      <div className="p-4 border-t border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 bg-danger rounded-full animate-pulse flex-shrink-0" />
            <Mic size={16} className="text-danger flex-shrink-0" />
            <span className="text-sm text-danger font-semibold">{fmtTime(recTime)}</span>
            <span className="text-xs text-text-muted ml-1">Recording…</span>
          </div>
          <button
            onClick={stopRecording}
            className="p-2.5 rounded-xl bg-danger/15 border border-danger/30 text-danger hover:bg-danger/25 transition-colors"
            title="Stop & send"
          >
            <Square size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border-subtle bg-bg-secondary flex-shrink-0">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-text-muted hover:text-text-secondary hover:bg-bg-elevated rounded-lg transition-colors"
          title="Attach image"
        >
          <Image size={18} />
        </button>
        <input
          id="chat-input"
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.repeat) { e.preventDefault(); handleSend(); } }}
          placeholder={placeholder}
          className="input-field flex-1 py-2.5 text-sm"
        />
        {/* Mic button */}
        <button
          onClick={startRecording}
          className="p-2 text-text-muted hover:text-accent-blue-light hover:bg-accent-blue/10 rounded-lg transition-colors"
          title="Record voice message"
        >
          <Mic size={18} />
        </button>
        <button
          id="send-btn"
          type="button"
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
  const { privateMessages, sendPrivateMessage, sendPrivateVoice, sendPrivateImage, loadConversationMessages } = useChatStore();
  const bottomRef = useRef(null);

  const conv      = selectedConvId ? privateMessages[selectedConvId] : null;
  const messages  = conv?.messages || [];
  const otherUserId = conv?.participants.find((p) => p !== currentUser?.id);
  const otherUser   = USERS[otherUserId];

  // Load messages from API when conversation is opened
  useEffect(() => {
    if (selectedConvId) loadConversationMessages(selectedConvId);
  }, [selectedConvId]);

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

      {/* Input area */}
      {currentUser?.role === 'student' && otherUser?.role === 'admin' ? (
        <div className="p-4 border-t border-border-subtle bg-bg-secondary flex-shrink-0 flex items-center gap-3">
          <ShieldAlert size={16} className="text-text-muted flex-shrink-0" />
          <p className="text-xs text-text-muted">
            Only <span className="font-semibold text-text-secondary">{otherUser.name}</span> can send messages in this conversation.
          </p>
        </div>
      ) : (
        <MessageInput
          onSend={(text) => sendPrivateMessage(selectedConvId, text)}
          onSendVoice={(url, dur) => sendPrivateVoice(selectedConvId, url, dur)}
          onSendImage={(url) => sendPrivateImage(selectedConvId, url)}
          placeholder={`Message ${otherUser?.name}…`}
        />
      )}
    </div>
  );
}

// ─── Group Chat View ──────────────────────────────────────────────────────────
export function GroupChatView() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const { selectedClassId } = useUIStore();
  const { groupMessages, sendGroupMessage, sendGroupVoice, sendGroupImage, loadGroupMessages } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedClassId) loadGroupMessages(selectedClassId);
  }, [selectedClassId]);

  const selectedClass = CLASSES[selectedClassId] || CLASSES.find((c) => c.id === selectedClassId);
  const messages = groupMessages[selectedClassId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-lg flex-shrink-0">
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
          <EmptyState
            icon="👥"
            title="No messages yet"
            description="Be the first to say something in the group!"
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
        onSend={(text) => sendGroupMessage(selectedClassId, text)}
        onSendVoice={(url, dur) => sendGroupVoice(selectedClassId, url, dur)}
        onSendImage={(url) => sendGroupImage(selectedClassId, url)}
        placeholder={`Message ${selectedClass?.name}…`}
      />
    </div>
  );
}
