import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  Shield,
  ChevronRight,
  Package,
} from 'lucide-react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

interface MenuRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, danger }: MenuRowProps) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>{icon}</View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <ChevronRight size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <User size={36} color={Colors.textInverse} />
          </View>
          <Text style={styles.guestLabel}>Guest Shopper</Text>
          <Text style={styles.guestSub}>Browsing as a guest</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping</Text>
          <View style={styles.card}>
            <MenuRow
              icon={<ShoppingBag size={18} color={Colors.textPrimary} />}
              label="My Cart"
              onPress={() => router.push('/(tabs)/cart')}
            />
            <View style={styles.divider} />
            <MenuRow
              icon={<Heart size={18} color={Colors.textPrimary} />}
              label="My Wishlist"
              onPress={() => router.push('/(tabs)/wishlist')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <View style={styles.card}>
            <MenuRow
              icon={<Shield size={18} color={Colors.textPrimary} />}
              label="Admin Dashboard"
              onPress={() => router.push('/admin/login')}
            />
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>panchal_brothers</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { ...Typography.headingLarge, color: Colors.textPrimary },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  guestLabel: { ...Typography.headingMedium, color: Colors.textPrimary },
  guestSub: { ...Typography.bodyMedium, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: {
    ...Typography.labelMedium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorLight },
  menuLabel: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1, fontWeight: '500' },
  menuLabelDanger: { color: Colors.error },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md + 36 + Spacing.md },
  appInfo: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  appName: { ...Typography.labelLarge, color: Colors.textSecondary },
  appVersion: { ...Typography.bodySmall, color: Colors.textTertiary },
});
