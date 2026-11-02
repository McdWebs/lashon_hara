import dns from "node:dns/promises";
import net from "node:net";
import ical from "node-ical";

const MAX_BYTES = 3 * 1024 * 1024;
const CACHE_MS = 10 * 60_000;
const FORMAT = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" });

export type FeedResult = { days: string[]; events: number };

const cache = new Map<string, { at: number; result: FeedResult }>();

function privateAddress(address: string) {
  if (net.isIPv6(address)) return address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80");
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}

/** A calendar link is fetched by the server, so it must point at a public https address. */
async function checkedUrl(raw: string) {
  const url = new URL(raw.trim().replace(/^webcal:/i, "https:"));
  if (url.protocol !== "https:") throw new Error("calendar_url_invalid");
  const lookup = await dns.lookup(url.hostname, { all: true });
  if (lookup.length === 0 || lookup.some((entry) => privateAddress(entry.address))) throw new Error("calendar_url_invalid");
  return url;
}

function localDay(date: Date, dateOnly: boolean) {
  if (dateOnly) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  return FORMAT.format(date);
}

function nextDay(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Every day, from today on, that has an event in the calendar. */
export async function takenDaysFromFeed(rawUrl: string, force = false): Promise<FeedResult> {
  const hit = cache.get(rawUrl);
  if (hit && !force && Date.now() - hit.at < CACHE_MS) return hit.result;

  try {
    const url = await checkedUrl(rawUrl);
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: { Accept: "text/calendar" } });
    if (!res.ok) throw new Error("calendar_unreachable");
    const body = await res.text();
    if (body.length > MAX_BYTES) throw new Error("calendar_too_large");

    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 14);
    const last = localDay(to, false);

    const days = new Set<string>();
    let events = 0;
    for (const item of Object.values(ical.sync.parseICS(body))) {
      if (!item || item.type !== "VEVENT") continue;
      for (const instance of ical.expandRecurringEvent(item, { from, to, includeOverrides: true, excludeExdates: true })) {
        events += 1;
        const dateOnly = Boolean(instance.isFullDay);
        let day = localDay(instance.start, dateOnly);
        // An end at midnight (or a date-only end) belongs to the next day, so it is not counted.
        const endDay = localDay(new Date(instance.end.getTime() - (dateOnly ? 0 : 1)), dateOnly);
        const stop = dateOnly ? localDay(new Date(instance.end.getTime() - 1), true) : endDay;
        for (let guard = 0; guard < 400 && day <= stop && day <= last; guard += 1) {
          days.add(day);
          day = nextDay(day);
        }
      }
    }

    const result = { days: [...days].sort(), events };
    cache.set(rawUrl, { at: Date.now(), result });
    return result;
  } catch (err) {
    console.error("calendar feed failed", err instanceof Error ? err.message : err);
    // A feed that is briefly down keeps showing its last good answer.
    if (hit) return hit.result;
    throw err;
  }
}
