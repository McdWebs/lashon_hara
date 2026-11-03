import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchProducts, type WcProduct } from "../lib/catalog";
import { t, Link, siteLang } from "./i18n";
import { Icon, ProductImage, priceLabel } from "./ui";

const STORAGE_KEY = "lh-recent-searches";
const MAX_RECENT = 5;

/** What people look for most, as the words the catalog is written in. The label is what the visitor reads. */
const POPULAR = ["צמיד", "חולצה", "קפוצ'ון", "כובע", "מדבקה", "מחזיק מפתחות", "כדורגל", "שלט"];
const POPULAR_EN: Record<string, string> = { "צמיד": "Bracelet", "חולצה": "T-shirt", "קפוצ'ון": "Hoodie", "כובע": "Cap", "מדבקה": "Sticker", "מחזיק מפתחות": "Keychain", "כדורגל": "Football", "שלט": "Sign" };

function readRecent(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* private mode: the list just won't be remembered */
  }
}

function useDebounced(value: string, ms: number) {
  const [out, setOut] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setOut(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return out;
}

/** The name with the searched part in bold. */
function Marked({ text, term }: { text: string; term: string }) {
  const at = term ? text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + term.length)}</mark>{text.slice(at + term.length)}</>;
}

type Row = { key: string; run: () => void };

/**
 * The panel under the shop search. With nothing typed it offers recent searches, popular words and recommended
 * products; while typing it shows matching products as you go. Arrow keys move through it, Enter picks, Escape closes.
 */
