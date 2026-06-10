import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ShopProvider } from '@/contexts/ShopContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AdminAuthProvider>
      <ShopProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="admin/login" />
          <Stack.Screen name="admin/(dashboard)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ShopProvider>
    </AdminAuthProvider>
  );
}
