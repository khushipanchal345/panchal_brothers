import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Package,
  ShoppingBag,
  Tag,
  TrendingUp,
  LogOut,
  ChevronRight,
  Box,
  List,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

interface Stats {
  products: number;
  orders: number;
  pending: number;
  revenue: number;
  lowStock: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, pending: 0, revenue: 0, lowStock: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    const [prodRes, ordersRes, pendingRes, lowStockRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('total', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('inventory').select('id', { count: 'exact', head: true }).lte('stock_quantity', 3).gt('stock_quantity', 0),
    ]);
    const revenue = (ordersRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);
    setStats({
      products: prodRes.count || 0,
      orders: ordersRes.count || 0,
      pending: pendingRes.count || 0,
      revenue,
      lowStock: lowStockRes.count || 0,
    });
    setRefreshing(false);
  };

  useEffect(() => { loadStats(); }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.adminName}>{admin?.username} @ panchal_brothers</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Products" value={stats.products} icon={<Package size={20} color={Colors.primary} />} />
          <StatCard label="Total Orders" value={stats.orders} icon={<ShoppingBag size={20} color={Colors.success} />} color={Colors.successLight} />
          <StatCard label="Pending" value={stats.pending} icon={<Tag size={20} color={Colors.warning} />} color={Colors.warningLight} />
          <StatCard
            label="Revenue"
            value={`$${stats.revenue.toFixed(0)}`}
            icon={<TrendingUp size={20} color={Colors.accent} />}
            color={Colors.errorLight}
          />
        </View>

        {stats.lowStock > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/admin/inventory')}
          >
            <Text style={styles.alertText}>
              ⚠️  {stats.lowStock} size(s) running low on stock
            </Text>
            <ChevronRight size={16} color={Colors.warning} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              label="Products"
              sub="Manage catalog"
              icon={<Package size={24} color={Colors.primary} />}
              onPress={() => router.push('/admin/products')}
            />
            <ActionCard
              label="Add Product"
              sub="New listing"
              icon={<Box size={24} color={Colors.success} />}
              onPress={() => router.push('/admin/product-form')}
            />
            <ActionCard
              label="Orders"
              sub="View all orders"
              icon={<List size={24} color={Colors.warning} />}
              onPress={() => router.push('/admin/orders')}
            />
            <ActionCard
              label="Inventory"
              sub="Stock levels"
              icon={<Tag size={24} color={Colors.accent} />}
              onPress={() => router.push('/admin/inventory')}
            />
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color = '#F0F0F0' }: { label: string; value: number | string; icon: React.ReactNode; color?: string }) {
  return (
    <View style={[statStyles.card, { backgroundColor: color }]}>
      <View style={statStyles.iconWrap}>{icon}</View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function ActionCard({ label, sub, icon, onPress }: { label: string; sub: string; icon: React.ReactNode; onPress: () => void }) {
  return (
    <TouchableOpacity style={actionStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={actionStyles.iconWrap}>{icon}</View>
      <Text style={actionStyles.label}>{label}</Text>
      <Text style={actionStyles.sub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  greeting: { ...Typography.bodySmall, color: Colors.textTertiary },
  adminName: { ...Typography.headingLarge, color: Colors.textPrimary },
  logoutBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  alertText: { ...Typography.labelMedium, color: Colors.warning },
  section: { paddingHorizontal: Spacing.md },
  sectionTitle: { ...Typography.headingMedium, color: Colors.textPrimary, marginBottom: Spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});

const statStyles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  value: { ...Typography.headingLarge, color: Colors.textPrimary },
  label: { ...Typography.bodySmall, color: Colors.textSecondary },
});

const actionStyles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    ...Shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  label: { ...Typography.labelLarge, color: Colors.textPrimary },
  sub: { ...Typography.bodySmall, color: Colors.textSecondary },
});
