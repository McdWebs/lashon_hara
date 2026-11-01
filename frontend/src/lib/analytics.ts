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

/** Google Analytics loads only after the visitor accepts, and only when a measurement id is configured. */
export function loadAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
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
  if (import.meta.env.DEV) {
    console.info("[analytics]", payload);
  }
}
