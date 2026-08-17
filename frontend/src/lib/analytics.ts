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
  | "commitment_share_clicked"
  | "ambassador_application_completed"
  | "school_contact_completed"
  | "donation_started"
  | "quiz_started"
  | "quiz_completed";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  const payload = { event, ...params };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  if (import.meta.env.DEV) {
    console.info("[analytics]", payload);
  }
}
