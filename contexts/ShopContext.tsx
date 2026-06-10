import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getGuestSessionId } from '@/lib/guestSession';
import { CartItem, WishlistItem } from '@/types';

interface ShopContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  sessionId: string | null;
  addToCart: (productId: string, size: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string, size: string) => boolean;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType>({
  cartItems: [],
  wishlistItems: [],
  cartCount: 0,
  wishlistCount: 0,
  sessionId: null,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateCartQuantity: async () => {},
  toggleWishlist: async () => {},
  isInWishlist: () => false,
  isInCart: () => false,
  clearCart: async () => {},
  refreshCart: async () => {},
  refreshWishlist: async () => {},
});

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getGuestSessionId();
      setSessionId(id);
    })();
  }, []);

  const refreshCart = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    setCartItems((data as CartItem[]) || []);
  }, [sessionId]);

  const refreshWishlist = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*, category:categories(*))')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    setWishlistItems((data as WishlistItem[]) || []);
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      refreshCart();
      refreshWishlist();
    }
  }, [sessionId, refreshCart, refreshWishlist]);

  const addToCart = async (productId: string, size: string, quantity = 1) => {
    if (!sessionId) return;
    const existing = cartItems.find(
      (i) => i.product_id === productId && i.size === size
    );
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        session_id: sessionId,
        product_id: productId,
        size,
        quantity,
      });
    }
    await refreshCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    await refreshCart();
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    await refreshCart();
  };

  const toggleWishlist = async (productId: string) => {
    if (!sessionId) return;
    const existing = wishlistItems.find((i) => i.product_id === productId);
    if (existing) {
      await supabase.from('wishlist_items').delete().eq('id', existing.id);
    } else {
      await supabase.from('wishlist_items').insert({
        session_id: sessionId,
        product_id: productId,
      });
    }
    await refreshWishlist();
  };

  const isInWishlist = (productId: string) =>
    wishlistItems.some((i) => i.product_id === productId);

  const isInCart = (productId: string, size: string) =>
    cartItems.some((i) => i.product_id === productId && i.size === size);

  const clearCart = async () => {
    if (!sessionId) return;
    await supabase.from('cart_items').delete().eq('session_id', sessionId);
    setCartItems([]);
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlistItems,
        cartCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
        wishlistCount: wishlistItems.length,
        sessionId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        isInWishlist,
        isInCart,
        clearCart,
        refreshCart,
        refreshWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
