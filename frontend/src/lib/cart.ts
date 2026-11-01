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
  options: string[];
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
    options: (item.variation ?? []).map((v) => `${v.attribute}: ${decodeHtmlEntities(v.value)}`),
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

/** Total of a line, from its unit price, so the page can update before the store answers. */
function lineTotalFor(item: CartItem, quantity: number) {
  return String(Number(item.price) * quantity);
}

/**
 * The store takes a second or more per change, so the screen updates first and the changes are sent
 * one at a time. Quick repeated taps on the same line collapse into one request with the final amount.
 */
const SETTLE_MS = 300;
let chain: Promise<unknown> = Promise.resolve();
let inFlight = 0;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

function showQuantity(key: string, quantity: number) {
  const { items } = useCart.getState();
  const next = items.map((i) => (i.key === key ? { ...i, quantity, lineTotal: lineTotalFor(i, quantity) } : i));
  useCart.setState({ items: next, error: null });
}

function queueMutation(key: string, send: () => Promise<WcCart>, quantity?: number): Promise<void> {
  // A newer tap on this line replaces the one still waiting.
  const waiting = pending.get(key);
  if (waiting) clearTimeout(waiting);

  return new Promise<void>((resolve, reject) => {
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        inFlight += 1;
        chain = chain.then(async () => {
          try {
            const cart = await send();
            // Only show the store's answer once nothing newer is waiting, or it would flicker back.
            if (inFlight === 1 && pending.size === 0) useCart.setState(fromWcCart(cart));
            resolve();
          } catch (err) {
            useCart.setState({ error: err instanceof Error ? err.message : "cart_error" });
            // Put the screen back in line with what the store really holds.
            try {
              useCart.setState(fromWcCart(await cartApi.get()));
            } catch {
              /* keep the screen as it is */
            }
            reject(err);
          } finally {
            inFlight -= 1;
          }
        });
      }, quantity === undefined ? 0 : SETTLE_MS),
    );
  });
}

type CartState = {
  items: CartItem[];
  totalPrice: string;
  currencyMinorUnit: number;
  needsShipping: boolean;
  hydrated: boolean;
  loading: boolean;
  /** Items being added right now, so the bag count can move before the store answers. */
  pendingAdds: number;
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
  pendingAdds: 0,
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
    set({ loading: true, error: null, pendingAdds: get().pendingAdds + quantity });
    try {
      // Let any cart changes still on their way finish first, so the store sees them in order.
      await chain.catch(() => undefined);
      const cart = await cartApi.addItem(id, quantity);
      set({ ...fromWcCart(cart), loading: false, pendingAdds: Math.max(0, get().pendingAdds - quantity) });
    } catch (err) {
      set({ loading: false, pendingAdds: Math.max(0, get().pendingAdds - quantity), error: err instanceof Error ? err.message : "cart_error" });
      throw err;
    }
  },

  setQuantity: (key, quantity) => {
    if (quantity < 1) return get().removeItem(key);
    showQuantity(key, quantity);
    return queueMutation(key, () => cartApi.updateItem(key, quantity), quantity);
  },

  removeItem: (key) => {
    set({ items: get().items.filter((i) => i.key !== key), error: null });
    return queueMutation(key, () => cartApi.removeItem(key));
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
