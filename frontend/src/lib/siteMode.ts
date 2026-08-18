import { stripLocale } from "../i18n/locale";

const STORE_EXACT = new Set(["/", "/shop", "/cart", "/checkout", "/my-account"]);

export function isStorePath(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (STORE_EXACT.has(path)) return true;
  return path.startsWith("/shop/");
}

export function isMovementPath(pathname: string): boolean {
  return stripLocale(pathname) === "/movement";
}

export function isStoreLandingPath(pathname: string, category?: string | null): boolean {
  if (category) return false;
  const path = stripLocale(pathname);
  return path === "/" || path === "/shop";
}

export function isFullBleedPath(pathname: string, category?: string | null): boolean {
  return isMovementPath(pathname) || isStoreLandingPath(pathname, category);
}
