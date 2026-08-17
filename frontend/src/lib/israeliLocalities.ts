import localities from "../data/israeliLocalities.json";
import type { Lang } from "../i18n/locale";

export type IsraeliLocality = {
  he: string;
  en: string | null;
};

export const ISRAELI_LOCALITIES = localities as IsraeliLocality[];

export function getLocalityLabel(locality: IsraeliLocality, lang: Lang) {
  if (lang === "en" && locality.en) {
    return locality.en
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return locality.he;
}
