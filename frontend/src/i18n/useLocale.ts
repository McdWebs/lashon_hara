import { createContext, useContext } from "react";
import { strings, type StringKey } from "./strings";
import type { Lang } from "./locale";

type LocaleCtx = {
  lang: Lang;
  prefix: string;
  loc: (path: string) => string;
  t: (key: StringKey) => string;
};

export const LocaleContext = createContext<LocaleCtx | null>(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("LocaleContext missing");
  return ctx;
}

export function buildLocale(lang: Lang): LocaleCtx {
  const prefix = lang === "en" ? "/en" : "";
  return {
    lang,
    prefix,
    loc: (path: string) => {
      if (path === "/") return prefix || "/";
      return `${prefix}${path}`;
    },
    t: (key) => strings[lang][key],
  };
}
