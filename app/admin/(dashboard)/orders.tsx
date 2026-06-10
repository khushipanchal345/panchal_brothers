import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: Colors.warningLight, text: Colors.warning },
  processing: { bg: '#E8F0FF', text: '#3B6FE0' },
  shipped: { bg: '#E8F7F2', text: Colors.success },
  delivered: { bg: Colors.successLight, text: Colors.success },
  cancelled: { bg: Colors.errorLight, text: Colors.error },
};

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let builder = supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, images))')
      .order('created_at', { ascending: false });
    if (activeStatus !== 'all') {
      builder = builder.eq('status', activeStatus);
    }
    const { data } = await builder;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [activeStatus]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    await load();
    setUpdating(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Orders</Text>
      </View>

      <View style={styles.filterRow}>
        {['all', ...STATUSES].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, activeStatus === s && styles.statusChipActive]}
            onPress={() => setActiveStatus(s)}
          >
            <Text style={[styles.statusChipText, activeStatus === s && styles.statusChipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.customerName}>{item.customer_name || 'Guest'}</Text>
                  <Text style={styles.customerEmail}>{item.customer_email}</Text>
                  <Text style={styles.total}>Total: ${Number(item.total).toFixed(2)}</Text>
                </View>
                <View style={styles.statusActions}>
                  <Text style={styles.updateLabel}>Update Status:</Text>
                  <View style={styles.statusBtns}>
                    {STATUSES.filter((s) => s !== item.status).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusUpdateBtn, updating === item.id && { opacity: 0.5 }]}
                        onPress={() => updateStatus(item.id, s)}
                        disabled={!!updating}
                      >
                        <Text style={styles.statusUpdateText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm, marginLeft: -Spacing.sm },
  title: { ...Typography.headingMedium, color: Colors.textPrimary, flex: 1, marginLeft: Spacing.sm },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  statusChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusChipText: { ...Typography.labelSmall, color: Colors.textSecondary },
  statusChipTextActive: { color: Colors.textInverse },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  list: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { ...Typography.labelLarge, color: Colors.textPrimary },
  orderDate: { ...Typography.bodySmall, color: Colors.textTertiary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: { ...Typography.labelSmall, fontWeight: '700' },
  cardBody: { gap: 2, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  customerName: { ...Typography.labelLarge, color: Colors.textPrimary },
  customerEmail: { ...Typography.bodySmall, color: Colors.textSecondary },
  total: { ...Typography.labelLarge, color: Colors.textPrimary, marginTop: Spacing.xs },
  statusActions: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm },
  updateLabel: { ...Typography.labelSmall, color: Colors.textTertiary, marginBottom: Spacing.xs },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  statusUpdateBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusUpdateText: { ...Typography.labelSmall, color: Colors.textSecondary },
});
