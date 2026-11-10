import { Drawer } from "@mui/material";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, Link, siteLang } from "../i18n";
import { fetchProducts } from "../../lib/catalog";
import { SORT_CATALOG, priceKey, priceLabel, priceQuery, useSiteConfig } from "../../lib/siteConfig";
import { copy } from "../copy";
import { Dropdown } from "../Dropdown";
import { ExpandingSearch, SearchIcon } from "../ExpandingSearch";
import { CardsSkeleton, Icon, ShopCard, usePageTitle } from "../ui";

const PER_PAGE = 12;


function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

export function CollectionPage() {
  usePageTitle(t("הקולקציה"));
  const { SHIPPING_NOTE, SHOP_INTRO } = copy();
  const introWhy = SHOP_INTRO.split("\n")[2];
  const [shipLead, shipRest] = SHIPPING_NOTE.replace(/,$/m, "").split("\n");
  const [params, setParams] = useSearchParams();

  // Tabs, sorts and price ranges come from the admin; until the team changes them the built-in ones apply.
  const { config, ready } = useSiteConfig();
  const lang = siteLang();
  const COLLECTIONS = config.shop.collections.map((c) => ({
    key: c.key,
    label: lang === "en" ? c.en : c.he,
    hidden: c.hidden,
    query: (c.categories.length ? { category: c.categories.join(",") } : {}) as Record<string, string>,
  }));
  const SORTS = config.shop.sorts.flatMap((key) => {
    const s = SORT_CATALOG.find((entry) => entry.key === key);
    return s ? [{ key, label: key === "" ? t("מיון: ברירת מחדל") : lang === "en" ? s.en : s.he, query: s.query }] : [];
  });
  const PRICES = [
    { key: "", label: t("מחיר: הכול"), query: {} as Record<string, string> },
    ...config.shop.prices.map((p) => ({ key: priceKey(p), label: priceLabel(p, lang), query: priceQuery(p) })),
  ];

  // Older links (?collection=new / best) were collections; they are sorts now.
  const legacySort = params.get("collection") === "new" ? "new" : params.get("collection") === "best" ? "best" : "";
  const active = COLLECTIONS.find((c) => c.key === params.get("collection")) ?? COLLECTIONS[0];
  const sort = SORTS.find((s) => s.key === (params.get("sort") ?? legacySort)) ?? SORTS[0];
  const price = PRICES.find((p) => p.key === params.get("price")) ?? PRICES[0];
  const q = (params.get("q") ?? "").trim();

  const [draft, setDraft] = useState(q);
  const [sheet, setSheet] = useState(false);
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

  /** A suggestion was picked: search for it at once instead of waiting for the typing pause. */
  function commitSearch(term: string) {
    typing.current = true;
    setDraft(term);
    update({ q: term.trim() }, true);
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
    queryKey: ["site-collection", active.key, active.query.category ?? "", sort.key, price.key, q],
    enabled: ready,
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
  const showSkeleton = !ready || query.isLoading || refreshing;
  const filtered = Boolean(q || price.key || sort.key || active.key !== "all");
  const narrowed = Boolean(q || price.key);

  function clearAll() {
    setDraft("");
    setParams({}, { preventScrollReset: true });
  }

  return (
    <div className="page-collection">
      <div className="shipstrip">
        <TruckIcon />
        <span>{shipLead} — <b>{shipRest}</b></span>
      </div>

      <section className="chero">
        <div className="wrap chero-in">
          <div className="chero-t">
            <div className="chero-row">
              <h1 className="chero-h">{t("הקולקציה")}</h1>
              <div className="chero-btns">
                <ExpandingSearch draft={draft} setDraft={setDraft} startOpen={q !== ""} rich={config.flags.newSearch} onCommit={commitSearch} />
                <button type="button" className="cbtn fill" aria-label={t("סינון ומיון")} onClick={() => setSheet(true)}>
                  <FilterIcon />
                  {price.key || sort.key ? <span className="cbtn-dot" aria-hidden="true" /> : null}
                </button>
              </div>
            </div>
            {config.flags.shopMission ? <p className="chero-p">{introWhy}</p> : null}
            {showSkeleton ? (
              <span className="skel cnt-skel" aria-hidden="true" />
            ) : (
              <span className="cnt" aria-live="polite">{total !== undefined ? t("{n} פריטים", { n: total }) : ""}</span>
            )}
          </div>
          <div className="chero-art" aria-hidden="true">
            <span><img src="/images/fabric_bracelet/all_bracelet.jpeg" alt="" width="204" height="255" /></span>
            <span><img src="/images/site/omer.jpg" alt="" width="204" height="255" /></span>
            <span><img src="/images/site/static.jpg" alt="" width="204" height="255" /></span>
          </div>
        </div>
      </section>

      <div className="ctools">
        <div className="wrap ctools-in">
          <div className="ctabs" role="group" aria-label={t("קולקציות")}>
            {!ready ? [0, 1, 2, 3].map((i) => <span key={i} className="skel ctab-skel" aria-hidden="true" />) : COLLECTIONS.filter((c) => !c.hidden || c.key === active.key).map((c) => (
              <button
                key={c.key}
                type="button"
                className={`ctab${active.key === c.key ? " on" : ""}`}
                aria-pressed={active.key === c.key}
                onClick={() => update({ collection: c.key === "all" ? "" : c.key })}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="cfind-g" role="search">
            {config.flags.newSearch ? (
              <ExpandingSearch draft={draft} setDraft={setDraft} startOpen={q !== ""} rich onCommit={commitSearch} />
            ) : (
              <label className="cfind">
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
                  <button type="button" className="cfind-x" aria-label={t("ניקוי החיפוש")} onClick={() => setDraft("")}><Icon.close /></button>
                ) : null}
              </label>
            )}
            <Dropdown
              label={t("סינון לפי מחיר")}
              text={price.key === "" ? t("מחיר") : price.label}
              value={price.key}
              active={price.key !== ""}
              options={PRICES.map((p) => ({ value: p.key, label: p.key === "" ? t("הכול") : p.label }))}
              onChange={(v) => update({ price: v })}
            />
            <Dropdown
              label={t("מיון")}
              text={sort.key === "" ? t("מיון") : sort.label}
              value={sort.key}
              active={sort.key !== ""}
              options={SORTS.map((s) => ({ value: s.key, label: s.key === "" ? t("ברירת מחדל") : s.label }))}
              onChange={(v) => update({ sort: v })}
            />
          </div>
        </div>
      </div>

      <div className="wrap shop">
        <div className="grid" aria-busy={query.isFetching}>
          {/* A new tab, sort, price or search shows placeholders at once instead of the old products fading. */}
          {showSkeleton ? <CardsSkeleton count={PER_PAGE} /> : items.map((p, i) => <ShopCard key={p.id} product={p} priority={i < 4} />)}
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
      </div>

      <Drawer
        anchor="bottom"
        open={sheet}
        onClose={() => setSheet(false)}
        disablePortal
        slotProps={{ paper: { className: "sheet-paper", role: "dialog", "aria-label": t("סינון ומיון") } }}
      >
        <span className="sheet-grip" aria-hidden="true" />
        <div className="sheet-h">
          <h2 className="disp">{t("סינון ומיון")}</h2>
          <button type="button" className="iconbtn" onClick={() => setSheet(false)} aria-label={t("סגירה")}><Icon.close /></button>
        </div>
        <fieldset className="sheet-f">
          <legend>{t("מיון")}</legend>
          {SORTS.map((s) => (
            <label className={`sopt${sort.key === s.key ? " on" : ""}`} key={s.key}>
              <input type="radio" name="sort" checked={sort.key === s.key} onChange={() => update({ sort: s.key })} />
              <span>{s.key === "" ? t("ברירת מחדל") : s.label}</span>
              <span className="sopt-r" aria-hidden="true" />
            </label>
          ))}
        </fieldset>
        <fieldset className="sheet-f">
          <legend>{t("מחיר")}</legend>
          <div className="sheet-p">
            {PRICES.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`chip${price.key === p.key ? " on" : ""}`}
                aria-pressed={price.key === p.key}
                onClick={() => update({ price: p.key })}
              >
                {p.key === "" ? t("הכול") : p.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="sheet-b">
          <button type="button" className="btn btn-red" onClick={() => setSheet(false)}><span>{t("הצגת התוצאות")}</span></button>
          <button type="button" className="tag-clear" onClick={() => update({ sort: "", price: "" })}>{t("איפוס")}</button>
        </div>
      </Drawer>

    </div>
  );
}
