'use client';

import { applyServerCoupon, getServerCart, getSite, syncServerCart } from '@/lib/api';
import { clearCartStorage, readCartStorage, writeCartStorage } from '@/lib/cartStorage';
import type { CartItem, CartPayload } from '@/types/cart';
import type { MenuItem } from '@/types/menu';
import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface CartContextValue {
  cart: CartPayload;
  isOpen: boolean;
  isHydrated: boolean;
  toast: CartItem | null;
  addItem: (item: MenuItem) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  removeItem: (menuItemId: number) => void;
  clearCart: () => void;
  toggleItemSelected: (menuItemId: number, selected: boolean) => void;
  selectAllItems: (selected: boolean) => void;
  removeSelectedItems: () => void;
  loadCheckoutItems: (items: CartItem[], merge?: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  applyCoupon: (code: string) => Promise<string | null>;
  removeCoupon: () => Promise<string | null>;
}

const emptyCart: CartPayload = {
  items: [],
  coupon_code: null,
  subtotal: '0.00',
  discount_amount: '0.00',
  delivery_charge_amount: '0.00',
  tax_amount: '0.00',
  total: '0.00',
};
const emptyPricing = {
  deliveryFreeAboveAmount: 0,
  deliveryChargeAmount: 0,
  taxAmount: 0,
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartPayload>(emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<CartItem | null>(null);
  const [pricing, setPricing] = useState(emptyPricing);
  const isHydratingRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateCart() {
      const site = await getSite().catch(() => null);
      const nextPricing = site
        ? {
            deliveryFreeAboveAmount: Number(site.delivery_free_above_amount || 0),
            deliveryChargeAmount: Number(site.delivery_charge_amount || 0),
            taxAmount: Number(site.tax_amount || 0),
          }
        : emptyPricing;

      if (cancelled) {
        return;
      }

      setPricing(nextPricing);

      const token = window.localStorage.getItem('auth_token');
      const storedCart = readCartStorage();
      let resolvedCart = storedCart ?? emptyCart;

      if (token) {
        try {
          const serverCart = await getServerCart(token);

          if (serverCart.items.length > 0) {
            resolvedCart = preserveSelection(serverCart, storedCart?.items ?? []);
          } else if (storedCart?.items.length) {
            const synced = await syncServerCart(token, {
              items: storedCart.items.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity })),
              coupon_code: storedCart.coupon_code,
            });

            resolvedCart = preserveSelection(synced, storedCart.items);
          }
        } catch {
          resolvedCart = storedCart ?? emptyCart;
        }
      }

      if (!cancelled) {
        setCart(normalizeCart(resolvedCart, nextPricing));
        isHydratingRef.current = false;
        setIsHydrated(true);
      }
    }

    void hydrateCart();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const token = window.localStorage.getItem('auth_token');
    writeCartStorage(cart, !token);
  }, [cart, isHydrated]);

  const syncIfLoggedIn = useCallback(async (nextCart: CartPayload) => {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      return;
    }

    const synced = await syncServerCart(token, {
      items: nextCart.items.map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity })),
      coupon_code: nextCart.coupon_code,
    }).catch((error) => {
      if (axios.isAxiosError<{ errors?: Record<string, string[]> }>(error) && error.response?.data?.errors?.code) {
        const cleanCart = normalizeCart({ ...nextCart, coupon_code: null, discount_amount: '0.00' }, pricing);
        setCart(cleanCart);
      }

      return null;
    });

    if (synced) {
      setCart(normalizeCart(preserveSelection(synced, nextCart.items), pricing));
    }
  }, [pricing]);

  useEffect(() => {
    const handleStorage = () => {
      const token = window.localStorage.getItem('auth_token');

      if (!token || isHydratingRef.current) {
        return;
      }

      void syncIfLoggedIn(cart);
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, [cart, syncIfLoggedIn]);

  const addItem = useCallback((item: MenuItem) => {
    const nextCart = normalizeCart({
      ...cart,
      items: upsertItem(cart.items, item),
    }, pricing);

    setCart(nextCart);
    const addedItem = nextCart.items.find((cartItem) => cartItem.menu_item_id === item.id) ?? null;
    setToast(addedItem);
    window.setTimeout(() => setToast(null), 2600);
    void syncIfLoggedIn(nextCart);
  }, [cart, pricing, syncIfLoggedIn]);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    const nextCart = normalizeCart({
      ...cart,
      items: cart.items
        .map((item) => item.menu_item_id === menuItemId ? { ...item, quantity: Math.max(quantity, 1) } : item)
        .filter((item) => item.quantity > 0),
    }, pricing);
    setCart(nextCart);
    void syncIfLoggedIn(nextCart);
  }, [cart, pricing, syncIfLoggedIn]);

  const removeItem = useCallback((menuItemId: number) => {
    const nextCart = normalizeCart({ ...cart, items: cart.items.filter((item) => item.menu_item_id !== menuItemId) }, pricing);
    setCart(nextCart);
    void syncIfLoggedIn(nextCart);
  }, [cart, pricing, syncIfLoggedIn]);

  const clearCart = useCallback(() => {
    setCart(emptyCart);
    clearCartStorage();
    void syncIfLoggedIn(emptyCart);
  }, [syncIfLoggedIn]);

  const toggleItemSelected = useCallback((menuItemId: number, selected: boolean) => {
    setCart((current) => normalizeCart({
      ...current,
      items: current.items.map((item) => item.menu_item_id === menuItemId ? { ...item, selected } : item),
      coupon_code: null,
      discount_amount: '0.00',
    }, pricing));
  }, [pricing]);

  const selectAllItems = useCallback((selected: boolean) => {
    setCart((current) => normalizeCart({
      ...current,
      items: current.items.map((item) => ({ ...item, selected })),
      coupon_code: null,
      discount_amount: '0.00',
    }, pricing));
  }, [pricing]);

  const removeSelectedItems = useCallback(() => {
    const nextCart = normalizeCart({
      ...cart,
      items: cart.items.filter((item) => item.selected === false),
      coupon_code: null,
      discount_amount: '0.00',
    }, pricing);

    setCart(nextCart);
    void syncIfLoggedIn(nextCart);
  }, [cart, pricing, syncIfLoggedIn]);

  const loadCheckoutItems = useCallback((items: CartItem[], merge = false) => {
    const nextItems = merge
      ? mergeCartItems(cart.items, items)
      : items.map((item) => ({ ...item, selected: true }));

    const nextCart = normalizeCart({
      ...emptyCart,
      items: nextItems,
    }, pricing);

    setCart(nextCart);
    void syncIfLoggedIn(nextCart);
  }, [cart.items, pricing, syncIfLoggedIn]);

  const applyCoupon = useCallback(async (code: string): Promise<string | null> => {
    const token = window.localStorage.getItem('auth_token');
    const normalizedCode = code.trim().toUpperCase();

    if (!token) {
      return 'Login before checkout to apply this promo code.';
    }

    try {
      const response = await applyServerCoupon(token, normalizedCode || null);
      setCart((current) => normalizeCart(preserveSelection(response, current.items), pricing));
      return null;
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        const firstError = error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null;
        return firstError ?? error.response?.data?.message ?? 'Promo code could not be applied.';
      }
      return 'Promo code could not be applied.';
    }
  }, [pricing]);

  const removeCoupon = useCallback(async (): Promise<string | null> => {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      setCart((current) => normalizeCart({ ...current, coupon_code: null, discount_amount: '0.00' }, pricing));
      return null;
    }

    return applyCoupon('');
  }, [applyCoupon, pricing]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    isOpen,
    isHydrated,
    toast,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    toggleItemSelected,
    selectAllItems,
    removeSelectedItems,
    loadCheckoutItems,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    applyCoupon,
    removeCoupon,
  }), [addItem, applyCoupon, cart, clearCart, isHydrated, isOpen, loadCheckoutItems, removeCoupon, removeItem, removeSelectedItems, selectAllItems, toast, toggleItemSelected, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}

