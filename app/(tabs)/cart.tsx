import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag, Trash2, X } from 'lucide-react-native';
import { CartItemCard } from '@/components/CartItemCard';
import { useShop } from '@/contexts/ShopContext';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, sessionId } = useShop();
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Missing Info', 'Please fill in your name and email.');
      return;
    }
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
          },
          subtotal: 0,
          shipping_cost: 0,
          total: 0,
        })
        .select()
        .single();

      if (error || !order) throw error;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        size: item.size,
        quantity: item.quantity,
        unit_price: 0,
      }));

      await supabase.from('order_items').insert(orderItems);
      await clearCart();
      setCheckoutVisible(false);
      Alert.alert('Order Placed!', `Your order #${order.id.slice(0, 8).toUpperCase()} has been placed. We'll contact you for pricing.`);
    } catch {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Cart</Text>
        </View>
        <View style={styles.empty}>
          <ShoppingBag size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Start adding some shoes you love</Text>
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
        <Text style={styles.title}>Shopping Cart</Text>
        <TouchableOpacity onPress={() => clearCart()}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onRemove={() => removeFromCart(item.id)}
            onQuantityChange={(q) => updateCartQuantity(item.id, q)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListFooterComponent={() => (
          <View style={styles.summary}>
            <Text style={styles.priceNote}>Pricing will be confirmed via Instagram DM</Text>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => setCheckoutVisible(true)}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={checkoutVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Checkout</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.formSection}>Contact Information</Text>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', placeholder: 'john@example.com', keyboard: 'email-address' as const },
              { key: 'phone', label: 'Phone (optional)', placeholder: '+1 234 567 8900' },
            ].map((f) => (
              <View key={f.key} style={styles.formField}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={(form as any)[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.keyboard}
                  autoCapitalize="none"
                />
              </View>
            ))}
            <Text style={styles.formSection}>Shipping Address</Text>
            {[
              { key: 'street', label: 'Street Address', placeholder: '123 Main St' },
              { key: 'city', label: 'City', placeholder: 'New York' },
              { key: 'state', label: 'State', placeholder: 'NY' },
              { key: 'zip', label: 'ZIP Code', placeholder: '10001' },
            ].map((f) => (
              <View key={f.key} style={styles.formField}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={(form as any)[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                />
              </View>
            ))}
            <View style={styles.orderNote}>
              <Text style={styles.orderNoteText}>We'll confirm pricing and availability via Instagram DM before processing your order.</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCheckout}
              disabled={submitting}
            >
              <Text style={styles.checkoutBtnText}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.headingLarge, color: Colors.textPrimary },
  clearText: { ...Typography.labelMedium, color: Colors.accent },
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
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  summary: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  priceNote: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  checkoutBtnText: { ...Typography.labelLarge, color: Colors.textInverse },
  modal: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.headingSmall, color: Colors.textPrimary },
  formContent: { padding: Spacing.md, gap: Spacing.sm },
  formSection: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  formField: { gap: 4 },
  fieldLabel: { ...Typography.labelMedium, color: Colors.textSecondary },
  fieldInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderNote: {
    padding: Spacing.md,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  orderNoteText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    textAlign: 'center',
  },
});
