import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { t, Link, siteLang } from "./i18n";
import { useCart } from "../lib/cart";
import { fetchProduct, type WcProduct } from "../lib/catalog";
import { getProductOrderRules } from "../lib/productOrderRules";
import { track } from "../lib/analytics";

function Svg({ size = 20, sw = 1.7, children }: { size?: number; sw?: number; children: ReactNode }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

/** Direction icons point the other way in English. */
function mirror() {
  return siteLang() === "en" ? "matrix(-1 0 0 1 24 0)" : undefined;
}

export const Icon = {
  bag: () => <Svg><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>,
  arrow: () => <Svg size={18} sw={1.9}><g transform={mirror()}><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></g></Svg>,
  next: () => <Svg><g transform={mirror()}><path d="M15 6l-6 6 6 6" /></g></Svg>,
  prev: () => <Svg><g transform={mirror()}><path d="M9 6l6 6-6 6" /></g></Svg>,
  menu: () => <Svg><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Svg>,
  close: () => <Svg><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Svg>,
  chevron: () => <Svg size={16} sw={2.2}><path d="M6 9l6 6 6-6" /></Svg>,
  plus: () => <Svg size={18} sw={1.9}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>,
  minus: () => <Svg size={16} sw={1.9}><path d="M6 12h12" /></Svg>,
  ok: () => <Svg size={18} sw={2.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>,
  ext: () => <Svg size={18}><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M18 14v5H5V6h5" /></Svg>,
  wa: () => <Svg><path d="M4 20l1.3-4.2A8 8 0 1 1 8.3 19L4 20z" /><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5" /></Svg>,
  mail: () => <Svg><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></Svg>,
  ig: () => <Svg><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r=".6" /></Svg>,
  fb: () => <Svg><path d="M14 8h2.5V4.5H14A3.500 3.500 0 0 0 10.500 8v2.500H8V14h2.500v6H14v-6h2.500l.5-3.500h-3V8.500c0-.3.2-.5.5-.5z" /></Svg>,
  play: () => <Svg size={22}><path d="M8 5.5v13l11-6.500-11-6.500z" /></Svg>,
  pause: () => <Svg size={16} sw={2}><path d="M9 5v14" /><path d="M15 5v14" /></Svg>,
  mute: () => <Svg size={18}><path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" /><path d="M16 10l4 4" /><path d="M20 10l-4 4" /></Svg>,
  sound: () => <Svg size={18}><path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" /><path d="M16 9.500a4 4 0 0 1 0 5" /><path d="M18.500 7a7.500 7.500 0 0 1 0 10" /></Svg>,
  pin: () => <Svg><path d="M12 21s-6.500-6-6.500-11A6.500 6.500 0 0 1 18.500 10c0 5-6.500 11-6.500 11z" /><circle cx="12" cy="10" r="2.4" /></Svg>,
  refresh: () => <Svg size={18} sw={1.9}><path d="M20 11a8 8 0 1 0-2.300 6.300" /><path d="M20 5v6h-6" /></Svg>,
  upload: () => <Svg><path d="M12 16V5" /><path d="M7 10l5-5 5 5" /><path d="M5 19h14" /></Svg>,
};

export function QuoteMark() {
  return (
    <svg className="qmark" aria-hidden="true" viewBox="0 0 120 90" fill="none" stroke="#111111" strokeWidth="2.2">
      <path d="M8 4h40v38c0 22-12 38-34 44l-2-9c13-5 19-14 20-25H8z" />
      <path d="M70 4h40v38c0 22-12 38-34 44l-2-9c13-5 19-14 20-25H70z" />
    </svg>
  );
}

export function OkMark({ big }: { big?: boolean }) {
  return (
    <svg className={`okm${big ? " big" : ""}`} aria-hidden="true" width="64" height="64" viewBox="0 0 96 96" fill="none">
      <circle className="ok-ring" cx="48" cy="48" r="44" strokeWidth="3" />
      <path className="ok-tick" d="M31 49.5l11.5 11.5L66 37" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Title({ children, lead, big, as: Tag = "h1" }: { children: ReactNode; lead?: ReactNode; big?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={`ttl${big ? " big" : ""} rv`}>
      <span className="bar" aria-hidden="true" />
      <Tag className="ttl-h">{children}</Tag>
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${t("לשון הרע לא מדבר אליי")}`;
  }, [title]);
}

export function priceLabel(product: WcProduct) {
  return moneyLabel(product.prices.price, product.prices.currency_minor_unit ?? 2);
}

export function moneyLabel(minor: string | number, minorUnit = 2) {
  const n = Number(minor) / 10 ** minorUnit;
  return `₪${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export function ProductImage({ product }: { product: WcProduct }) {
  const image = product.images[0];
  if (!image) return <span className="ph" style={{ position: "absolute", inset: 0 }}>{t("תמונה בקרוב")}</span>;
  // Cards are small, so the browser picks a fitting size from srcset instead of the full-size src.
  return <img src={image.src} srcSet={image.srcset} sizes="(max-width: 900px) 50vw, 300px" alt={image.alt || product.name} loading="lazy" decoding="async" />;
}

/** Starts loading a product as the pointer or finger reaches its link, so the page opens already filled. */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();
  return (id: number) => {
    void queryClient.prefetchQuery({ queryKey: ["product", String(id)], queryFn: () => fetchProduct(String(id)) });
  };
}

/** Image, name and price only: the card the spec asks for. */
export function ProductLinkCard({ product, style }: { product: WcProduct; style?: React.CSSProperties }) {
  const prefetch = usePrefetchProduct();
  const warm = () => prefetch(product.id);
  return (
    <Link className="pc" to={`/shop/product/${product.id}`} style={style} onPointerEnter={warm} onFocus={warm} onTouchStart={warm}>
      <span className="pc-m"><ProductImage product={product} /></span>
      <span className="pc-n" dir="auto">{product.name}</span>
      <span className="pc-p">{priceLabel(product)}</span>
    </Link>
  );
}

export function canQuickAdd(product: WcProduct) {
  return product.type === "simple" && product.is_in_stock !== false && getProductOrderRules(product).min === 1;
}

export function useQuickAdd() {
  const addItem = useCart((s) => s.addItem);
  return async (product: WcProduct) => {
    await addItem(product.id, 1);
    track("product_added_to_cart", { id: product.id, quantity: 1 });
  };
}

/** Shop card: the product link plus a round add-to-bag button on the photo for products that need no choices. */
export function ShopCard({ product }: { product: WcProduct }) {
  const quickAdd = useQuickAdd();
  const prefetch = usePrefetchProduct();
  const [state, setState] = useState<"idle" | "busy" | "added" | "failed">("idle");
  const timer = useRef<number>(0);
  const to = `/shop/product/${product.id}`;
  const warm = () => prefetch(product.id);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function add() {
    if (state === "busy") return;
    setState("busy");
    try {
      await quickAdd(product);
      setState("added");
    } catch {
      setState("failed");
    }
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  const label = state === "added" ? t("נוסף לסל") : state === "failed" ? t("לא הצלחנו, נסו שוב") : t("הוספה לסל: {name}", { name: product.name });

  return (
    <article className="pc pcw">
      <div className="pcw-m">
        <Link className="pc-m" to={to} tabIndex={-1} aria-hidden="true" onPointerEnter={warm} onTouchStart={warm}><ProductImage product={product} /></Link>
        {canQuickAdd(product) ? (
          <button type="button" className={`pc-q${state === "idle" ? "" : ` ${state}`}`} aria-busy={state === "busy"} aria-label={label} onClick={add}>
            {state === "busy" ? <i className="pc-spin" aria-hidden="true" /> : state === "added" ? <Icon.ok /> : <Icon.plus />}
          </button>
        ) : null}
      </div>
      <Link className="pc-n" to={to} dir="auto" onPointerEnter={warm} onFocus={warm} onTouchStart={warm}>{product.name}</Link>
      <span className="pc-p">{priceLabel(product)}</span>
    </article>
  );
}

export function CardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skel" style={{ aspectRatio: "4 / 5" }} />
          <div className="skel" style={{ height: 14, width: "80%" }} />
          <div className="skel" style={{ height: 16, width: "30%" }} />
        </div>
      ))}
    </>
  );
}
