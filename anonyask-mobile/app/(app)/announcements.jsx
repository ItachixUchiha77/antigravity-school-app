import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncementStore, useAuthStore } from '../../src/store/index.js';
import { USERS } from '../../src/data/mockData.js';

const PRIORITY_STYLE = {
  urgent:    { bar: 'bg-danger',        badge: 'bg-danger/15 text-danger',       label: '🔴 Urgent' },
  important: { bar: 'bg-warning',       badge: 'bg-warning/15 text-warning',     label: '🟡 Important' },
  general:   { bar: 'bg-accent-blue',   badge: 'bg-accent-blue/15 text-accent-blue-light', label: '🔵 General' },
};

function AnnouncementCard({ ann }) {
  const [expanded, setExpanded] = useState(false);
  const p      = PRIORITY_STYLE[ann.priority] || PRIORITY_STYLE.general;
  const poster = USERS[ann.postedBy];
  const date   = new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.8}
      className="bg-bg-elevated border border-border-default rounded-2xl mb-3 overflow-hidden"
    >
      <View className={`h-1 ${p.bar}`} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2 mb-2">
          <Text className="text-text-primary font-semibold text-sm flex-1 leading-5">{ann.title}</Text>
          {ann.pinned && <Text className="text-lg">📌</Text>}
        </View>
        <View className="flex-row items-center gap-2 mb-3">
          <View className={`px-2 py-0.5 rounded-full ${p.badge.split(' ')[0]}`}>
            <Text className={`text-[10px] font-semibold ${p.badge.split(' ')[1]}`}>{p.label}</Text>
          </View>
          <Text className="text-text-muted text-xs">{poster?.name ?? 'Admin'} · {date}</Text>
        </View>
        {expanded && (
          <Text className="text-text-secondary text-sm leading-6 mt-1">{ann.content}</Text>
        )}
        <Text className="text-accent-blue-light text-xs mt-2">
          {expanded ? '▲ Show less' : '▼ Read more'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AnnouncementsScreen() {
  const { announcements, loading, fetchAnnouncements } = useAnnouncementStore();
  const { currentUser } = useAuthStore();

  useEffect(() => { fetchAnnouncements(); }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['bottom']}>
      {loading
        ? <ActivityIndicator color="#3B82F6" className="mt-10" />
        : (
          <FlatList
            data={announcements}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ padding: 16, paddingTop: 4 }}
            renderItem={({ item }) => <AnnouncementCard ann={item} />}
            ListEmptyComponent={
              <View className="items-center mt-16">
                <Text className="text-4xl mb-3">📢</Text>
                <Text className="text-text-muted text-sm">No announcements yet</Text>
              </View>
            }
          />
        )
      }
    </SafeAreaView>
  );
}
