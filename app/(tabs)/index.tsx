import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { useShop } from '@/contexts/ShopContext';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

const BRANDS = ['All', 'The Souled Store'];

export default function HomeScreen() {
  const router = useRouter();
  const { cartCount } = useShop();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Product[]>([]);
  const [activeBrand, setActiveBrand] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [featuredRes, recentRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(6),
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);
    setFeatured((featuredRes.data as Product[]) || []);
    setRecent((recentRes.data as Product[]) || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredRecent = activeBrand === 'All'
    ? recent
    : recent.filter((p) => p.brand === activeBrand);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day</Text>
            <Text style={styles.headerTitle}>panchal_brothers</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/(tabs)/cart')}>
            <ShoppingBag size={22} color={Colors.textPrimary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dcsdd3wg8/image/upload/v1781087657/IMG_20260610_160200_pxproy.jpg' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>NEW COLLECTION</Text>
            <Text style={styles.heroTitle}>Run Further.{'\n'}Push Harder.</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.heroBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : featured.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    width={190}
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                ))}
          </ScrollView>
        </View>

        {/* Brand Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[styles.brandChip, activeBrand === brand && styles.brandChipActive]}
                onPress={() => setActiveBrand(brand)}
              >
                <Text style={[styles.brandChipText, activeBrand === brand && styles.brandChipTextActive]}>
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.productGrid}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : filteredRecent.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/product/${product.id}`)}
                  />
                ))}
          </View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  greeting: { ...Typography.bodySmall, color: Colors.textTertiary },
  headerTitle: { ...Typography.headingLarge, color: Colors.textPrimary, letterSpacing: -0.5 },
  cartBtn: {
    position: 'relative',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    ...Shadows.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { ...Typography.labelSmall, color: Colors.textInverse, fontSize: 9 },
  heroBanner: {
  height: width >= 1024 ? 500 : 280,
  borderRadius: 24,
  overflow: 'hidden',
  marginHorizontal: 16,
  marginBottom: 24,
},
  heroImage: {
  width: '100%',
  height: '100%',
},
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  heroTag: {
    ...Typography.labelSmall,
    color: Colors.accent,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    ...Typography.displayMedium,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  heroBtn: {
    backgroundColor: Colors.textInverse,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  heroBtnText: { ...Typography.labelLarge, color: Colors.textPrimary },
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.headingMedium, color: Colors.textPrimary },
  seeAll: { ...Typography.labelMedium, color: Colors.accent },
  featuredScroll: { gap: Spacing.sm, paddingBottom: 4 },
  brandScroll: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  brandChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  brandChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  brandChipText: { ...Typography.labelMedium, color: Colors.textSecondary },
  brandChipTextActive: { color: Colors.textInverse },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
