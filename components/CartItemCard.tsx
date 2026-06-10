import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItem as CartItemType } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export function CartItemCard({ item, onRemove, onQuantityChange }: CartItemProps) {
  if (!item.product) return null;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text style={styles.brand}>{item.product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
            <Text style={styles.size}>Size: US {item.size}</Text>
          </View>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <View />
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onQuantityChange(item.quantity - 1)}
            >
              <Minus size={14} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onQuantityChange(item.quantity + 1)}
            >
              <Plus size={14} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: Colors.surfaceElevated,
  },
  details: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameBlock: {
    flex: 1,
    marginRight: Spacing.sm,
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
    marginBottom: 2,
  },
  size: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
});
