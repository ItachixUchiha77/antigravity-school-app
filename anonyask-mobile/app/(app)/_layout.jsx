import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, View } from 'react-native';
import { useAuthStore, useNotificationStore } from '../../src/store/index.js';
import { useEffect } from 'react';

function TabIcon({ label, emoji, focused }) {
  return (
    <View className="items-center justify-center pt-1">
      <Text className={`text-xl ${focused ? 'opacity-100' : 'opacity-50'}`}>{emoji}</Text>
      <Text className={`text-[10px] mt-0.5 ${focused ? 'text-accent-blue-light' : 'text-text-muted'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const { currentUser, logout } = useAuthStore();
  const { fetchNotifications, notifications } = useNotificationStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/(auth)/login');
      return;
    }
    fetchNotifications();
  }, [currentUser]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0E1117' },
        headerTintColor: '#F1F5F9',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0E1117',
          borderTopColor: '#1E2433',
          height: 60,
          paddingBottom: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="qna"
        options={{
          title: 'Q&A',
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              className="mr-4 px-3 py-1 bg-danger/20 rounded-lg"
            >
              <Text className="text-danger text-xs font-semibold">Logout</Text>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused }) => <TabIcon label="Q&A" emoji="❓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Announcements',
          tabBarIcon: ({ focused }) => <TabIcon label="News" emoji="📢" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon label="Chat" emoji="💬" focused={focused} />
              {unread > 0 && (
                <View className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">{unread}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ focused }) => <TabIcon label="Videos" emoji="🎬" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
