import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Navigate, useParams } from "react-router-dom";
import { Field, FormShell, Panel, Reveal, Toggle, useSiteForm } from "../forms";
import { PROGRAMS, type Program } from "../about";
import { Icon, Title, usePageTitle } from "../ui";

/** From the team's text update. Should move to the admin (see spec). */
const BRACELETS_HANDED_OUT: number | null = 2885026;

/** Filled from Google/Apple Calendar once connected. Until then only the rules below apply. */
const TAKEN_DATES = new Set<string>();

const MONTHS_AHEAD = 3;
const CLOSED_WEEKDAYS = new Set([5, 6]); // Friday, Saturday. Open decision in the spec.
const WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

type Reel = { kind: "video" | "photo"; src?: string; poster?: string; caption?: string };
type WorldConfig = { key: string; name: string; line: string; live: string; image: string; banner?: string; reels?: Reel[] };

/** Placeholder media: the team's own photos and videos, served from the live site until they pick the final set. */
const LIVE_MEDIA = "https://lashonhara.co.il/wp-content/uploads";

const idfReels: Reel[] = [
  { kind: "video", src: `${LIVE_MEDIA}/2024/05/WhatsApp-Video-2024-05-07-at-15.34.14_1cb4ba69.mp4` },
  { kind: "photo", src: `${LIVE_MEDIA}/2024/02/חיילים-e1706777574141.jpeg` },
  { kind: "photo", src: `${LIVE_MEDIA}/2020/11/1-2.jpg` },
  { kind: "photo", src: `${LIVE_MEDIA}/2020/11/2-3.jpg` },
  { kind: "photo", src: `${LIVE_MEDIA}/2020/11/6-1.jpg` },
];

const ambassadorReels: Reel[] = [
  { kind: "video", src: `${LIVE_MEDIA}/2022/09/רימון-מקלדת-הבימה-הקמה.mp4` },
  { kind: "photo", src: "/images/site/omer.jpg" },
  { kind: "photo", src: "/images/site/static.jpg" },
  { kind: "video", src: `${LIVE_MEDIA}/2022/04/WhatsApp-Video-2022-04-14-at-12.03.57.mp4` },
  { kind: "photo", src: "/images/store_images/celeb.jpg" },
  { kind: "photo", src: `${LIVE_MEDIA}/2020/11/7-1.jpg` },
];

const WORLDS: WorldConfig[] = [
  { key: "schools", name: "בתי ספר והרצאות", line: "הרצאות לבתי ספר ולמוסדות חינוך. בחרו תאריך ונחזור אליכם.", live: "", image: "/images/store_images/hands_heart_sign.jpg" },
  { key: "idf", name: "צה״ל", line: "[שורה אחת על הפעילות בצה״ל — מהצוות]", live: "[שורה חיה — מתעדכנת במערכת]", image: `${LIVE_MEDIA}/2024/02/חיילים-e1706777574141.jpeg`, banner: `${LIVE_MEDIA}/2020/11/1-2.jpg`, reels: idfReels },
  { key: "ambassadors", name: "שגרירים", line: "[שורה אחת על השגרירים — מהצוות]", live: "[שורה חיה — מתעדכנת במערכת]", image: "/images/site/static.jpg", banner: "/images/store_images/celeb.jpg", reels: ambassadorReels },
];


function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

type DayState = "free" | "taken" | "requested" | "past" | "closed";

function dayState(d: Date, today: Date, requested: Set<string>): DayState {
  const iso = isoDate(d);
  if (d <= today) return "past";
  if (CLOSED_WEEKDAYS.has(d.getDay())) return "closed";
  if (TAKEN_DATES.has(iso)) return "taken";
  if (requested.has(iso)) return "requested";
  return "free";
}

const STATE_LABEL: Record<DayState, string> = { free: "פנוי", taken: "תפוס", requested: "התבקש", past: "עבר", closed: "לא זמין" };

