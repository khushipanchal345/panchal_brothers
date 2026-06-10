import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { Product, Category, InventoryItem } from '@/types';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const ALL_SIZES = [7, 8, 9, 10, 11];

interface SizeStock {
  size: number;
  quantity: string;
  inventoryId?: string;
}

export default function ProductFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category_id: '',
    description: '',
    price: '',
    sale_price: '',
    images: ['', '', ''],
    is_active: true,
    is_featured: false,
  });
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(
    ALL_SIZES.map((s) => ({ size: s, quantity: '0' }))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories((data as Category[]) || []);
    });
    if (isEdit && id) {
      Promise.all([
        supabase.from('products').select('*').eq('id', id).maybeSingle(),
        supabase.from('inventory').select('*').eq('product_id', id),
      ]).then(([prodRes, invRes]) => {
        if (prodRes.data) {
          const p = prodRes.data as Product;
          setForm({
            name: p.name,
            brand: p.brand,
            category_id: p.category_id || '',
            description: p.description,
            price: p.price.toString(),
            sale_price: p.sale_price?.toString() || '',
            images: [...(p.images || []), '', '', ''].slice(0, 3),
            is_active: p.is_active,
            is_featured: p.is_featured,
          });
          setAvailableSizes((p.available_sizes || []).map((s: number | string) => Number(s)));
        }
        if (invRes.data) {
          const inv = invRes.data as InventoryItem[];
          setSizeStocks(
            ALL_SIZES.map((size) => {
              const existing = inv.find((i) => i.size === size.toString());
              return {
                size,
                quantity: existing?.stock_quantity.toString() || '0',
                inventoryId: existing?.id,
              };
            })
          );
        }
      });
    }
  }, [id, isEdit]);

  const toggleSize = (size: number) => {
    setAvailableSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.price.trim()) {
      Alert.alert('Validation', 'Name, brand, and price are required.');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return;
    }
    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category_id: form.category_id || null,
        description: form.description.trim(),
        price,
        sale_price: form.sale_price ? parseFloat(form.sale_price) || null : null,
        images: form.images.filter((img) => img.trim()),
        is_active: form.is_active,
        is_featured: form.is_featured,
        available_sizes: availableSizes,
      };

      const inventoryData = sizeStocks
        .filter((s) => availableSizes.includes(s.size))
        .map((s) => ({ size: s.size.toString(), quantity: parseInt(s.quantity) || 0 }));

      const response = await fetch(`${supabaseUrl}/functions/v1/update-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          id: isEdit ? id : undefined,
          data: productData,
          inventory: inventoryData,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save product');
      }

      Alert.alert('Success', `Product ${isEdit ? 'updated' : 'created'} successfully.`);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const updateSizeQty = (size: number, qty: string) => {
    setSizeStocks((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity: qty } : s))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Product' : 'Add Product'}</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Section title="Basic Info">
          <Field label="Product Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Ultraboost 23" />
          <Field label="Brand *" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="e.g. Adidas" />

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, form.category_id === cat.id && styles.chipActive]}
                  onPress={() => setForm((f) => ({ ...f, category_id: cat.id }))}
                >
                  <Text style={[styles.chipText, form.category_id === cat.id && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Field
            label="Description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Product description..."
            multiline
          />
        </Section>

        <Section title="Pricing">
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Field label="Price * ($)" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} placeholder="0.00" keyboard="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Sale Price ($)" value={form.sale_price} onChange={(v) => setForm((f) => ({ ...f, sale_price: v }))} placeholder="Optional" keyboard="numeric" />
            </View>
          </View>
        </Section>

        <Section title="Available Sizes">
          <Text style={styles.sizeHint}>Toggle which sizes are available for this product</Text>
          <View style={styles.sizeToggleGrid}>
            {ALL_SIZES.map((size) => {
              const isActive = availableSizes.includes(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeToggle, isActive && styles.sizeToggleActive]}
                  onPress={() => toggleSize(size)}
                >
                  <Text style={[styles.sizeToggleText, isActive && styles.sizeToggleTextActive]}>
                    US {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="Images (URL)">
          {form.images.map((img, i) => (
            <Field
              key={i}
              label={`Image ${i + 1}${i === 0 ? ' (Main)' : ''}`}
              value={img}
              onChange={(v) => setForm((f) => ({
                ...f,
                images: f.images.map((im, j) => j === i ? v : im),
              }))}
              placeholder="https://images.pexels.com/..."
            />
          ))}
        </Section>

        <Section title="Settings">
          <ToggleRow
            label="Active (visible to customers)"
            value={form.is_active}
            onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
          />
          <ToggleRow
            label="Featured on homepage"
            value={form.is_featured}
            onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
          />
        </Section>

        <Section title="Inventory by Size">
          <Text style={styles.invHint}>Only for sizes marked available above. Set quantity to 0 to mark as out of stock.</Text>
          <View style={styles.sizeGrid}>
            {sizeStocks
              .filter((s) => availableSizes.includes(s.size))
              .map((s) => (
                <View key={s.size} style={styles.sizeItem}>
                  <Text style={styles.sizeLabel}>US {s.size}</Text>
                  <TextInput
                    style={styles.sizeInput}
                    value={s.quantity}
                    onChangeText={(v) => updateSizeQty(s.size, v)}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              ))}
            {availableSizes.length === 0 && (
              <Text style={styles.noSizesHint}>Select available sizes above to manage inventory</Text>
            )}
          </View>
        </Section>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, keyboard,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboard?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboard}
      />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.textInverse}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: { padding: Spacing.sm, marginLeft: -Spacing.sm },
  title: { ...Typography.headingMedium, color: Colors.textPrimary, flex: 1, marginLeft: Spacing.sm },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveBtnText: { ...Typography.labelLarge, color: Colors.textInverse },
  content: { padding: Spacing.md, gap: Spacing.md },
  section: {},
  sectionTitle: { ...Typography.labelLarge, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  field: {},
  fieldLabel: { ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: 4 },
  fieldInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  chipText: { ...Typography.labelMedium, color: Colors.textSecondary },
  chipTextActive: { color: Colors.textInverse },
  priceRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  toggleLabel: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
  sizeHint: { ...Typography.bodySmall, color: Colors.textTertiary, marginBottom: Spacing.sm },
  sizeToggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sizeToggle: {
    width: 64,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  sizeToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sizeToggleText: { ...Typography.labelMedium, color: Colors.textSecondary },
  sizeToggleTextActive: { color: Colors.textInverse },
  invHint: { ...Typography.bodySmall, color: Colors.textTertiary, marginBottom: Spacing.sm },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sizeItem: { alignItems: 'center', width: 60, gap: 4 },
  sizeLabel: { ...Typography.labelSmall, color: Colors.textSecondary },
  sizeInput: {
    width: 60,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  noSizesHint: { ...Typography.bodySmall, color: Colors.textTertiary, fontStyle: 'italic' },
});
