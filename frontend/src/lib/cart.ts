import { create } from "zustand";
import { cartApi, clearCartSession, type WcCart, type WcCartItem } from "./cartSession";
import { decodeHtmlEntities } from "./html";

export type CartItem = {
  key: string;
  id: number;
  name: string;
  price: string;
  lineTotal: string;
  currencyMinorUnit: number;
  image?: string;
  quantity: number;
};

function mapItem(item: WcCartItem): CartItem {
  return {
    key: item.key,
    id: item.id,
    name: decodeHtmlEntities(item.name),
    price: item.prices.price,
    lineTotal: item.totals.line_total,
    currencyMinorUnit: item.prices.currency_minor_unit,
    image: item.images[0]?.thumbnail || item.images[0]?.src,
    quantity: item.quantity,
  };
}

function fromWcCart(cart: WcCart) {
  return {
    items: cart.items.map(mapItem),
    totalPrice: cart.totals.total_price,
    currencyMinorUnit: cart.totals.currency_minor_unit,
    needsShipping: cart.needs_shipping,
  };
}

type CartState = {
  items: CartItem[];
  totalPrice: string;
  currencyMinorUnit: number;
  needsShipping: boolean;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addItem: (id: number, quantity?: number) => Promise<void>;
  setQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  totalPrice: "0",
  currencyMinorUnit: 2,
  needsShipping: false,
  hydrated: false,
  loading: false,
  error: null,

  hydrate: async () => {
    if (get().hydrated || typeof window === "undefined") return;
    set({ loading: true, error: null });
    try {
      const cart = await cartApi.get();
      set({ ...fromWcCart(cart), hydrated: true, loading: false });
    } catch {
      set({ hydrated: true, loading: false });
    }
  },

  addItem: async (id, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartApi.addItem(id, quantity);
      set({ ...fromWcCart(cart), loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "cart_error" });
      throw err;
    }
  },

  setQuantity: async (key, quantity) => {
    if (quantity < 1) {
      await get().removeItem(key);
      return;
    }
    const prevItems = get().items;
    set({ items: prevItems.map((i) => (i.key === key ? { ...i, quantity } : i)), error: null });
    try {
      const cart = await cartApi.updateItem(key, quantity);
      set({ ...fromWcCart(cart) });
    } catch (err) {
      set({ items: prevItems, error: err instanceof Error ? err.message : "cart_error" });
      throw err;
    }
  },

  removeItem: async (key) => {
    const prevItems = get().items;
    set({ items: prevItems.filter((i) => i.key !== key), error: null });
    try {
      const cart = await cartApi.removeItem(key);
      set({ ...fromWcCart(cart) });
    } catch (err) {
      set({ items: prevItems, error: err instanceof Error ? err.message : "cart_error" });
      throw err;
    }
  },

  clear: async () => {
    try {
      const cart = await cartApi.clear();
      set({ ...fromWcCart(cart) });
    } catch {
      set({ items: [], totalPrice: "0" });
    } finally {
      clearCartSession();
    }
  },
}));

export function cartWhatsAppText(items: CartItem[]) {
  const lines = items.map((i) => `• ${i.name} × ${i.quantity}`);
  return `שלום, אני מעוניין/ת להזמין מהחנות:\n${lines.join("\n")}`;
}
