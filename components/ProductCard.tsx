import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Product } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const CARD_WIDTH = (Dimensions.get('window').width - Spacing.md * 2 - Spacing.sm) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

export function ProductCard({
  product,
  onPress,
  width = CARD_WIDTH,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={[styles.image, product.is_sold_out && styles.soldOutImage]}
          resizeMode="cover"
        />
        {product.is_sold_out && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {(product.available_sizes || []).length > 0 && (
          <Text style={styles.sizes}>
            Sizes {product.available_sizes.join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldOutImage: {
    opacity: 0.6,
  },
  soldOutOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 1,
  },
  info: {
    padding: Spacing.sm,
  },
  brand: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
});
