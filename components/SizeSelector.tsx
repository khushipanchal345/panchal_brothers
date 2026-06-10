import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

const ALL_SIZES = [7, 8, 9, 10, 11];

interface SizeSelectorProps {
  availableSizes: (number | string)[];
  selectedSize: number | null;
  onSelect: (size: number) => void;
}

export function SizeSelector({ availableSizes, selectedSize, onSelect }: SizeSelectorProps) {
  const available = new Set(availableSizes.map((s) => Number(s)));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Select Size</Text>
        {selectedSize !== null && <Text style={styles.selected}>US {selectedSize}</Text>}
      </View>
      <View style={styles.grid}>
        {ALL_SIZES.map((size) => {
          const isAvailable = available.has(size);
          const isSelected = selectedSize === size;
          return (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeBtn,
                isSelected && styles.sizeBtnSelected,
                !isAvailable && styles.sizeBtnDisabled,
              ]}
              onPress={() => isAvailable && onSelect(size)}
              disabled={!isAvailable}
              activeOpacity={isAvailable ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.sizeText,
                  isSelected && styles.sizeTextSelected,
                  !isAvailable && styles.sizeTextDisabled,
                ]}
              >
                {size}
              </Text>
              {!isAvailable && (
                <>
                  <View style={styles.strikethrough} />
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>Please select a size to add to cart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
  },
  selected: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sizeBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  sizeBtnSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sizeBtnDisabled: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  sizeText: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  sizeTextSelected: {
    color: Colors.textInverse,
  },
  sizeTextDisabled: {
    color: Colors.textTertiary,
  },
  strikethrough: {
    position: 'absolute',
    height: 2,
    width: '70%',
    backgroundColor: Colors.textTertiary,
    transform: [{ rotate: '-20deg' }],
  },
  hint: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
});
