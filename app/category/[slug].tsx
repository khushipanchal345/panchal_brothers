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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product, Category, FilterOptions } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { FilterModal } from '@/components/FilterModal';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filterVisible, setFilterVisible] = useState(false);

  const loadProducts = useCallback(async (f: FilterOptions) => {
    setLoading(true);
    const catRes = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (catRes.data) setCategory(catRes.data as Category);

    let builder = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('category_id', catRes.data?.id);

    if (f.brand) builder = builder.eq('brand', f.brand);
    if (f.minPrice !== undefined) builder = builder.gte('price', f.minPrice);
    if (f.maxPrice !== undefined && f.maxPrice < 9999) builder = builder.lte('price', f.maxPrice);
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
  }, [slug]);

  useEffect(() => { loadProducts(filters); }, [filters, loadProducts]);

  const activeFilterCount = [filters.brand, filters.minPrice !== undefined, filters.sizes?.length, filters.sortBy].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {category?.name || slug}
        </Text>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <SlidersHorizontal size={18} color={activeFilterCount > 0 ? Colors.textInverse : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptyText}>Try adjusting your filters</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  title: { ...Typography.headingMedium, color: Colors.textPrimary, flex: 1 },
  filterBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { ...Typography.headingSmall, color: Colors.textPrimary },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  list: { padding: Spacing.md, paddingTop: 0, gap: Spacing.sm },
  row: { gap: Spacing.sm },
});
