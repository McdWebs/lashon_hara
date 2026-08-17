import { create } from "zustand";
import { decodeHtmlEntities } from "./html";

export type CartItem = {
  id: number;
  name: string;
  price: string;
  currencyMinorUnit: number;
  image?: string;
  quantity: number;
};

const STORAGE_KEY = "lh-cart";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      name: decodeHtmlEntities(item.name),
    }));
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set, get) => ({
  items: typeof window === "undefined" ? [] : read(),
  addItem: (item, quantity = 1) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      items.push({ ...item, quantity });
    }
    persist(items);
    set({ items });
  },
  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    persist(items);
    set({ items });
  },
  setQuantity: (id, quantity) => {
    if (quantity < 1) {
      get().removeItem(id);
      return;
    }
    const items = get().items.map((i) => (i.id === id ? { ...i, quantity } : i));
    persist(items);
    set({ items });
  },
  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));

export function cartTotalMinor(items: CartItem[]) {
  return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
}

export function cartWhatsAppText(items: CartItem[]) {
  const lines = items.map((i) => `• ${i.name} × ${i.quantity}`);
  return `שלום, אני מעוניין/ת להזמין מהחנות:\n${lines.join("\n")}`;
}
