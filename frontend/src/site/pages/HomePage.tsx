import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, Link, siteLang } from "../i18n";
import { fetchProducts, type WcProduct } from "../../lib/catalog";
import { copy } from "../copy";
import { CardsSkeleton, Icon, ProductImage, QuoteMark, Title, canQuickAdd, priceLabel, usePageTitle, useQuickAdd } from "../ui";

const SLIDES = [
  { photo: "omer", sig: "omer_sig", who: "עומר אדם", lines: ["שים לב", "מה אתה אומר"], side: "start" },
  { photo: "static", sig: "static_sig", who: "סטטיק", lines: ["נוצר לשונו", "שומר נפשו"], side: "end" },
] as const;

const TILES = [
  { img: "cat_bracelets", label: "צמידים", collection: "bracelets" },
  { img: "cat_shirts", label: "חולצות", collection: "clothing" },
  { img: "cat_caps", label: "כובעים", collection: "clothing" },
  { img: "cat_sport", label: "ספורט", collection: "sport" },
  { img: "cat_mixed", label: "מיוחדים", collection: "special" },
] as const;

const HOLD_MS = 6500;

/** The two-line quotes, line by line. */
const QUOTE_EN: Record<string, string> = { "שים לב": "Watch", "מה אתה אומר": "what you say", "נוצר לשונו": "Guard your tongue,", "שומר נפשו": "guard your soul" };

function EN_QUOTE(line: string) {
  return siteLang() === "en" ? QUOTE_EN[line] : line;
}

function Hero() {
  const reduced = useRef(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [stopped, setStopped] = useState(reduced.current);
  const [held, setHeld] = useState(false);

  const go = useCallback((i: number) => {
    setCur((c) => {
      if (c !== i) setPrev(c);
      return i;
    });
  }, []);

  useEffect(() => {
    if (stopped || held) return;
    const timer = setTimeout(() => go((cur + 1) % SLIDES.length), HOLD_MS);
    return () => clearTimeout(timer);
  }, [cur, stopped, held, go]);

  useEffect(() => {
    if (prev === null) return;
    const timer = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(timer);
  }, [prev]);

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
          className={`slide side-${s.side}${i === cur ? " on" : ""}${i === prev ? " out" : ""}`}
          role="group"
          aria-roledescription={t("שקופית")}
          aria-label={t("{n} מתוך {total}: {who}", { n: i + 1, total: SLIDES.length, who: t(s.who) })}
          aria-hidden={i !== cur}
        >
          <div className="s-photo">
            <img src={`/images/site/${s.photo}.jpg`} alt={t("{who} בקפוצ׳ון של לשון הרע לא מדבר אליי", { who: t(s.who) })} />
          </div>
          <figure className="s-quote">
            <QuoteMark />
            <blockquote className="disp">
              {s.lines.map((line, k) => (
                <span key={line} className={`ql ql${k + 1}`}><span>{EN_QUOTE(line)}</span></span>
              ))}
            </blockquote>
            <figcaption><img className="sig" src={`/images/site/${s.sig}.jpg`} alt={t(s.who)} /></figcaption>
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

function ProductCard({ product, index }: { product: WcProduct; index: number }) {
  const quickAdd = useQuickAdd();
  const [state, setState] = useState<"idle" | "busy" | "added" | "failed">("idle");
  const to = `/shop/product/${product.id}`;

  async function add() {
    if (state === "busy") return;
    setState("busy");
    try {
      await quickAdd(product);
      setState("added");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <article className="pc rv" style={{ "--d": `${(index % 4) * 0.07}s` } as React.CSSProperties}>
      <Link className="pc-m" to={to} tabIndex={-1} aria-hidden="true"><ProductImage product={product} /></Link>
      {canQuickAdd(product) ? (
        <button className={`pc-add${state === "added" ? " ok" : state === "busy" ? " busy" : state === "failed" ? " bad" : ""}`} aria-busy={state === "busy"} onClick={add} aria-label={t("הוספה לסל: {name}", { name: product.name })}>
          <span>{state === "busy" ? <i className="pc-spin" aria-hidden="true" /> : null}{state === "busy" ? t("מוסיפים…") : state === "added" ? t("נוסף לסל") : state === "failed" ? t("לא הצלחנו, נסו שוב") : t("הוספה לסל")}</span>
        </button>
      ) : null}
      <Link className="pc-n" to={to} dir="auto">{product.name}</Link>
      <span className="pc-p">{priceLabel(product)}</span>
    </article>
  );
}

export function HomePage() {
  usePageTitle(t("דף הבית"));
  const latest = useQuery({
    queryKey: ["site-home-latest"],
    queryFn: () => fetchProducts("per_page=8&orderby=date&order=desc"),
  });

  return (
    <div className="page-home">
      <Hero />

      <section className="cats" aria-label={t("קטגוריות בחנות")}>
        {TILES.map((tile) => (
          <Link key={tile.img} className="cat" to={`/shop?collection=${tile.collection}`}>
            <img src={`/images/site/${tile.img}.jpg`} alt="" />
            <span className="sr">{t(tile.label)}</span>
          </Link>
        ))}
      </section>

      <section className="story">
        <div className="wrap story-in">
          <div className="story-ph rv"><img src="/images/site/founder.jpg" alt={t("מייסד המיזם")} /></div>
          <div className="story-tx rv" style={{ "--d": ".1s" } as React.CSSProperties}>
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
          <Title as="h2">{t("הקולקציה החדשה")}</Title>
          <div className="pgrid">
            {latest.isLoading ? <CardsSkeleton /> : null}
            {latest.data?.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
