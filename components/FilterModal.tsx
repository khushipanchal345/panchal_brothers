import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { FilterOptions } from '@/types';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
const BRANDS = ['New Balance', 'The Souled Store'];
const SIZES = ['7', '8', '9', '10', '11'];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' as const },
  
  { label: 'Name A-Z', value: 'name' as const },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

export function FilterModal({ visible, onClose, filters, onApply }: FilterModalProps) {
  const [local, setLocal] = React.useState<FilterOptions>(filters);

  const toggleBrand = (brand: string) => {
    setLocal((f) => ({ ...f, brand: f.brand === brand ? undefined : brand }));
  };

  const toggleSize = (size: string) => {
    setLocal((f) => {
      const sizes = f.sizes || [];
      return {
        ...f,
        sizes: sizes.includes(size) ? sizes.filter((s) => s !== size) : [...sizes, size],
      };
    });
  };

  const setPrice = (min: number, max: number) => {
    setLocal((f) => ({
      ...f,
      minPrice: f.minPrice === min && f.maxPrice === max ? undefined : min,
      maxPrice: f.minPrice === min && f.maxPrice === max ? undefined : max,
    }));
  };

  const reset = () => setLocal({});

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter & Sort</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.reset}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Section title="Sort By">
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={local.sortBy === opt.value}
                onPress={() => setLocal((f) => ({ ...f, sortBy: f.sortBy === opt.value ? undefined : opt.value }))}
              />
            ))}
          </Section>

          <Section title="Brand">
            {BRANDS.map((brand) => (
              <Chip
                key={brand}
                label={brand}
                selected={local.brand === brand}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </Section>

          

          
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => { onApply(local); onClose(); }}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.content}>{children}</View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  compact,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipSelected, compact && chipStyles.compact]}
      onPress={onPress}
    >
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.headingSmall, color: Colors.textPrimary },
  reset: { ...Typography.labelLarge, color: Colors.accent },
  content: { flex: 1 },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyText: { ...Typography.labelLarge, color: Colors.textInverse },
});

const sectionStyles = StyleSheet.create({
  container: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { ...Typography.headingSmall, color: Colors.textPrimary, marginBottom: Spacing.sm },
  content: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  compact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  label: { ...Typography.labelMedium, color: Colors.textSecondary },
  labelSelected: { color: Colors.textInverse },
});
