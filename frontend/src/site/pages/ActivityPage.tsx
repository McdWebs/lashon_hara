import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { dateLocale, siteLang, t, Link, Navigate } from "../i18n";
import { Field, FormShell, Panel, Reveal, Toggle, useSiteForm } from "../forms";
import type { Program } from "../about";
import { fetchMedia, type MediaWorld } from "../../lib/media";
import { useSiteConfig } from "../../lib/siteConfig";
import { Icon, Title, usePageTitle } from "../ui";

/** The booking rules, from the admin: closed weekdays, how far ahead, and the days already taken. */
type CalendarRules = { closed: Set<number>; taken: Set<string>; monthsAhead: number };
const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const WEEKDAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];

type Reel = { kind: "video" | "photo"; src?: string; poster?: string; caption?: string };
type WorldConfig = { key: string; name: string; line: string; live: string; image: string; focus?: string; banner?: string; reels?: Reel[] };

const WORLDS: WorldConfig[] = [
  { key: "schools", name: "בתי ספר והרצאות", line: "הרצאות לבתי ספר ולמוסדות חינוך. בחרו תאריך ונחזור אליכם.", live: "", image: "/images/activity/schools.jpg", focus: "50% 38%" },
  { key: "idf", name: "צה״ל", line: "מפגשים והרצאות לחיילים ולמפקדים, על כוחה של מילה ועל שיח מכבד.", live: "", image: "/images/activity/idf.jpg", reels: [] },
  { key: "ambassadors", name: "שגרירים", line: "אמנים, ספורטאים ואנשי ציבור שמצטרפים ואומרים: לשון הרע לא מדבר אליי.", live: "", image: "/images/site/static.jpg", focus: "50% 14%", banner: "/images/store_images/celeb.jpg", reels: [] },
];


/** On phones the tiles stack above the content, so a pick brings the chosen section into view. */
function scrollToWorldOnPhone() {
  if (!window.matchMedia("(max-width: 900px)").matches) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => document.querySelector(".page-activity .world")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 80);
}

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(d: Date) {
  return d.toLocaleDateString(dateLocale(), { day: "numeric", month: "long", year: "numeric" });
}

type DayState = "free" | "taken" | "requested" | "past" | "closed";

function dayState(d: Date, today: Date, requested: Set<string>, rules: CalendarRules): DayState {
  const iso = isoDate(d);
  if (d <= today) return "past";
  if (rules.closed.has(d.getDay())) return "closed";
  if (rules.taken.has(iso)) return "taken";
  if (requested.has(iso)) return "requested";
  return "free";
}

const STATE_LABEL: Record<DayState, string> = { free: "פנוי", taken: "תפוס", requested: "התבקש", past: "עבר", closed: "לא זמין" };

function firstFree(today: Date, requested: Set<string>, rules: CalendarRules) {
  const d = new Date(today);
  for (let i = 0; i < 120; i += 1) {
    d.setDate(d.getDate() + 1);
    if (dayState(d, today, requested, rules) === "free") return new Date(d);
  }
  return null;
}

function useRequestedDates() {
  const query = useQuery({
    queryKey: ["site-requested-dates"],
    queryFn: async () => {
      const res = await fetch("/api/forms/requested-dates");
      if (!res.ok) return [] as string[];
      return ((await res.json()) as { dates: string[] }).dates;
    },
  });
  return useMemo(() => new Set(query.data ?? []), [query.data]);
}

function lectureName(program: Program) {
  return program.title.split("\n")[0];
}

