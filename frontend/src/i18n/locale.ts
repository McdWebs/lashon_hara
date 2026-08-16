export type Lang = "he" | "en";
export type Audience = "default" | "parent" | "teacher" | "student" | "school";

export function langFromPath(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "he";
}

export function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

export function withLocale(pathname: string, lang: Lang): string {
  const inner = stripLocale(pathname);
  if (lang === "he") return inner;
  if (inner === "/") return "/en";
  return `/en${inner}`;
}
