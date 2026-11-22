import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminProducts, type AdminProduct } from "../../lib/adminConfig";
import { decodeHtmlEntities } from "../../lib/html";
import { I, errorText } from "./ui";

/** Pick products from the store (published ones only). Reports each pick with what is needed to show it. */
export function ProductPicker({ selected, max, onChange, onClose }: { selected: number[]; max: number; onChange: (ids: number[], products: AdminProduct[]) => void; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [known, setKnown] = useState<Map<number, AdminProduct>>(new Map());

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(input.trim()), 350);
    return () => window.clearTimeout(t);
  }, [input]);

  const list = useInfiniteQuery({
    queryKey: ["admin-product-picker", search],
    queryFn: ({ pageParam }) => adminProducts.list({ search, status: "publish", page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (pages.length < last.totalPages ? pages.length + 1 : undefined),
  });
  const items = (list.data?.pages.flatMap((p) => p.items) ?? []).filter((p) => p.onSite);
  const full = selected.length >= max;

  function toggle(p: AdminProduct) {
    const on = selected.includes(p.id);
    if (!on && full) return;
    const next = new Map(known).set(p.id, p);
    setKnown(next);
    const ids = on ? selected.filter((id) => id !== p.id) : [...selected, p.id];
    onChange(ids, ids.map((id) => next.get(id)).filter((x): x is AdminProduct => Boolean(x)));
  }

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="בחירת מוצרים" onClick={onClose} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="adm-card adm-picker adm-picker-p" onClick={(e) => e.stopPropagation()}>
        <div className="adm-picker-h">
          <h2>בחירת מוצרים</h2>
          <button type="button" className="adm-ib" onClick={onClose} aria-label="סגירה">{I.close()}</button>
        </div>
        <input className="adm-in" type="search" placeholder="חיפוש מוצר…" value={input} onChange={(e) => setInput(e.target.value)} aria-label="חיפוש מוצר" autoFocus />
        {list.isError ? <p className="adm-err" role="alert">{errorText(list.error)}</p> : null}
        <ul className="adm-picker-l">
          {list.isLoading ? Array.from({ length: 6 }, (_, i) => (
            <li key={i} aria-hidden="true"><span className="adm-sk adm-sk-line" style={{ margin: "14px 4px" }} /></li>
          )) : null}
          {items.map((p) => {
            const on = selected.includes(p.id);
            return (
              <li key={p.id}>
                <label className={on ? "on" : ""} aria-disabled={!on && full}>
                  <input type="checkbox" checked={on} disabled={!on && full} onChange={() => toggle(p)} />
                  <span className="adm-cb" aria-hidden="true">{I.check()}</span>
                  {p.images[0] ? <img className="adm-picker-img" src={p.images[0].src} alt="" loading="lazy" /> : <span className="adm-picker-img" aria-hidden="true" />}
                  <span className="adm-picker-n" dir="auto">{decodeHtmlEntities(p.name)}</span>
                </label>
              </li>
            );
          })}
          {list.data && items.length === 0 ? <li className="adm-hint">לא נמצאו מוצרים.</li> : null}
          {list.hasNextPage ? (
            <li className="adm-picker-more"><button type="button" className="adm-btn ghost small" onClick={() => void list.fetchNextPage()} disabled={list.isFetchingNextPage}>{list.isFetchingNextPage ? "טוענים…" : "עוד מוצרים"}</button></li>
          ) : null}
        </ul>
        <button type="button" className="adm-btn primary" onClick={onClose}>סיום ({selected.length} מתוך {max})</button>
      </div>
    </div>
  );
}
