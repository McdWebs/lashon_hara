import { adminRequest } from "./media";
import type { CalendarSettings, Flags, LectureConfig, ShopConfig } from "./siteConfig";

/** What the admin has saved so far. A section that was never saved is missing, and the built-in default applies. */
export type StoredConfig = Partial<{
  flags: Partial<Flags>;
  counter: { value: number | null };
  calendar: CalendarSettings;
  shop: ShopConfig;
  lectures: { items: LectureConfig[] };
}>;

export type Section = "counter" | "calendar" | "shop" | "lectures" | "flags";

export type CalendarTest = { ok: true; events: number; days: string[]; totalDays: number };

export const adminConfig = {
  get: () => adminRequest<StoredConfig>("/config"),
  save: (section: Section, body: unknown) => adminRequest(`/config/${section}`, { method: "PUT", body: JSON.stringify(body) }),
  reset: (section: Section) => adminRequest(`/config/${section}`, { method: "DELETE" }),
  testCalendar: (icsUrl: string) => adminRequest<CalendarTest>("/calendar/test", { method: "POST", body: JSON.stringify({ icsUrl }) }),
};