function firstFree(today: Date, requested: Set<string>) {
  const d = new Date(today);
  for (let i = 0; i < 120; i += 1) {
    d.setDate(d.getDate() + 1);
    if (dayState(d, today, requested) === "free") return new Date(d);
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

function Lecture({ program, selected, onSelect }: { program: Program; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, subtitle] = program.title.split("\n");
  return (
    <article className={`lec${selected ? " on" : ""}`}>
      <header className="lec-h" onClick={onSelect}>
        <h3 className="disp">{title}</h3>
        <p>{subtitle ?? program.lead}</p>
      </header>
      <div className={`lec-b${open ? " open" : ""}`}>
        {program.body.map((text) => <p key={text}>{text}</p>)}
      </div>
      <button className="lec-more" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{open ? "סגירה" : "קראו עוד"}</span>
        <Icon.plus />
      </button>
      <ul className="lec-n">
        {program.notes.map((text) => <li key={text}><span className="sq" aria-hidden="true" />{text}</li>)}
      </ul>
      <button className="lec-pick" aria-pressed={selected} onClick={onSelect}>
        {selected ? <Icon.ok /> : null}
        <span>{selected ? "ההרצאה שבחרתם" : "בחירת ההרצאה הזאת"}</span>
      </button>
    </article>
  );
}

function Calendar({ today, requested, onPick, lecture, picked }: { today: Date; requested: Set<string>; onPick: (d: Date) => void; lecture: string | null; picked: Date | null }) {
  // Opens on the first month that still has a bookable day.
  const [offset, setOffset] = useState(() => {
    const next = firstFree(today, requested);
    if (!next) return 0;
    return (next.getFullYear() - today.getFullYear()) * 12 + next.getMonth() - today.getMonth();
  });
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1));
  const pickedIso = picked ? isoDate(picked) : null;

  return (
    <div className={`cal${lecture ? "" : " locked"}`}>
      <h3 className="step disp"><span>2</span>בוחרים תאריך</h3>
      <dl className="cal-sum" aria-live="polite">
        <div>
          <dt>הרצאה</dt>
          <dd>{lecture ?? "קודם בוחרים הרצאה"}</dd>
        </div>
        {lecture && pickedIso && dayState(picked!, today, requested) === "free" ? (
          <div>
            <dt>מועד</dt>
            <dd>{dayLabel(picked!)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="cal-h">
        <span className="mon-n disp" aria-live="polite">{first.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</span>
        <div className="cal-nav">
          <button className="iconbtn dark" disabled={offset === 0} aria-label="החודש הקודם" onClick={() => setOffset((o) => o - 1)}><Icon.prev /></button>
          <button className="iconbtn dark" disabled={offset === MONTHS_AHEAD} aria-label="החודש הבא" onClick={() => setOffset((o) => o + 1)}><Icon.next /></button>
        </div>
      </div>
      <div className="cgrid">
        {WEEKDAYS.map((w) => <span className="dn" key={w} aria-hidden="true">{w}</span>)}
        {Array.from({ length: first.getDay() }, (_, i) => <span className="cd out" key={`o${i}`} aria-hidden="true" />)}
        {days.map((d) => {
          const state = dayState(d, today, requested);
          const label = `${dayLabel(d)}, ${STATE_LABEL[state]}`;
          if (state === "free") {
            return <button key={d.getDate()} type="button" className={`cd free${isoDate(d) === pickedIso ? " pick" : ""}`} aria-label={label} aria-pressed={isoDate(d) === pickedIso} disabled={!lecture} onClick={() => onPick(d)}>{d.getDate()}</button>;
          }
          return <span key={d.getDate()} className={`cd ${state === "requested" ? "req" : state}`} role="img" aria-label={label}>{d.getDate()}</span>;
        })}
      </div>
      <div className="legend">
        <span><i className="lg free" />פנוי</span>
        <span><i className="lg pick" />הבחירה שלכם</span>
        <span><i className="lg req" />התבקש</span>
        <span><i className="lg taken" />תפוס</span>
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
    <FormShell form={form} submitLabel="שליחת הבקשה" thanksTitle="תודה! הבקשה נשלחה." thanksText="נחזור אליכם לאישור המועד. עד אז התאריך יופיע לאחרים כ״התבקש״. שלחנו אישור גם למייל.">
      <Field f={form.field("lecture")} label="ההרצאה שבחרתם" readOnly />
      <Field f={form.field("date")} label="התאריך שבחרתם" readOnly />
      <div className="two">
        <Field f={form.field("school")} label="שם בית הספר" />
        <Field f={form.field("city")} label="עיר" auto="address-level2" />
      </div>
      <div className="two">
        <Field f={form.field("contactName")} label="שם איש/אשת הקשר" auto="name" />
        <Field f={form.field("role")} label="תפקיד" />
      </div>
      <div className="two">
        <Field f={form.field("phone")} label="טלפון" type="tel" mode="tel" auto="tel" dir="ltr" />
        <Field f={form.field("email")} label="כתובת מייל" type="email" mode="email" auto="email" dir="ltr" />
      </div>
      <Field f={form.field("audience")} label="גיל הקהל וגודל הקבוצה" note="למשל: כיתות ז׳, כ־120 תלמידים" />
      <Toggle f={form.field("freeBracelets")}>צמידים חינם לתלמידים</Toggle>
      <Reveal open={Boolean(form.values.freeBracelets)}>
        <Field f={form.field("braceletCount")} label="כמה צמידים" mode="numeric" />
      </Reveal>
      <Field f={form.field("notes")} label="הערות" rows={3} />
    </FormShell>
  );
}

function Banner({ world }: { world: WorldConfig }) {
  return (
    <div className="wb">
      <div className="wb-tx">
        <span className="bar" aria-hidden="true" />
        <h2 className="wb-t disp">{world.name}</h2>
        <p className="lead">{world.line}</p>
      </div>
      <div className="wb-ph">
        {world.banner ? <img src={world.banner} alt="" /> : <span className="ph" style={{ position: "absolute", inset: 0 }}>תמונה מהפעילות</span>}
      </div>
    </div>
  );
}

function ReelMedia({ reel, index, playing, muted = true, onToggle, onProgress }: { reel: Reel; index: number; playing: boolean; muted?: boolean; onToggle?: () => void; onProgress?: (share: number) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const name = `${reel.kind === "video" ? "סרטון" : "תמונה"} ${index + 1}`;

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
    <div className="lh page-activity reelv" dir="rtl" role="dialog" aria-modal="true" aria-label="סרטונים ותמונות">
      <button ref={close} className="iconbtn dark reelv-x" aria-label="סגירה" onClick={() => window.history.back()}><Icon.close /></button>
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
                  <button className="rplay" aria-label="הפעלה" onClick={() => setPaused(false)}><Icon.play /></button>
                  <button className="iconbtn dark rmute" aria-pressed={!muted} aria-label={muted ? "הפעלת הסאונד" : "כיבוי הסאונד"} onClick={() => setMuted((v) => !v)}>
                    {muted ? <Icon.mute /> : <Icon.sound />}
                  </button>
                  <span className="rprog" aria-hidden="true"><span ref={(el) => { bars.current[i] = el; }} /></span>
                </>
              ) : null}
              <span className="rcap">{reel.caption ?? "[כיתוב לסרטון]"}</span>
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
          <button key={r.src ?? i} className="rt" aria-label={`פתיחת ${r.kind === "video" ? "סרטון" : "תמונה"} ${i + 1}`} onClick={() => setOpened(i)}>
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
  if (reels.length === 0) return <div className="state"><h2>עוד מעט יהיה כאן מה לראות.</h2></div>;
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
        {reel.kind === "video" ? <button className="rplay" aria-label="הפעלה" onClick={() => setPlaying(true)}><Icon.play /></button> : null}
        {reel.kind === "video" ? (
          <button className="iconbtn dark rmute" aria-pressed={!muted} aria-label={muted ? "הפעלת הסאונד" : "כיבוי הסאונד"} onClick={() => setMuted((v) => !v)}>
            {muted ? <Icon.mute /> : <Icon.sound />}
          </button>
        ) : null}
        <span className="rcap">{reel.caption ?? "[כיתוב לסרטון]"}</span>
        {reel.kind === "video" ? <span className="rprog" aria-hidden="true"><span ref={bar} /></span> : null}
      </div>
      <div className="rgrid">
        {reels.map((r, i) => (
          <button key={i} className={`rt${i === cur ? " on" : ""}`} aria-label={`${r.kind === "video" ? "סרטון" : "תמונה"} ${i + 1}`} onClick={() => { setCur(i); setPlaying(r.kind === "video"); }}>
            <ReelMedia reel={r} index={i} playing={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Each digit rolls up and settles on its value on load. The resting state is the real number, so no motion still reads right. */
function RollingNumber({ value }: { value: number }) {
  const text = value.toLocaleString("he-IL");
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
  usePageTitle("הפעילות שלנו");
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
  const next = firstFree(today, requested);

  const world = WORLDS.find((w) => w.key === (worldKey ?? "schools"));
  if (!world) return <Navigate to="/activity" replace />;

  return (
    <div className="page-activity">
      <section className="top">
        <div className="wrap top-in">
          <Title big lead="העמותה מתמקדת בתחום החינוך ומפעילה תוכניות מקצועיות לילדים ובני נוער במסגרת גנים, בתי ספר, תיכונים ותנועות נוער.">הפעילות שלנו</Title>
          <div className="counter rv">
            {BRACELETS_HANDED_OUT === null ? <span className="cn disp">000,000</span> : <RollingNumber value={BRACELETS_HANDED_OUT} />}
            <span className="cl">צמידים חולקו חינם{BRACELETS_HANDED_OUT === null ? <span className="muted"> · מספר לדוגמה</span> : null}</span>
          </div>
        </div>
      </section>

      <div className="wtiles" role="tablist" aria-label="העולמות">
        {WORLDS.map((w) => (
          <Link key={w.key} className={`wt${w.key === world.key ? " on" : ""}`} to={w.key === "schools" ? "/activity" : `/activity/${w.key}`} role="tab" aria-selected={w.key === world.key} preventScrollReset>
            <img src={w.image} alt="" />
            <span className="wt-in">
              <span className="wt-n">{w.name}</span>
              <span className="wt-l">{w.key === "schools" && next ? `המועד הפנוי הבא: ${next.toLocaleDateString("he-IL", { day: "numeric", month: "long" })}` : w.live}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="world in" key={world.key} role="tabpanel" aria-label={world.name}>
        <div className="wrap">
          {world.reels ? (
            <>
              <Banner world={world} />
              <Reels reels={world.reels} />
            </>
          ) : (
            <div className="book">
              <div className="book-l">
                <p className="book-line">{world.line}</p>
                <h3 className="step disp"><span>1</span>בוחרים הרצאה</h3>
                <div className={`lecs${lecture ? " has-pick" : ""}`}>
                  {PROGRAMS.map((p) => (
                    <Lecture key={p.title} program={p} selected={lecture === lectureName(p)} onSelect={() => chooseLecture(lectureName(p))} />
                  ))}
                </div>
              </div>
              <div className="book-c" id="book-cal">
                <Calendar today={today} requested={requested} lecture={lecture} picked={picked} onPick={(d) => { setPicked(d); setPanelOpen(true); }} />
              </div>
            </div>
          )}
        </div>
      </section>

      <Panel open={panelOpen} onClose={() => setPanelOpen(false)} title="בקשה לבית ספר">
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

