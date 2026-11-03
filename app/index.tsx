import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user, loading } = useAuthStore();

  if (loading) return null;

  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
