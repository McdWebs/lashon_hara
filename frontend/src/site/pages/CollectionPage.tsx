import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, Link } from "../i18n";
import { fetchProducts } from "../../lib/catalog";
import { copy } from "../copy";
import { CardsSkeleton, Icon, ProductLinkCard, Title, usePageTitle } from "../ui";

const PER_PAGE = 12;

type Collection = { key: string; label: string; query: Record<string, string>; hidden?: boolean };

/** Woo category ids come from the live catalog. */
const COLLECTIONS: Collection[] = [
  { key: "all", label: "הכול", query: {} },
  { key: "bracelets", label: "צמידים", query: { category: "20,166,282" } },
  { key: "metal-fabric", label: "צמידי מתכת ובד", query: { category: "35,135" } },
  { key: "clothing", label: "לבוש וספורט", query: { category: "146,19" } },
  { key: "kids", label: "ילדים ובית ספר", query: { category: "26" } },
  { key: "accessories", label: "אביזרים", query: { category: "48,29,31,18" } },
  // Reached from the home page tiles only.
  { key: "sport", label: "ספורט", query: { category: "19" }, hidden: true },
  { key: "special", label: "מיוחדים", query: { category: "23" }, hidden: true },
];

const SORTS: Array<{ key: string; label: string; query: Record<string, string> }> = [
  { key: "", label: "מיון: ברירת מחדל", query: {} },
  { key: "new", label: "החדשים ביותר", query: { orderby: "date", order: "desc" } },
  { key: "best", label: "הנמכרים ביותר", query: { orderby: "popularity" } },
  { key: "price-asc", label: "מחיר: מהנמוך לגבוה", query: { orderby: "price", order: "asc" } },
  { key: "price-desc", label: "מחיר: מהגבוה לנמוך", query: { orderby: "price", order: "desc" } },
  { key: "title", label: "לפי שם (א–ת)", query: { orderby: "title", order: "asc" } },
];