export function SearchSuggest({ draft, open, inline, inputRef, onFill, onCommit, onClose }: {
  draft: string;
  open: boolean;
  /** Sits in the flow of a modal instead of floating under a field. */
  inline?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** A word was tapped: put it in the field and keep the panel open on its results. */
  onFill: (term: string) => void;
  /** Run this search in the shop grid. */
  onCommit: (term: string) => void;
  onClose: () => void;
}) {
  const term = draft.trim();
  const live = useDebounced(term, 200);
  const typing = term.length >= 1;
  const [recent, setRecent] = useState<string[]>(readRecent);
  const [active, setActive] = useState(-1);

  // The newest products, the same ones the home page shows, so the picks are things people can actually buy.
  const popular = useQuery({
    queryKey: ["site-home-latest"],
    queryFn: () => fetchProducts("per_page=8&orderby=date&order=desc"),
    enabled: open,
    staleTime: 5 * 60_000,
    select: (page) => ({ ...page, items: page.items.slice(0, 4) }),
  });
  const results = useQuery({
    queryKey: ["suggest-results", live],
    queryFn: () => fetchProducts(new URLSearchParams({ search: live, per_page: "5" }).toString()),
    enabled: open && live.length >= 1,
    staleTime: 60_000,
  });

  const products: WcProduct[] = typing ? results.data?.items ?? [] : popular.data?.items ?? [];
  const total = results.data?.total ?? 0;
  const searching = typing && (results.isFetching || live !== term) && !results.data;

  function remember(word: string) {
    const clean = word.trim();
    if (!clean) return;
    const next = [clean, ...readRecent().filter((r) => r !== clean)].slice(0, MAX_RECENT);
    writeRecent(next);
    setRecent(next);
  }

  function forget(word: string) {
    const next = readRecent().filter((r) => r !== word);
    writeRecent(next);
    setRecent(next);
  }

  function fill(word: string) {
    onFill(word);
    inputRef.current?.focus({ preventScroll: true });
  }

  function choose(word: string) {
    remember(word);
    onCommit(word);
    onClose();
  }

  // Everything that can be picked, in the order it is drawn, so the arrow keys follow the eye.
  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];
    if (!typing) {
      for (const r of recent) list.push({ key: `r:${r}`, run: () => fill(r) });
      for (const p of POPULAR) list.push({ key: `p:${p}`, run: () => fill(p) });
    }
    for (const p of products) list.push({ key: `i:${p.id}`, run: () => { remember(term); onClose(); document.getElementById(`sg-${p.id}`)?.click(); } });
    if (typing && products.length > 0) list.push({ key: "all", run: () => choose(term) });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing, recent, products, term]);

  useEffect(() => setActive(-1), [term, open]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !open) return;
    function onKey(e: KeyboardEvent) {
      const list = rowsRef.current;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (list.length === 0) return;
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => {
          const next = i + step;
          if (next < -1) return list.length - 1;
          if (next >= list.length) return -1;
          return next;
        });
      } else if (e.key === "Enter") {
        const picked = list[activeRef.current];
        e.preventDefault();
        if (picked) picked.run();
        else if (term) choose(term);
        else onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    input.addEventListener("keydown", onKey);
    return () => input.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, inputRef, term]);

  useEffect(() => {
    if (active < 0) return;
    document.querySelector(`[data-sg-row="${rows[active]?.key}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, rows]);

  if (!open) return null;

  const isActive = (key: string) => rows[active]?.key === key;
  const chipLabel = (word: string) => siteLang() === "en" ? POPULAR_EN[word] ?? word : word;

  return (
    <div className={`sgp${inline ? " sg-inline" : ""}`} role="region" aria-label={t("הצעות חיפוש")} onMouseDown={(e) => e.preventDefault()}>
      {!typing ? (
        <>
          {recent.length > 0 ? (
            <section className="sg-s">
              <header>
                <h3>{t("חיפושים אחרונים")}</h3>
                <button type="button" className="sg-link" onClick={() => { writeRecent([]); setRecent([]); }}>{t("ניקוי")}</button>
              </header>
              <ul className="sg-recent">
                {recent.map((r) => (
                  <li key={r} data-sg-row={`r:${r}`} className={isActive(`r:${r}`) ? "on" : ""}>
                    <button type="button" className="sg-r" onClick={() => fill(r)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
                      <span>{r}</span>
                    </button>
                    <button type="button" className="sg-rx" aria-label={t("הסרה: {name}", { name: r })} onClick={() => forget(r)}><Icon.close /></button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="sg-s">
            <header><h3>{t("חיפושים פופולריים")}</h3></header>
            <div className="sg-chips">
              {POPULAR.map((p) => (
                <button key={p} type="button" data-sg-row={`p:${p}`} className={`sg-chip${isActive(`p:${p}`) ? " on" : ""}`} onClick={() => fill(p)}>{chipLabel(p)}</button>
              ))}
            </div>
          </section>

          <section className="sg-s">
            <header><h3>{t("מומלצים בשבילכם")}</h3></header>
            {popular.isLoading ? <Skeleton /> : <Products items={products} term="" isActive={isActive} onPick={() => { onClose(); }} />}
          </section>
        </>
      ) : (
        <section className="sg-s">
          {searching ? (
            <Skeleton />
          ) : products.length > 0 ? (
            <>
              <header><h3>{t("מוצרים")}</h3></header>
              <Products items={products} term={term} isActive={isActive} onPick={() => { remember(term); onClose(); }} />
              <button type="button" data-sg-row="all" className={`sg-all${isActive("all") ? " on" : ""}`} onClick={() => choose(term)}>
                <span>{t("לכל התוצאות ל־{q}", { q: term })}{total > products.length ? ` (${total})` : ""}</span>
                <Icon.arrow />
              </button>
            </>
          ) : (
            <div className="sg-none">
              <b>{t("לא מצאנו משהו שמתאים ל־{q}", { q: term })}</b>
              <p>{t("נסו מילה אחרת, או אחת מהאפשרויות האלה:")}</p>
              <div className="sg-chips">
                {POPULAR.slice(0, 5).map((p) => (
                  <button key={p} type="button" className="sg-chip" onClick={() => fill(p)}>{chipLabel(p)}</button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Products({ items, term, isActive, onPick }: { items: WcProduct[]; term: string; isActive: (key: string) => boolean; onPick: () => void }) {
  return (
    <ul className="sg-items">
      {items.map((p) => (
        <li key={p.id} data-sg-row={`i:${p.id}`} className={isActive(`i:${p.id}`) ? "on" : ""}>
          <Link id={`sg-${p.id}`} className="sg-i" to={`/shop/product/${p.id}`} onClick={onPick}>
            <span className="sg-m"><ProductImage product={p} /></span>
            <span className="sg-n" dir="auto"><Marked text={p.name} term={term} /></span>
            <span className="sg-p">{priceLabel(p)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Skeleton() {
  return (
    <ul className="sg-items" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="sg-i sg-sk"><span className="sg-m skel" /><span className="sg-n skel" style={{ height: 14 }} /></li>
      ))}
    </ul>
  );
}
