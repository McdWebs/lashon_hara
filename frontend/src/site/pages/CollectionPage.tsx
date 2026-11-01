import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Panel } from "../forms";
import { fetchProducts } from "../../lib/catalog";
import { SHIPPING_NOTE, SHOP_INTRO } from "../about";
import { CardsSkeleton, Icon, ProductLinkCard, Title, usePageTitle } from "../ui";

const PER_PAGE = 12;

type Collection = { key: string; label: string; query: Record<string, string>; hidden?: boolean };

/** Smart collections. Woo category ids come from the live catalog. */
const COLLECTIONS: Collection[] = [
  { key: "all", label: "הכול", query: {} },
  { key: "new", label: "חדש", query: { orderby: "date", order: "desc" } },
  { key: "best", label: "הנמכרים ביותר", query: { orderby: "popularity" } },
  { key: "bracelets", label: "צמידים", query: { category: "20,35,135,166,282" } },
  { key: "clothing", label: "לבוש וספורט", query: { category: "146,19" } },
  { key: "kids", label: "ילדים ובית ספר", query: { category: "26" } },
  { key: "accessories", label: "אביזרים", query: { category: "48,29,31,18" } },
  // Reached from the home page tiles only.
  { key: "sport", label: "ספורט", query: { category: "19" }, hidden: true },
  { key: "special", label: "מיוחדים", query: { category: "23" }, hidden: true },
];

export function CollectionPage() {
  usePageTitle("הקולקציה");
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const active = COLLECTIONS.find((c) => c.key === params.get("collection")) ?? COLLECTIONS[0];

  const query = useInfiniteQuery({
    queryKey: ["site-collection", active.key],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchProducts(new URLSearchParams({ ...active.query, per_page: String(PER_PAGE), page: String(pageParam) }).toString()),
    getNextPageParam: (last, pages) => (pages.length < last.totalPages ? pages.length + 1 : undefined),
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;

  function pick(key: string) {
    setParams(key === "all" ? {} : { collection: key }, { preventScrollReset: true });
    setDrawer(false);
  }

  const list = (
    <div className="cols">
      {COLLECTIONS.filter((c) => !c.hidden).map((c) => (
        <button key={c.key} className={`col${active.key === c.key ? " on" : ""}`} aria-pressed={active.key === c.key} onClick={() => pick(c.key)}>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-collection">
      <section className="phead">
        <div className="wrap">
          <Title big lead={SHOP_INTRO}>הקולקציה</Title>
        </div>
      </section>

      <div className="wrap shop">
        <div className="shop-grid">
          <div>
            <div className="shop-top">
              <button className="btn btn-ink colbtn" onClick={() => setDrawer(true)}>
                <span>קולקציות</span>
                <span className="colbtn-v">{active.label}</span>
              </button>
              <p className="shipnote">{SHIPPING_NOTE}</p>
              <span className="cnt" aria-live="polite">{total !== undefined ? `${total} פריטים` : ""}</span>
            </div>

            <div className="grid">
              {query.isLoading ? <CardsSkeleton count={PER_PAGE} /> : null}
              {items.map((p) => <ProductLinkCard key={p.id} product={p} />)}
            </div>

            {query.isError ? (
              <div className="state" role="alert">
                <h2>לא הצלחנו לטעון את המוצרים.</h2>
                <button className="btn btn-line" onClick={() => query.refetch()}><span>נסו שוב</span></button>
              </div>
            ) : null}

            {query.isSuccess && items.length === 0 ? (
              <div className="empty">
                <span className="bar" aria-hidden="true" />
                <h2>אין עדיין פריטים בקולקציה הזאת.</h2>
                <Link className="btn btn-line" to="/shop"><span>לכל המוצרים</span><Icon.arrow /></Link>
              </div>
            ) : null}

            {query.hasNextPage ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
                <button className="btn btn-line" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
                  <span>{query.isFetchingNextPage ? "טוענים…" : "עוד מוצרים"}</span>
                </button>
              </div>
            ) : null}

            <div className="biz">
              <h2 className="biz-h">הזמנות לעסקים</h2>
              <Link className="bizl" to="/custom"><span><b>מוצרים לאירוע בהדפסה אישית</b><span>כיפה עם הלוגו והדפסה שתבחרו</span></span><Icon.ext /></Link>
            </div>
          </div>

          <aside className="side" aria-label="קולקציות">
            <span className="side-h">קולקציות</span>
            {list}
          </aside>
        </div>
      </div>

      <Panel open={drawer} onClose={() => setDrawer(false)} title="קולקציות">
        <div className="cols-m">{list}</div>
      </Panel>
    </div>
  );
}