/** The store takes prices in agorot. */
const PRICES: Array<{ key: string; label: string; query: Record<string, string> }> = [
  { key: "", label: "מחיר: הכול", query: {} },
  { key: "0-50", label: "עד ₪50", query: { max_price: "5000" } },
  { key: "50-100", label: "₪50 – ₪100", query: { min_price: "5001", max_price: "10000" } },
  { key: "100-200", label: "₪100 – ₪200", query: { min_price: "10001", max_price: "20000" } },
  { key: "200", label: "מעל ₪200", query: { min_price: "20001" } },
];

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function CollectionPage() {
  usePageTitle(t("הקולקציה"));
  const { SHIPPING_NOTE, SHOP_INTRO } = copy();
  const [introHi, introBrand, introWhy] = SHOP_INTRO.split("\n").map((line) => line.replace(/"/g, ""));
  const [params, setParams] = useSearchParams();

  // Older links (?collection=new / best) were collections; they are sorts now.
  const legacySort = params.get("collection") === "new" ? "new" : params.get("collection") === "best" ? "best" : "";
  const active = COLLECTIONS.find((c) => c.key === params.get("collection")) ?? COLLECTIONS[0];
  const sort = SORTS.find((s) => s.key === (params.get("sort") ?? legacySort)) ?? SORTS[0];
  const price = PRICES.find((p) => p.key === params.get("price")) ?? PRICES[0];
  const q = (params.get("q") ?? "").trim();

  const [draft, setDraft] = useState(q);
  const typing = useRef(false);

  function update(next: Record<string, string>, replace = false) {
    const merged = new URLSearchParams(params);
    if (merged.get("collection") === "new" || merged.get("collection") === "best") merged.delete("collection");
    for (const [k, v] of Object.entries(next)) {
      if (v) merged.set(k, v);
      else merged.delete(k);
    }
    setParams(merged, { replace, preventScrollReset: true });
  }

  // Search as you type, without a request per keystroke.
  useEffect(() => {
    if (draft.trim() === q) return;
    typing.current = true;
    const id = window.setTimeout(() => update({ q: draft.trim() }, true), 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // Follow the address bar when something else changes it (reset, back button).
  useEffect(() => {
    if (!typing.current) setDraft(q);
    typing.current = false;
  }, [q]);

  const query = useInfiniteQuery({
    queryKey: ["site-collection", active.key, sort.key, price.key, q],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) =>
      fetchProducts(
        new URLSearchParams({
          ...active.query,
          ...sort.query,
          ...price.query,
          ...(q ? { search: q } : {}),
          per_page: String(PER_PAGE),
          page: String(pageParam),
        }).toString(),
      ),
    getNextPageParam: (last, pages) => (pages.length < last.totalPages ? pages.length + 1 : undefined),
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;
  const refreshing = query.isPlaceholderData;
  const showSkeleton = query.isLoading || refreshing;
  const filtered = Boolean(q || price.key || sort.key || active.key !== "all");
  const narrowed = Boolean(q || price.key);

  function clearAll() {
    setDraft("");
    setParams({}, { preventScrollReset: true });
  }

  return (
    <div className="page-collection">
      <section className="phead">
        <div className="wrap">
          <Title big>{t("הקולקציה")}</Title>
          <div className="intro rv">
            <span className="intro-hi">{introHi}</span>
            <span className="intro-brand">{introBrand}</span>
            <p className="intro-why">{introWhy}</p>
          </div>
        </div>
      </section>

      <div className="tools" role="search">
        <div className="wrap tools-in">
          <label className="tsearch">
            <SearchIcon />
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("חיפוש מוצר…")}
              aria-label={t("חיפוש מוצר")}
              enterKeyHint="search"
            />
            {draft ? (
              <button type="button" className="tclear" aria-label={t("ניקוי החיפוש")} onClick={() => setDraft("")}>
                <Icon.close />
              </button>
            ) : null}
          </label>

          <div className="chips" role="group" aria-label={t("קולקציות")}>
            {COLLECTIONS.filter((c) => !c.hidden || c.key === active.key).map((c) => (
              <button
                key={c.key}
                type="button"
                className={`chip${active.key === c.key ? " on" : ""}`}
                aria-pressed={active.key === c.key}
                onClick={() => update({ collection: c.key === "all" ? "" : c.key })}
              >
                {t(c.label)}
              </button>
            ))}
          </div>

          <div className="tsel">
            <select value={price.key} onChange={(e) => update({ price: e.target.value })} aria-label={t("סינון לפי מחיר")}>
              {PRICES.map((p) => <option key={p.key} value={p.key}>{t(p.label)}</option>)}
            </select>
            <select value={sort.key} onChange={(e) => update({ sort: e.target.value })} aria-label={t("מיון")}>
              {SORTS.map((s) => <option key={s.key} value={s.key}>{t(s.label)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="wrap shop">
        <div className="shop-top">
          <div className="meta">
            {showSkeleton ? (
              <span className="skel cnt-skel" aria-hidden="true" />
            ) : (
              <span className="cnt" aria-live="polite">{total !== undefined ? t("{n} פריטים", { n: total }) : ""}</span>
            )}
            {q ? (
              <button type="button" className="tag" onClick={() => setDraft("")}>
                <span>“{q}”</span><Icon.close />
              </button>
            ) : null}
            {price.key ? (
              <button type="button" className="tag" onClick={() => update({ price: "" })}>
                <span>{t(price.label)}</span><Icon.close />
              </button>
            ) : null}
            {filtered ? <button type="button" className="tag-clear" onClick={clearAll}>{t("איפוס הכול")}</button> : null}
          </div>
          <p className="shipnote">{SHIPPING_NOTE}</p>
        </div>

        <div className="grid" aria-busy={query.isFetching}>
          {/* A new tab, sort, price or search shows placeholders at once instead of the old products fading. */}
          {showSkeleton ? <CardsSkeleton count={PER_PAGE} /> : items.map((p) => <ProductLinkCard key={p.id} product={p} />)}
          {query.isFetchingNextPage ? <CardsSkeleton count={4} /> : null}
        </div>

        {query.isError ? (
          <div className="state" role="alert">
            <h2>{t("לא הצלחנו לטעון את המוצרים.")}</h2>
            <button className="btn btn-line" onClick={() => query.refetch()}><span>{t("נסו שוב")}</span></button>
          </div>
        ) : null}

        {query.isSuccess && !refreshing && items.length === 0 ? (
          <div className="empty">
            <span className="bar" aria-hidden="true" />
            <h2>{q ? t("לא מצאנו תוצאות עבור “{q}”.", { q }) : t("אין עדיין פריטים בקולקציה הזאת.")}</h2>
            {narrowed ? <p>{t("נסו מילה אחרת, או הסירו את הסינון.")}</p> : null}
            {filtered ? (
              <button className="btn btn-line" onClick={clearAll}><span>{t("לכל המוצרים")}</span><Icon.arrow /></button>
            ) : (
              <Link className="btn btn-line" to="/shop"><span>{t("לכל המוצרים")}</span><Icon.arrow /></Link>
            )}
          </div>
        ) : null}

        {query.hasNextPage ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
            <button className="btn btn-line" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
              <span>{query.isFetchingNextPage ? t("טוענים…") : t("עוד מוצרים")}</span>
            </button>
          </div>
        ) : null}

        <div className="biz">
          <h2 className="biz-h">{t("הזמנות לעסקים")}</h2>
          <Link className="bizl" to="/custom"><span><b>{t("מוצרים לאירוע בהדפסה אישית")}</b><span>{t("כיפה עם הלוגו והדפסה שתבחרו")}</span></span><Icon.ext /></Link>
        </div>
      </div>
    </div>
  );
}
