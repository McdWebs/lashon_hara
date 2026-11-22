import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, Link, siteLang } from "../i18n";
import { fetchProducts } from "../../lib/catalog";
import { copy } from "../copy";
import { useSiteConfig } from "../../lib/siteConfig";
import { CardsSkeleton, Icon, QuoteMark, ShopCard, Title, usePageTitle } from "../ui";

type Slide = { photo: string; sig?: string; who: string; lines: string[]; side: "start" | "end"; long?: boolean };

const SLIDES: Slide[] = [
  { photo: "omer", sig: "omer_sig", who: "עומר אדם", lines: ["שים לב", "מה אתה אומר"], side: "start" },
  { photo: "static", sig: "static_sig", who: "סטטיק", lines: ["נוצר לשונו", "שומר נפשו"], side: "end" },
  { photo: "q1", sig: "q1_sig", who: "אתי אפינגר", lines: ["מוות וחיים", "ביד הלשון"], side: "start" },
  { photo: "q2", sig: "q2_sig", who: "לירן דנינו", lines: ["שומר פיו ולשונו", "שומר מצרות נפשו"], side: "end" },
  { photo: "q3", sig: "q3_sig", who: "עדן בחרי", lines: ["אם אנשים כמונו מצאו את האור בחושך", "אין לכם חושך בחיים שלכם", "פשוט תחיו"], side: "start", long: true },
  { photo: "q4", sig: "q4_sig", who: "עידן דה כהן", lines: ["מילה בונה, מילה הורסת", "הבחירה במילים", "היא הבחירה באדם"], side: "end", long: true },
  { photo: "q5", sig: "q5_sig", who: "שחר חיון", lines: ["תרקדו", "תשמחו", "תנצחו"], side: "start" },
];

const TILES = [
  { img: "cat_bracelets", label: "צמידים", collection: "bracelets" },
  { img: "cat_shirts", label: "חולצות", collection: "clothing" },
  { img: "cat_caps", label: "כובעים", collection: "clothing" },
  { img: "cat_sport", label: "ספורט", collection: "sport" },
  { img: "cat_mixed", wide: "cat_mixed_wide", label: "מיוחדים", collection: "special" },
] as const;

const HOLD_MS = 6500;

/** The two-line quotes, line by line. */
const QUOTE_EN: Record<string, string> = { "שים לב": "Watch", "מה אתה אומר": "what you say", "נוצר לשונו": "Guard your tongue,", "שומר נפשו": "guard your soul",
  "מוות וחיים": "Death and life", "ביד הלשון": "are in the power of the tongue",
  "שומר פיו ולשונו": "Whoever guards their mouth and tongue", "שומר מצרות נפשו": "keeps their soul from trouble",
  "אם אנשים כמונו מצאו את האור בחושך": "If people like us found the light in the dark", "אין לכם חושך בחיים שלכם": "there's no dark in your lives", "פשוט תחיו": "just live",
  "מילה בונה, מילה הורסת": "A word builds, a word destroys", "הבחירה במילים": "Choosing your words", "היא הבחירה באדם": "is choosing who you are",
  "תרקדו": "Dance", "תשמחו": "be happy", "תנצחו": "win" };

function EN_QUOTE(line: string) {
  return siteLang() === "en" ? QUOTE_EN[line] ?? line : line;
}

