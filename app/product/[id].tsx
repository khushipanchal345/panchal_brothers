import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { SizeSelector } from '@/components/SizeSelector';
import { useShop } from '@/contexts/ShopContext';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlistItems } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .maybeSingle()
      .then((res) => {
        if (res.data) {
          const p = res.data as Product;
          p.available_sizes = (p.available_sizes || []).map((s) => Number(s));
          setProduct(p);
        }
      });
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <View style={styles.shimmerImage} />
          <View style={styles.shimmerContent}>
            <View style={[styles.shimmer, { width: '40%', height: 12 }]} />
            <View style={[styles.shimmer, { width: '80%', height: 20 }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = async () => {
    if (selectedSize === null) return;
    await addToCart(product.id, selectedSize.toString(), 1);
    router.push('/(tabs)/cart');
  };

  const isWishlisted = wishlistItems.some((i) => i.product_id === product.id);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Gallery */}
        <View style={styles.gallery}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImage(idx);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Nav Overlay */}
          <SafeAreaView style={styles.navOverlay} edges={['top']}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={() => toggleWishlist(product.id)}>
              <Heart
                size={20}
                color={isWishlisted ? '#E53935' : Colors.textPrimary}
                fill={isWishlisted ? '#E53935' : 'transparent'}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Dots */}
          {product.images.length > 1 && (
            <View style={styles.dots}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.topInfo}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name}>{product.name}</Text>
            {product.category && (
              <Text style={styles.category}>{product.category.name}</Text>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Size Selector */}
          <SizeSelector
            availableSizes={product.available_sizes || []}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addBtn, selectedSize === null && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={selectedSize === null}
          activeOpacity={0.8}
        >
          <ShoppingBag size={18} color={Colors.textInverse} />
          <Text style={styles.addBtnText}>
            {selectedSize !== null ? 'Add to Cart' : 'Select Size'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  safe: { flex: 1, backgroundColor: Colors.surface },
  loadingContainer: { flex: 1 },
  shimmerImage: { width, height: width * 0.9, backgroundColor: Colors.shimmer },
  shimmerContent: { padding: Spacing.md, gap: Spacing.sm },
  shimmer: { backgroundColor: Colors.shimmer, borderRadius: Radius.sm },
  gallery: { width, height: width * 0.9, backgroundColor: Colors.surfaceElevated },
  heroImage: { width, height: width * 0.9 },
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  navBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    padding: 8,
    ...Shadows.sm,
  },
  dots: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: Colors.textInverse, width: 18 },
  content: { padding: Spacing.md },
  topInfo: { marginBottom: Spacing.md },
  brand: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: { ...Typography.headingLarge, color: Colors.textPrimary },
  category: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  description: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.md,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
  },
  addBtnDisabled: {
    backgroundColor: Colors.border,
  },
  addBtnText: { ...Typography.labelLarge, color: Colors.textInverse },
});
