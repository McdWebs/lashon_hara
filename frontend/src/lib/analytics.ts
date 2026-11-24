export type AnalyticsEvent =
  | "cta_hero_join_clicked"
  | "cta_school_clicked"
  | "cta_shop_clicked"
  | "cta_donate_clicked"
  | "commitment_started"
  | "commitment_completed"
  | "ambassador_application_started"
  | "school_contact_started"
  | "product_viewed"
  | "product_added_to_cart"
  | "checkout_started"
  | "checkout_completed"
  | "payment_failed"
  | "commitment_share_clicked"
  | "ambassador_application_completed"
  | "school_contact_completed"
  | "donation_started"
  | "quiz_started"
  | "quiz_completed";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

const CONSENT_KEY = "lh-cookie-consent";
export type Consent = "accepted" | "declined";

export function getConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

// Same Google Analytics property and Facebook Pixel as the old site, so history and ad audiences carry over.
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || "G-XS359NZ9QV";
const FB_PIXEL_ID = (import.meta.env.VITE_FB_PIXEL_ID as string | undefined) || "318879547607286";

/** Facebook Pixel, loaded only after the visitor accepts. A page change inside the app counts as a new page view. */
function loadPixel() {
  if (!FB_PIXEL_ID || window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else (fbq.queue as unknown[]).push(args);
  } as NonNullable<Window["fbq"]>;
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", FB_PIXEL_ID);
  fbq("track", "PageView");
  let last = location.pathname;
  const onChange = () => {
    if (location.pathname === last) return;
    last = location.pathname;
    window.fbq?.("track", "PageView");
  };
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      onChange();
      return result;
    };
  }
  window.addEventListener("popstate", onChange);
}

const PIXEL_EVENTS: Partial<Record<AnalyticsEvent, string>> = {
  product_viewed: "ViewContent",
  product_added_to_cart: "AddToCart",
  checkout_started: "InitiateCheckout",
  checkout_completed: "Purchase",
  donation_started: "InitiateCheckout",
  school_contact_completed: "Lead",
  ambassador_application_completed: "Lead",
  commitment_completed: "Lead",
};

function pixelParams(params: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (params.id !== undefined) {
    out.content_ids = [String(params.id)];
    out.content_type = "product";
  }
  if (typeof params.name === "string") out.content_name = params.name;
  if (typeof params.quantity === "number") out.num_items = params.quantity;
  if (typeof params.value === "number") out.value = params.value;
  if (typeof params.currency === "string") out.currency = params.currency;
  return out;
}

/** Google Analytics and the Facebook Pixel load only after the visitor accepts. */
export function loadAnalytics() {
  loadPixel();
  const id = GA_ID;
  if (!id || window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js only understands the `arguments` object, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments as unknown as Record<string, unknown>);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* private mode: the choice just lasts until the page closes */
  }
  if (value === "accepted") loadAnalytics();
}

/** Called once on startup: a returning visitor who already accepted gets analytics straight away. */
export function initAnalytics() {
  if (getConsent() === "accepted") loadAnalytics();
}

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  const payload = { event, ...params };
  if (window.gtag) {
    window.gtag("event", event, params);
  } else {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(payload);
  }
  const pixelEvent = PIXEL_EVENTS[event];
  if (pixelEvent && window.fbq) window.fbq("track", pixelEvent, pixelParams(params));
  if (import.meta.env.DEV) {
    console.info("[analytics]", payload);
  }
}
