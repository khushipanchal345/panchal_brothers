import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product, FilterOptions } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { FilterModal } from '@/components/FilterModal';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filterVisible, setFilterVisible] = useState(false);

  const search = useCallback(async (q: string, f: FilterOptions) => {
    setLoading(true);
    let builder = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    if (q.trim()) {
      builder = builder.ilike('name', `%${q.trim()}%`);
    }
    if (f.brand) {
      builder = builder.eq('brand', f.brand);
    }
    if (f.minPrice !== undefined) {
      builder = builder.gte('price', f.minPrice);
    }
    if (f.maxPrice !== undefined && f.maxPrice < 9999) {
      builder = builder.lte('price', f.maxPrice);
    }
    if (f.sortBy === 'price_asc') builder = builder.order('price', { ascending: true });
    else if (f.sortBy === 'price_desc') builder = builder.order('price', { ascending: false });
    else if (f.sortBy === 'name') builder = builder.order('name', { ascending: true });
    else builder = builder.order('created_at', { ascending: false });

    const { data } = await builder.limit(50);
    let results = (data as Product[]) || [];

    if (f.sizes && f.sizes.length > 0) {
      const { data: invData } = await supabase
        .from('inventory')
        .select('product_id')
        .in('size', f.sizes)
        .gt('stock_quantity', 0);
      const ids = new Set((invData || []).map((i: any) => i.product_id));
      results = results.filter((p) => ids.has(p.id));
    }

    setProducts(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query, filters), 300);
    return () => clearTimeout(timer);
  }, [query, filters, search]);

  const activeFilterCount = [
    filters.brand,
    filters.minPrice !== undefined,
    filters.sizes?.length,
    filters.sortBy,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="Search shoes, brands..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <SlidersHorizontal size={18} color={activeFilterCount > 0 ? Colors.textInverse : Colors.textPrimary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Search size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            {query ? `Try searching for something else` : 'Start typing to search products'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
            />
          )}
        />
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { ...Typography.headingLarge, color: Colors.textPrimary },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  filterBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
    position: 'relative',
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { ...Typography.labelSmall, color: Colors.textInverse, fontSize: 9 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: { ...Typography.headingSmall, color: Colors.textPrimary },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  row: { gap: Spacing.sm },
});
