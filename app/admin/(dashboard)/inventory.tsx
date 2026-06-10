import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function AdminInventoryScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateQty = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stock_quantity + delta);
    setUpdating(product.id);
    await supabase
      .from('products')
      .update({ stock_quantity: newQty, is_sold_out: newQty === 0 })
      .eq('id', product.id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, stock_quantity: newQty, is_sold_out: newQty === 0 }
          : p
      )
    );
    setUpdating(null);
  };

  const filtered = products.filter((p) => {
    if (filter === 'out') return p.stock_quantity === 0;
    if (filter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= 5;
    return true;
  });

  const outCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Inventory</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: Colors.errorLight }]}>
          <Text style={[styles.summaryNum, { color: Colors.error }]}>{outCount}</Text>
          <Text style={styles.summaryLabel}>Sold Out</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.warningLight }]}>
          <Text style={[styles.summaryNum, { color: Colors.warning }]}>{lowCount}</Text>
          <Text style={styles.summaryLabel}>Low Stock (≤5)</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.successLight }]}>
          <Text style={[styles.summaryNum, { color: Colors.success }]}>{products.length}</Text>
          <Text style={styles.summaryLabel}>Total Products</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'low', 'out'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Sold Out'}
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
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isOut = item.stock_quantity === 0;
            const isLow = !isOut && item.stock_quantity <= 5;
            return (
              <View style={[styles.card, isOut && styles.cardOut]}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.brand}>{item.brand}</Text>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  {isOut && (
                    <View style={styles.outBadge}>
                      <Text style={styles.outText}>Sold Out</Text>
                    </View>
                  )}
                  {isLow && !isOut && (
                    <View style={styles.lowBadge}>
                      <AlertTriangle size={10} color={Colors.warning} />
                      <Text style={styles.lowText}>Low: {item.stock_quantity}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item, -1)}
                    disabled={item.stock_quantity === 0 || updating === item.id}
                  >
                    <Minus size={14} color={item.stock_quantity === 0 ? Colors.border : Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.stock_quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item, 1)}
                    disabled={updating === item.id}
                  >
                    <Plus size={14} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No products found</Text>
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
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  summaryNum: { ...Typography.headingMedium },
  summaryLabel: { ...Typography.labelSmall, color: Colors.textSecondary, textAlign: 'center' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { ...Typography.labelSmall, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textInverse },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  list: { padding: Spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    ...Shadows.sm,
  },
  cardOut: { opacity: 0.7 },
  thumb: { width: 72, height: 72, backgroundColor: Colors.surfaceElevated },
  info: { flex: 1, padding: Spacing.sm },
  brand: { ...Typography.labelSmall, color: Colors.textTertiary, textTransform: 'uppercase' },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600', marginBottom: 1 },
  outBadge: {
    alignSelf: 'flex-start',
    marginTop: 3,
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  outText: { ...Typography.labelSmall, color: Colors.error, fontSize: 9 },
  lowBadge: {
    alignSelf: 'flex-start',
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  lowText: { ...Typography.labelSmall, color: Colors.warning, fontSize: 9 },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  qty: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
});