function Hero() {
  const reduced = useRef(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const [cur, setCur] = useState(0);
  // Every slide that is on its way out keeps its exit until it is done, even when the buttons are pressed in quick succession.
  const [leaving, setLeaving] = useState<number[]>([]);
  const curRef = useRef(0);
  const [stopped, setStopped] = useState(reduced.current);
  const [held, setHeld] = useState(false);
  // The first slide starts in its resting-off state and turns on after the first paint (and the fonts), so it plays its entrance on load.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = () => {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setReady(true));
      });
    };
    // Wait for the fonts and the first photo to be decoded, so the entrance never plays on a half-loaded image. The rest load quietly meanwhile.
    const decoded = SLIDES.map((sl) => {
      const img = new Image();
      img.src = `/images/site/${sl.photo}.jpg`;
      return img.decode().catch(() => undefined);
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.race([Promise.all([fonts, decoded[0]]), new Promise((r) => setTimeout(r, 1500))]).then(start);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = useCallback((i: number) => {
    const from = curRef.current;
    if (from === i) return;
    curRef.current = i;
    setCur(i);
    setLeaving((l) => [...l.filter((x) => x !== i && x !== from), from]);
    window.setTimeout(() => setLeaving((l) => l.filter((x) => x !== from || curRef.current === from)), 800);
  }, []);

  useEffect(() => {
    if (stopped || held || !ready) return;
    const timer = setTimeout(() => go((cur + 1) % SLIDES.length), HOLD_MS);
    return () => clearTimeout(timer);
  }, [cur, stopped, held, ready, go]);

  return (
    <section
      className="hero"
      aria-roledescription={t("קרוסלה")}
      aria-label={t("מה אומרים השגרירים")}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.photo}
          className={`slide side-${s.side}${s.long ? " long" : ""}${ready && i === cur ? " on" : ""}${leaving.includes(i) ? " out" : ""}`}
          role="group"
          aria-roledescription={t("שקופית")}
          aria-label={s.who ? t("{n} מתוך {total}: {who}", { n: i + 1, total: SLIDES.length, who: t(s.who) }) : t("שקופית {n}", { n: i + 1 })}
          aria-hidden={i !== cur}
        >
          <div className="s-photo">
            <img src={`/images/site/${s.photo}.jpg`} alt={s.who ? t("{who} בקפוצ׳ון של לשון הרע לא מדבר אליי", { who: t(s.who) }) : t("שגריר.ית בקפוצ׳ון של לשון הרע לא מדבר אליי")} />
          </div>
          <figure className="s-quote">
            <QuoteMark />
            <blockquote className="disp">
              {s.lines.map((line, k) => (
                <span key={line} className={`ql ql${k + 1}`}><span>{EN_QUOTE(line)}</span></span>
              ))}
            </blockquote>
            <figcaption>{s.sig ? <img className="sig" src={`/images/site/${s.sig}.jpg`} alt={t(s.who)} /> : <span className="s-name">{t(s.who)}</span>}</figcaption>
          </figure>
        </div>
      ))}
      <div className="hctl">
        <div className="dots">
          {SLIDES.map((s, i) => (
            <button key={s.photo} className={`dot${i === cur ? " on" : ""}`} aria-label={t("שקופית {n}", { n: i + 1 })} aria-current={i === cur || undefined} onClick={() => go(i)} />
          ))}
        </div>
        <button className={`hpause${stopped ? " paused" : ""}`} aria-label={stopped ? t("הפעלת ההחלפה") : t("עצירת ההחלפה")} onClick={() => setStopped((v) => !v)}>
          <Icon.pause />
        </button>
      </div>
    </section>
  );
}

export function HomePage() {
  usePageTitle(t("דף הבית"));
  const { config, ready } = useSiteConfig();
  const nc = config.newCollection;
  const source = config.shop.collections.find((c) => c.key === nc.source && c.categories.length > 0);
  const category = source ? source.categories.join(",") : "";
  const latest = useQuery({
    queryKey: ["site-home-latest", category],
    queryFn: () => fetchProducts(`per_page=8&orderby=date&order=desc${category ? `&category=${category}` : ""}`),
    enabled: ready,
  });

  return (
    <div className="page-home">
      <Hero />

      <section className="cats" aria-label={t("קטגוריות בחנות")}>
        {TILES.map((tile) => (
          <Link key={tile.img} className="cat" to={`/shop?collection=${tile.collection}`}>
            <picture>
              {"wide" in tile ? <source media="(max-width: 900px)" srcSet={`/images/site/${tile.wide}.jpg`} /> : null}
              <img src={`/images/site/${tile.img}.jpg`} alt="" />
            </picture>
            <span className="sr">{t(tile.label)}</span>
          </Link>
        ))}
      </section>

      <section className="story">
        <div className="wrap story-in">
          <div className="story-tx rv">
            <h2 className="story-h">{t("הסיפור של")}<br />{t("לשון הרע לא מדבר אליי")}</h2>
            <span className="bar" aria-hidden="true" />
            <p>{copy().FOUNDER_LEAD}</p>
            <p>{copy().FOUNDER_WHY}</p>
            <Link className="link" to="/who-we-are"><span>{t("לסיפור המלא")}</span><Icon.arrow /></Link>
          </div>
        </div>
      </section>

      <section className="newc">
        <div className="wrap">
          <Title as="h2">{siteLang() === "en" ? nc.en : nc.he}</Title>
          <div className="pgrid">
            {latest.isLoading ? <CardsSkeleton /> : null}
            {latest.data?.items.map((p, i) => (
              <div key={p.id} className="rv" style={{ "--d": `${(i % 4) * 0.07}s` } as React.CSSProperties}><ShopCard product={p} /></div>
            ))}
          </div>
          {latest.isError ? <p className="lead" role="alert">{t("לא הצלחנו לטעון את המוצרים. נסו לרענן את העמוד.")}</p> : null}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 44 }}>
            <Link className="btn btn-line" to="/shop"><span>{t("לכל הקולקציה")}</span><Icon.arrow /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