/** On phones, shrinks the lecture titles just enough to keep each on one line, all to the same size. */
function useFitOneLine(ref: React.RefObject<HTMLElement | null>, text: string) {
  useLayoutEffect(() => {
    const fit = () => {
      const all = [...document.querySelectorAll<HTMLElement>(".page-activity .lec-h h3")];
      all.forEach((el) => { el.style.fontSize = ""; });
      if (!window.matchMedia("(max-width: 900px)").matches) return;
      let size = Infinity;
      for (const el of all) {
        const need = el.scrollWidth;
        if (need > el.clientWidth) size = Math.min(size, (parseFloat(getComputedStyle(el).fontSize) * el.clientWidth) / need - 0.5);
      }
      if (size < Infinity) all.forEach((el) => { el.style.fontSize = `${size}px`; });
    };
    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [ref, text]);
}

function Lecture({ program, selected, onSelect }: { program: Program; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, subtitle] = program.title.split("\n");
  const titleRef = useRef<HTMLHeadingElement>(null);
  useFitOneLine(titleRef, title);
  return (
    <article className={`lec${selected ? " on" : ""}`}>
      <header className="lec-h" onClick={onSelect}>
        <h3 className="disp" ref={titleRef}>{title}</h3>
        <p>{subtitle ?? program.lead}</p>
      </header>
      <div className={`lec-b${open ? " open" : ""}`}>
        {program.body.map((text) => <p key={text}>{text}</p>)}
      </div>
      <button className="lec-more" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{open ? t("סגירה") : t("קראו עוד")}</span>
        <Icon.plus />
      </button>
      <ul className="lec-n">
        {program.notes.map((text) => <li key={text}><span className="sq" aria-hidden="true" />{text}</li>)}
      </ul>
      <button className="lec-pick" aria-pressed={selected} onClick={onSelect}>
        {selected ? <Icon.ok /> : null}
        <span>{selected ? t("ההרצאה שבחרתם") : t("בחירת ההרצאה הזאת")}</span>
      </button>
    </article>
  );
}

function Calendar({ today, requested, rules, onPick, lecture, picked }: { today: Date; requested: Set<string>; rules: CalendarRules; onPick: (d: Date) => void; lecture: string | null; picked: Date | null }) {
  // Opens on the first month that still has a bookable day.
  const [offset, setOffset] = useState(() => {
    const next = firstFree(today, requested, rules);
    if (!next) return 0;
    return (next.getFullYear() - today.getFullYear()) * 12 + next.getMonth() - today.getMonth();
  });
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1));
  const pickedIso = picked ? isoDate(picked) : null;

  return (
    <div className={`cal${lecture ? "" : " locked"}`}>
      <h3 className="step disp"><span>2</span>{t("בוחרים תאריך")}</h3>
      <dl className="cal-sum" aria-live="polite">
        <div>
          <dt>{t("הרצאה")}</dt>
          <dd>{lecture ?? t("קודם בוחרים הרצאה")}</dd>
        </div>
        {lecture && pickedIso && dayState(picked!, today, requested, rules) === "free" ? (
          <div>
            <dt>{t("מועד")}</dt>
            <dd>{dayLabel(picked!)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="cal-h">
        <span className="mon-n disp" aria-live="polite">{first.toLocaleDateString(dateLocale(), { month: "long", year: "numeric" })}</span>
        <div className="cal-nav">
          <button className="iconbtn dark" disabled={offset === 0} aria-label={t("החודש הקודם")} onClick={() => setOffset((o) => o - 1)}><Icon.prev /></button>
          <button className="iconbtn dark" disabled={offset >= rules.monthsAhead} aria-label={t("החודש הבא")} onClick={() => setOffset((o) => o + 1)}><Icon.next /></button>
        </div>
      </div>
      <div className="cgrid">
        {(siteLang() === "en" ? WEEKDAYS_EN : WEEKDAYS).map((w, i) => <span className="dn" key={i} aria-hidden="true">{w}</span>)}
        {Array.from({ length: first.getDay() }, (_, i) => <span className="cd out" key={`o${i}`} aria-hidden="true" />)}
        {days.map((d) => {
          const state = dayState(d, today, requested, rules);
          const label = `${dayLabel(d)}, ${t(STATE_LABEL[state])}`;
          if (state === "free") {
            return <button key={d.getDate()} type="button" className={`cd free${isoDate(d) === pickedIso ? " pick" : ""}`} aria-label={label} aria-pressed={isoDate(d) === pickedIso} disabled={!lecture} onClick={() => onPick(d)}>{d.getDate()}</button>;
          }
          return <span key={d.getDate()} className={`cd ${state === "requested" ? "req" : state}`} role="img" aria-label={label}>{d.getDate()}</span>;
        })}
      </div>
      <div className="legend">
        <span><i className="lg free" />{t("פנוי")}</span>
        <span><i className="lg pick" />{t("הבחירה שלכם")}</span>
        <span><i className="lg req" />{t("התבקש")}</span>
        <span><i className="lg taken" />{t("תפוס")}</span>
      </div>
    </div>
  );
}

function SchoolForm({ date, lecture, onSent }: { date: Date; lecture: string; onSent: (iso: string) => void }) {
  const form = useSiteForm(
    {
      lecture: { required: true },
      date: { required: true },
      school: { required: true },
      city: { required: true },
      contactName: { required: true },
      role: { required: true },
      phone: { required: true, kind: "tel" },
      email: { required: true, kind: "email" },
      audience: { required: true },
      freeBracelets: {},
      braceletCount: { required: true, kind: "num", active: (v) => Boolean(v.freeBracelets) },
      notes: {},
    },
    {
      kind: "school",
      initial: { lecture, date: dayLabel(date) },
      toPayload: (v) => ({ ...v, dateIso: isoDate(date) }),
      onSent: () => onSent(isoDate(date)),
    },
  );
  return (
    <FormShell form={form} submitLabel={t("שליחת הבקשה")} thanksTitle={t("תודה! הבקשה נשלחה.")} thanksText={t("נחזור אליכם לאישור המועד. עד אז התאריך יופיע לאחרים כ״התבקש״. שלחנו אישור גם למייל.")}>
      <Field f={form.field("lecture")} label={t("ההרצאה שבחרתם")} readOnly />
      <Field f={form.field("date")} label={t("התאריך שבחרתם")} readOnly />
      <div className="two">
        <Field f={form.field("school")} label={t("שם בית הספר")} />
        <Field f={form.field("city")} label={t("עיר")} auto="address-level2" />
      </div>
      <div className="two">
        <Field f={form.field("contactName")} label={t("שם איש/אשת הקשר")} auto="name" />
        <Field f={form.field("role")} label={t("תפקיד")} />
      </div>
      <div className="two">
        <Field f={form.field("phone")} label={t("טלפון")} type="tel" mode="tel" auto="tel" dir="ltr" />
        <Field f={form.field("email")} label={t("כתובת מייל")} type="email" mode="email" auto="email" dir="ltr" />
      </div>
      <Field f={form.field("audience")} label={t("גיל הקהל וגודל הקבוצה")} note={t("למשל: כיתות ז׳, כ־120 תלמידים")} />
      <Toggle f={form.field("freeBracelets")}>{t("צמידים חינם לתלמידים")}</Toggle>
      <Reveal open={Boolean(form.values.freeBracelets)}>
        <Field f={form.field("braceletCount")} label={t("כמה צמידים")} mode="numeric" />
      </Reveal>
      <Field f={form.field("notes")} label={t("הערות")} rows={3} />
    </FormShell>
  );
}

function Banner({ world, banner }: { world: WorldConfig; banner?: string }) {
  return (
    <div className="wb">
      <div className="wb-tx">
        <span className="bar" aria-hidden="true" />
        <h2 className="wb-t disp">{t(world.name)}</h2>
        <p className="lead">{t(world.line)}</p>
      </div>
      <div className="wb-ph">
        <img src={banner ?? world.banner ?? world.image} alt="" />
      </div>
    </div>
  );
}

function ReelMedia({ reel, index, playing, muted = true, onToggle, onProgress }: { reel: Reel; index: number; playing: boolean; muted?: boolean; onToggle?: () => void; onProgress?: (share: number) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const name = `${t(reel.kind === "video" ? "סרטון" : "תמונה")} ${index + 1}`;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (!playing) {
      el.pause();
      return;
    }
    // A browser can refuse sound without a fresh tap: play silently rather than not at all.
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => undefined);
    });
  }, [playing]);

  if (reel.kind === "video" && reel.src) {
    // The #t shows a real frame before it plays.
    return (
      <video
        ref={video}
        src={`${reel.src}#t=0.5`}
        poster={reel.poster}
        preload="metadata"
        muted={muted}
        loop
        playsInline
        aria-label={name}
        onClick={onToggle}
        onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  if (reel.src) return <img src={reel.src} alt={reel.caption ?? name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
  return <span className="ph" style={{ position: "absolute", inset: 0 }}>{name}</span>;
}

function useIsPhone() {
  const [phone, setPhone] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => setPhone(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return phone;
}

/** Phone: full screen over a locked page. One reel at a time, a swipe lands on the next, and the one on screen plays by itself. */
function ReelViewer({ reels, start, onClose }: { reels: Reel[]; start: number; onClose: () => void }) {
  const [active, setActive] = useState<number | null>(start);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const feed = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);

  useLayoutEffect(() => {
    const el = feed.current;
    if (el) el.scrollTop = start * el.clientHeight;
  }, [start]);

  useEffect(() => {
    const items = Array.from(feed.current?.children ?? []);
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(items.indexOf(entry.target));
          setPaused(false);
        }
      });
    }, { threshold: 0.7 });
    items.forEach((item) => seen.observe(item));

    const root = document.documentElement;
    const before = root.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    root.style.overflow = "hidden";
    close.current?.focus();
    // The phone's back button closes the viewer instead of leaving the page.
    window.history.pushState({ reels: true }, "");
    const onBack = () => onClose();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") window.history.back(); };
    window.addEventListener("popstate", onBack);
    window.addEventListener("keydown", onKey);
    return () => {
      seen.disconnect();
      root.style.overflow = before;
      window.removeEventListener("popstate", onBack);
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="lh page-activity reelv" dir={siteLang() === "en" ? "ltr" : "rtl"} role="dialog" aria-modal="true" aria-label={t("סרטונים ותמונות")}>
      <button ref={close} className="iconbtn dark reelv-x" aria-label={t("סגירה")} onClick={() => window.history.back()}><Icon.close /></button>
      <div className="rfeed" ref={feed}>
        {reels.map((reel, i) => {
          const playing = active === i && !paused;
          return (
            <div className={`rbig ri${playing ? " playing" : ""}`} key={reel.src ?? i}>
              <ReelMedia
                reel={reel}
                index={i}
                playing={playing}
                muted={muted}
                onToggle={() => setPaused((v) => !v)}
                onProgress={(share) => { const bar = bars.current[i]; if (bar) bar.style.transform = `scaleX(${share})`; }}
              />
              <span className="rshade" />
              <span className="rnum" dir="ltr" aria-hidden="true">{i + 1} / {reels.length}</span>
              {reel.kind === "video" ? (
                <>
                  <button className="rplay" aria-label={t("הפעלה")} onClick={() => setPaused(false)}><Icon.play /></button>
                  <button className="iconbtn dark rmute" aria-pressed={!muted} aria-label={muted ? t("הפעלת הסאונד") : t("כיבוי הסאונד")} onClick={() => setMuted((v) => !v)}>
                    {muted ? <Icon.mute /> : <Icon.sound />}
                  </button>
                  <span className="rprog" aria-hidden="true"><span ref={(el) => { bars.current[i] = el; }} /></span>
                </>
              ) : null}
              <span className="rcap">{reel.caption ?? t("[כיתוב לסרטון]")}</span>
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

function ReelGrid({ reels }: { reels: Reel[] }) {
  const [opened, setOpened] = useState<number | null>(null);
  const closeViewer = useCallback(() => setOpened(null), []);
  return (
    <>
      <div className="rgrid">
        {reels.map((r, i) => (
          <button key={r.src ?? i} className="rt" aria-label={t("פתיחת {what} {n}", { what: t(r.kind === "video" ? "סרטון" : "תמונה"), n: i + 1 })} onClick={() => setOpened(i)}>
            <ReelMedia reel={r} index={i} playing={false} />
            {r.kind === "video" ? <span className="rt-play" aria-hidden="true"><Icon.play /></span> : null}
          </button>
        ))}
      </div>
      {opened !== null ? <ReelViewer reels={reels} start={opened} onClose={closeViewer} /> : null}
    </>
  );
}

function Reels({ reels }: { reels: Reel[] }) {
  const phone = useIsPhone();
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const bar = useRef<HTMLSpanElement>(null);
  if (reels.length === 0) return <div className="state"><h2>{t("עוד מעט יהיה כאן מה לראות.")}</h2></div>;
  if (phone) return <ReelGrid reels={reels} />;
  const reel = reels[cur];
  return (
    <div className="reels">
      <div className={`rbig${playing ? " playing" : ""}`}>
        <ReelMedia
          key={reel.src}
          reel={reel}
          index={cur}
          playing={playing}
          muted={muted}
          onToggle={() => setPlaying((v) => !v)}
          onProgress={(share) => { if (bar.current) bar.current.style.transform = `scaleX(${share})`; }}
        />
        <span className="rshade" />
        {reel.kind === "video" ? <button className="rplay" aria-label={t("הפעלה")} onClick={() => setPlaying(true)}><Icon.play /></button> : null}
        {reel.kind === "video" ? (
          <button className="iconbtn dark rmute" aria-pressed={!muted} aria-label={muted ? t("הפעלת הסאונד") : t("כיבוי הסאונד")} onClick={() => setMuted((v) => !v)}>
            {muted ? <Icon.mute /> : <Icon.sound />}
          </button>
        ) : null}
        <span className="rcap">{reel.caption ?? t("[כיתוב לסרטון]")}</span>
        {reel.kind === "video" ? <span className="rprog" aria-hidden="true"><span ref={bar} /></span> : null}
      </div>
      <div className="rgrid">
        {reels.map((r, i) => (
          <button key={i} className={`rt${i === cur ? " on" : ""}`} aria-label={`${t(r.kind === "video" ? "סרטון" : "תמונה")} ${i + 1}`} onClick={() => { setCur(i); setPlaying(r.kind === "video"); }}>
            <ReelMedia reel={r} index={i} playing={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Each digit rolls up and settles on its value on load. The resting state is the real number, so no motion still reads right. */
function RollingNumber({ value }: { value: number }) {
  const text = value.toLocaleString(dateLocale());
  return (
    <span className="cn disp" role="img" aria-label={text}>
      <span className="roll" dir="ltr" aria-hidden="true">
        {[...text].map((char, i) => {
          if (!/\d/.test(char)) return <span key={i}>{char}</span>;
          const stops = 20 + Number(char);
          return (
            <span className="rd" key={i} style={{ "--i": i, "--n": stops } as React.CSSProperties}>
              <span className="rd-w">{char}</span>
              <span className="rd-c">{Array.from({ length: stops + 1 }, (_, k) => <span key={k}>{k % 10}</span>)}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

export function ActivityPage() {
  usePageTitle(t("הפעילות שלנו"));
  const { world: worldKey } = useParams();
  const queryClient = useQueryClient();
  const requestedFromServer = useRequestedDates();
  const [sentDates, setSentDates] = useState<string[]>([]);
  const [picked, setPicked] = useState<Date | null>(null);
  const [lecture, setLecture] = useState<string | null>(null);

  function chooseLecture(name: string) {
    setLecture(name);
    // On a phone the calendar is further down the page: take them to the next step.
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.getElementById("book-cal")?.scrollIntoView({ behavior: "smooth" });
    }
  }
  const [panelOpen, setPanelOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const requested = useMemo(() => new Set([...requestedFromServer, ...sentDates]), [requestedFromServer, sentDates]);
  const { config, ready } = useSiteConfig();
  const rules = useMemo<CalendarRules>(
    () => ({ closed: new Set(config.calendar.closedWeekdays), taken: new Set(config.calendar.takenDates), monthsAhead: config.calendar.monthsAhead }),
    [config.calendar],
  );
  const programs = config.lectures.map((l) => (siteLang() === "en" ? l.en ?? l.he : l.he));
  const handedOut = config.counter;
  const next = firstFree(today, requested, rules);

  const world = WORLDS.find((w) => w.key === (worldKey ?? "schools"));

  // The team uploads photos and videos in the admin; until they do, the section says more is coming.
  const mediaWorld: MediaWorld | null = world?.key === "idf" || world?.key === "ambassadors" ? world.key : null;
  const uploaded = useQuery({
    queryKey: ["site-media", mediaWorld],
    queryFn: () => fetchMedia(mediaWorld!),
    enabled: mediaWorld !== null,
    retry: 0,
  });

  if (!world) return <Navigate to="/activity" replace />;
  const reels: Reel[] = (uploaded.data ?? []).map((m) => ({ kind: m.kind, src: m.src, caption: m.caption }));
  const firstPhoto = uploaded.data?.find((m) => m.kind === "photo")?.src;

  return (
    <div className="page-activity">
      <section className="top">
        <div className="wrap top-in">
          <Title big lead={t("העמותה מתמקדת בתחום החינוך ומפעילה תוכניות מקצועיות לילדים ובני נוער במסגרת גנים, בתי ספר, תיכונים ותנועות נוער.")}>{t("הפעילות שלנו")}</Title>
          <div className="counter rv">
            {!ready ? <span className="cn disp" aria-hidden="true">&nbsp;</span> : handedOut === null ? <span className="cn disp">000,000</span> : <RollingNumber value={handedOut} />}
            <span className="cl">{t("צמידים חולקו חינם")}{ready && handedOut === null ? <span className="muted">{" "}{t("· מספר לדוגמה")}</span> : null}</span>
          </div>
        </div>
      </section>

      <div className="wtiles" role="tablist" aria-label={t("העולמות")}>
        {WORLDS.map((w) => (
          <Link key={w.key} className={`wt${w.key === world.key ? " on" : ""}`} to={w.key === "schools" ? "/activity" : `/activity/${w.key}`} role="tab" aria-selected={w.key === world.key} preventScrollReset onClick={scrollToWorldOnPhone}>
            <img src={w.image} alt="" style={w.focus ? { objectPosition: w.focus } : undefined} />
            <span className="wt-in">
              <span className="wt-n">{t(w.name)}</span>
              <span className="wt-l">{w.key === "schools" && next ? t("המועד הפנוי הבא: {date}", { date: next.toLocaleDateString(dateLocale(), { day: "numeric", month: "long" }) }) : w.live ? t(w.live) : ""}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="world in" key={world.key} role="tabpanel" aria-label={t(world.name)}>
        <div className="wrap">
          {world.reels ? (
            <>
              <Banner world={world} banner={firstPhoto} />
              {uploaded.isLoading ? <div className="skel" style={{ height: 420 }} aria-hidden="true" /> : <Reels reels={reels} />}
            </>
          ) : (
            <div className="book">
              <div className="book-l">
                <p className="book-line">{t(world.line)}</p>
                <h3 className="step disp"><span>1</span>{t("בוחרים הרצאה")}</h3>
                <div className={`lecs${lecture ? " has-pick" : ""}`}>
                  {!ready ? <><div className="skel" style={{ height: 150 }} aria-hidden="true" /><div className="skel" style={{ height: 150 }} aria-hidden="true" /></> : programs.map((p) => (
                    <Lecture key={p.title} program={p} selected={lecture === lectureName(p)} onSelect={() => chooseLecture(lectureName(p))} />
                  ))}
                </div>
              </div>
              <div className="book-c" id="book-cal">
                {ready ? <Calendar today={today} requested={requested} rules={rules} lecture={lecture} picked={picked} onPick={(d) => { setPicked(d); setPanelOpen(true); }} /> : <div className="skel" style={{ height: 420 }} aria-hidden="true" />}
              </div>
            </div>
          )}
        </div>
      </section>

      <Panel open={panelOpen} onClose={() => setPanelOpen(false)} title={t("בקשה לבית ספר")}>
        {picked && lecture ? (
          <SchoolForm
            key={`${isoDate(picked)}-${lecture}`}
            date={picked}
            lecture={lecture}
            onSent={(iso) => {
              setSentDates((prev) => [...prev, iso]);
              queryClient.invalidateQueries({ queryKey: ["site-requested-dates"] });
            }}
          />
        ) : null}
      </Panel>
    </div>
  );
}

