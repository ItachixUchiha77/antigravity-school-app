import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/index.js';

export default function Index() {
  const currentUser = useAuthStore((s) => s.currentUser);
  return <Redirect href={currentUser ? '/(app)/qna' : '/(auth)/login'} />;
}
