import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Star } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function AdminProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('products').update({ is_active: false }).eq('id', product.id);
            await load();
          },
        },
      ]
    );
  };

  const filtered = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/admin/product-form')}
        >
          <Plus size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Search size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.images[0] }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.brand}>{item.brand}</Text>
                  {item.is_featured && <Star size={12} color={Colors.warning} fill={Colors.warning} />}
                  {!item.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>Hidden</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>
                  ${item.price.toFixed(2)}
                  {item.sale_price ? ` → $${item.sale_price.toFixed(2)}` : ''}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push({ pathname: '/admin/product-form', params: { id: item.id } })}
                >
                  <Edit2 size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item)}
                >
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: { flex: 1, ...Typography.bodyMedium, color: Colors.textPrimary },
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
  thumb: { width: 80, height: 80, backgroundColor: Colors.surfaceElevated },
  info: { flex: 1, padding: Spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  brand: { ...Typography.labelSmall, color: Colors.textTertiary, textTransform: 'uppercase' },
  name: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '600', marginBottom: 2 },
  price: { ...Typography.labelMedium, color: Colors.textPrimary },
  inactiveBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  inactiveText: { ...Typography.labelSmall, color: Colors.textTertiary, fontSize: 9 },
  actions: { flexDirection: 'column', gap: Spacing.sm, padding: Spacing.sm },
  actionBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
  },
  deleteBtn: { backgroundColor: Colors.errorLight },
});
