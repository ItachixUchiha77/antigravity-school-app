import { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useChatStore } from '../../src/store/index.js';
import { USERS } from '../../src/data/mockData.js';

function Avatar({ userId }) {
  const user = USERS[userId];
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'];
  const color  = colors[(userId?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <View style={{ width: 36, height: 36, backgroundColor: color, borderRadius: 18 }}
      className="items-center justify-center">
      <Text className="text-white text-xs font-bold">{user?.initials ?? '?'}</Text>
    </View>
  );
}

function ConvList({ convs, onSelect }) {
  if (convs.length === 0) {
    return (
      <View className="items-center mt-16">
        <Text className="text-4xl mb-3">💬</Text>
        <Text className="text-text-muted text-sm">No conversations yet</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={convs}
      keyExtractor={(c) => c.convId}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const last = item.lastMessage;
        return (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            className="flex-row items-center gap-3 py-3 border-b border-border-subtle"
          >
            <Avatar userId={item.other?.id} />
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-sm">{item.other?.name ?? 'Unknown'}</Text>
              <Text className="text-text-muted text-xs mt-0.5" numberOfLines={1}>
                {last?.text ?? 'No messages yet'}
              </Text>
            </View>
            <View className={`px-2 py-0.5 rounded-full ${
              item.other?.role === 'teacher' ? 'bg-warning/15' :
              item.other?.role === 'admin'   ? 'bg-danger/15' : 'bg-accent-blue/15'
            }`}>
              <Text className={`text-[10px] font-semibold capitalize ${
                item.other?.role === 'teacher' ? 'text-warning' :
                item.other?.role === 'admin'   ? 'text-danger'  : 'text-accent-blue-light'
              }`}>{item.other?.role}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

function ChatThread({ conv, currentUser, onBack }) {
  const { messages, fetchMessages, sendMessage } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const msgs = messages[conv.convId] || [];
  const isAdminToStudent =
    conv.other?.role === 'admin' && currentUser?.role === 'student';

  useEffect(() => { fetchMessages(conv.convId); }, [conv.convId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(conv.convId, text.trim());
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { /* silent */ }
    setSending(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-primary"
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3 bg-bg-secondary border-b border-border-subtle">
        <TouchableOpacity onPress={onBack}>
          <Text className="text-accent-blue-light text-base">← Back</Text>
        </TouchableOpacity>
        <Avatar userId={conv.other?.id} />
        <View>
          <Text className="text-text-primary font-semibold text-sm">{conv.other?.name}</Text>
          <Text className="text-text-muted text-xs capitalize">{conv.other?.role}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUser?.id;
          return (
            <View className={`mb-2 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
              <View className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                isMine ? 'bg-accent-blue/30 border border-accent-blue/20 rounded-tr-sm'
                        : 'bg-bg-elevated border border-border-default rounded-tl-sm'
              }`}>
                <Text className="text-text-primary text-sm leading-5">{item.text}</Text>
                <Text className="text-text-muted text-[10px] mt-1 text-right">
                  {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-text-muted text-sm">No messages yet</Text>
          </View>
        }
      />

      {isAdminToStudent ? (
        <View className="px-4 py-3 bg-bg-elevated border-t border-border-subtle">
          <Text className="text-text-muted text-xs text-center">Only the principal can send messages in this chat</Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 px-4 py-3 bg-bg-secondary border-t border-border-subtle">
          <TextInput
            className="flex-1 bg-bg-elevated border border-border-default text-text-primary rounded-xl px-4 py-3 text-sm"
            placeholder="Type a message…"
            placeholderTextColor="#64748B"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !text.trim()}
            className={`w-10 h-10 rounded-xl items-center justify-center ${text.trim() ? 'bg-accent-blue' : 'bg-bg-elevated'}`}
          >
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text className="text-white text-base">↑</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const { currentUser }                               = useAuthStore();
  const { conversations, fetchConversations }         = useChatStore();
  const [selectedConv, setSelectedConv]               = useState(null);

  useEffect(() => { fetchConversations(); }, []);

  if (selectedConv) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary" edges={['bottom']}>
        <ChatThread conv={selectedConv} currentUser={currentUser} onBack={() => setSelectedConv(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['bottom']}>
      <ConvList convs={conversations} onSelect={setSelectedConv} />
    </SafeAreaView>
  );
}
