import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/index.js';
import { VIDEOS, SUBJECTS, USERS } from '../../src/data/mockData.js';

function VideoCard({ video }) {
  const subject  = SUBJECTS.find((s) => s.id === video.subjectId);
  const uploader = USERS[video.uploadedBy];
  const date     = new Date(video.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(video.url)}
      activeOpacity={0.8}
      className="bg-bg-elevated border border-border-default rounded-2xl mb-3 overflow-hidden"
    >
      {/* Thumbnail */}
      <View className="h-32 bg-bg-card items-center justify-center">
        <Text className="text-6xl">{video.thumbnail}</Text>
        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">{video.duration}</Text>
        </View>
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-white text-xl">▶</Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-text-primary font-semibold text-sm mb-1 leading-5">{video.title}</Text>
        <Text className="text-text-muted text-xs mb-2 leading-4" numberOfLines={2}>{video.description}</Text>
        <View className="flex-row items-center gap-2">
          {subject && (
            <View className="flex-row items-center gap-1 bg-bg-card px-2 py-0.5 rounded-full">
              <Text className="text-xs">{subject.emoji}</Text>
              <Text className="text-xs text-text-muted">{subject.name}</Text>
            </View>
          )}
          <Text className="text-text-muted text-xs">{uploader?.name} · {date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function VideosScreen() {
  const { currentUser } = useAuthStore();
  const [videos] = useState(VIDEOS);

  const classId = currentUser?.classId || 'cls-10a';
  const classVideos = videos.filter((v) => v.classId === classId);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['bottom']}>
      <FlatList
        data={classVideos}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-4xl mb-3">🎬</Text>
            <Text className="text-text-muted text-sm">No videos uploaded yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
