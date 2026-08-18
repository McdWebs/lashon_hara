import type { WcProduct } from "./catalog";

export type ProductOrderRules = {
  min: number;
  max: number;
  step: number;
};

export function getProductOrderRules(product: WcProduct): ProductOrderRules {
  const atc = product.add_to_cart;
  const min = Math.max(1, atc?.minimum ?? 1);
  const max = Math.max(min, atc?.maximum ?? 9999);
  const step = Math.max(1, atc?.multiple_of ?? 1);
  return { min, max, step };
}

export function hasOrderConstraints(rules: ProductOrderRules): boolean {
  return rules.min > 1 || rules.step > 1;
}

export function formatOrderRulesNotice(rules: ProductOrderRules, lang: "he" | "en"): string {
  const parts: string[] = [];
  if (rules.min > 1) {
    parts.push(
      lang === "en" ? `Minimum order: ${rules.min} units` : `מינימום להזמנה: ${rules.min} יחידות`,
    );
  }
  if (rules.step > 1) {
    parts.push(
      lang === "en"
        ? `Order in multiples of ${rules.step}`
        : `יש להזמין בכפולות של ${rules.step}`,
    );
  }
  return parts.join(lang === "en" ? " · " : " · ");
}

export function clampOrderQuantity(quantity: number, rules: ProductOrderRules): number {
  const stepped = Math.ceil(quantity / rules.step) * rules.step;
  return Math.min(rules.max, Math.max(rules.min, stepped));
}