function mergeCartItems(existing: CartItem[], incoming: CartItem[]): CartItem[] {
  let next = [...existing];

  for (const item of incoming) {
    const current = next.find((cartItem) => cartItem.menu_item_id === item.menu_item_id);

    if (current) {
      const quantity = current.quantity + item.quantity;
      const unitPrice = Number(item.unit_price || current.unit_price || 0);

      next = next.map((cartItem) => cartItem.menu_item_id === item.menu_item_id
        ? {
            ...cartItem,
            ...item,
            quantity,
            unit_price: unitPrice.toFixed(2),
            line_total: (unitPrice * quantity).toFixed(2),
            selected: true,
          }
        : cartItem);
    } else {
      next.push({ ...item, selected: true });
    }
  }

  return next;
}

function upsertItem(items: CartItem[], item: MenuItem): CartItem[] {
  const existing = items.find((cartItem) => cartItem.menu_item_id === item.id);

  if (existing) {
    return items.map((cartItem) => cartItem.menu_item_id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1, selected: true } : cartItem);
  }

  return [
    ...items,
    {
      menu_item_id: item.id,
      category_id: item.category_id,
      name: item.name ?? 'Menu item',
      category_name: item.category_name,
      image: item.image,
      quantity: 1,
      unit_price: item.price,
      line_total: item.price,
      selected: true,
    },
  ];
}

function preserveSelection(cart: CartPayload, selectedSource: CartItem[]): CartPayload {
  return {
    ...cart,
    items: cart.items.map((item) => {
      const existing = selectedSource.find((sourceItem) => sourceItem.menu_item_id === item.menu_item_id);

      return {
        ...item,
        selected: existing?.selected ?? true,
      };
    }),
  };
}

function normalizeCart(input: CartPayload, pricing = emptyPricing): CartPayload {
  const items = (input.items ?? []).map((item) => {
    const unitPrice = Number(item.unit_price || 0);
    const quantity = Number(item.quantity || 1);

    return {
      ...item,
      quantity,
      unit_price: unitPrice.toFixed(2),
      line_total: (unitPrice * quantity).toFixed(2),
      selected: item.selected ?? true,
    };
  });
  const selectedItems = items.filter((item) => item.selected !== false);
  const subtotal = selectedItems.reduce((total, item) => total + Number(item.line_total), 0);
  const discount = Number(input.discount_amount || 0);
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const deliveryCharge = discountedSubtotal > 0
    && pricing.deliveryChargeAmount > 0
    && !(pricing.deliveryFreeAboveAmount > 0 && discountedSubtotal >= pricing.deliveryFreeAboveAmount)
    ? pricing.deliveryChargeAmount
    : Number(input.delivery_charge_amount || 0);
  const taxAmount = discountedSubtotal > 0 ? (pricing.taxAmount || Number(input.tax_amount || 0)) : 0;

  return {
    items,
    coupon_code: input.coupon_code ?? null,
    subtotal: subtotal.toFixed(2),
    discount_amount: discount.toFixed(2),
    delivery_charge_amount: deliveryCharge.toFixed(2),
    tax_amount: taxAmount.toFixed(2),
    total: (discountedSubtotal + deliveryCharge + taxAmount).toFixed(2),
  };
}
