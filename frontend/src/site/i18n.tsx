import { Link as RouterLink, NavLink as RouterNavLink, Navigate as RouterNavigate, useNavigate as useRouterNavigate, type LinkProps, type NavigateProps, type NavLinkProps } from "react-router-dom";
import { EN } from "./en";
import type { Lang } from "../i18n/locale";

/** Set by SiteLayout before its pages render. Switching language swaps the whole route tree, so every page remounts. */
let current: Lang = "he";

export function setSiteLang(lang: Lang) {
  current = lang;
}

export function siteLang() {
  return current;
}

export function dateLocale() {
  return current === "en" ? "en-GB" : "he-IL";
}

/** The Hebrew text is the key, so the pages read as they always did. */
export function t(he: string, vars?: Record<string, string | number>) {
  let text = he;
  if (current === "en") {
    text = EN[he] ?? he;
    if (import.meta.env.DEV && !(he in EN)) console.warn("Missing English:", he);
  }
  if (vars) for (const [key, value] of Object.entries(vars)) text = text.replace(`{${key}}`, String(value));
  return text;
}

export function sitePath(to: string) {
  if (current !== "en" || !to.startsWith("/")) return to;
  return to === "/" ? "/en" : `/en${to}`;
}

export function Link({ to, ...rest }: Omit<LinkProps, "to"> & { to: string }) {
  return <RouterLink to={sitePath(to)} {...rest} />;
}

export function NavLink({ to, ...rest }: Omit<NavLinkProps, "to"> & { to: string }) {
  return <RouterNavLink to={sitePath(to)} {...rest} />;
}

export function Navigate({ to, ...rest }: Omit<NavigateProps, "to"> & { to: string }) {
  return <RouterNavigate to={sitePath(to)} {...rest} />;
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  return (to: string) => navigate(sitePath(to));
}
