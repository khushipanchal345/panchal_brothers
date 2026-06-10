import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminDashboardLayout() {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/admin/login');
    }
  }, [admin, loading]);

  if (loading || !admin) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="product-form" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="inventory" />
    </Stack>
  );
}
