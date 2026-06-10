import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Category } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - Spacing.md * 2 - Spacing.sm * 2) / 3;

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  size?: number;
}

export function CategoryCard({ category, onPress, size = CARD_SIZE }: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {category.image_url ? (
        <Image
          source={{ uri: category.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.overlay} />
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Colors.primaryLight,
    ...Shadows.sm,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.border,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  name: {
    ...Typography.labelMedium,
    color: Colors.textInverse,
    padding: Spacing.sm,
    letterSpacing: 0.3,
  },
});
