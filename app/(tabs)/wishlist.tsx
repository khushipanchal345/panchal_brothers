import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { useShop } from '@/contexts/ShopContext';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { WishlistItem } from '@/types';

export default function WishlistScreen() {
  const router = useRouter();
  const { wishlistItems } = useShop();

  if (wishlistItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <View style={styles.empty}>
          <Heart size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>Save your favourite shoes here</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.count}>{wishlistItems.length} items</Text>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: WishlistItem }) => {
          if (!item.product) return null;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/product/${item.product_id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.product.images[0] }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brand}>{item.product.brand}</Text>
                  <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
                  {(item.product.available_sizes || []).length > 0 && (
                    <Text style={styles.sizes}>Sizes {item.product.available_sizes.join(', ')}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => router.push(`/product/${item.product_id}`)}
                >
                  <ShoppingBag size={14} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>View Product</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
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
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.headingLarge, color: Colors.textPrimary },
  count: { ...Typography.bodyMedium, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyTitle: { ...Typography.headingMedium, color: Colors.textPrimary },
  emptyText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  shopBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  shopBtnText: { ...Typography.labelLarge, color: Colors.textInverse },
  list: { padding: Spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  image: {
    width: 120,
    height: 120,
    backgroundColor: Colors.surfaceElevated,
  },
  info: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  brand: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sizes: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  addBtnText: { ...Typography.labelSmall, color: Colors.textInverse },
});
