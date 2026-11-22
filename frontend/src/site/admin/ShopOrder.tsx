import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { adminConfig, adminShopOrder, type StoredConfig } from "../../lib/adminConfig";
import { decodeHtmlEntities } from "../../lib/html";
import { DEFAULT_SHOP } from "../../lib/siteConfig";
import { Card, ConfirmDialog, I, SaveBar, errorText, moveItem, useAdmin } from "./ui";

const PAGE = 60;

/** The order the shop shows a tab's products in by default. Pick a tab, then drag products or use the arrows. */
export function ShopOrder({ stored, onSaved, switcher }: { stored: StoredConfig; onSaved: () => void; switcher: ReactNode }) {
  const { toast, fail } = useAdmin();
  const collections = (stored.shop ?? DEFAULT_SHOP).collections;
  const savedOrders = useMemo(() => stored.productOrder?.orders ?? {}, [stored.productOrder]);
  const [active, setActive] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, number[]>>({});
  const [shown, setShown] = useState(PAGE);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const collection = collections.find((c) => c.key === active) ?? collections[0];
  const list = useQuery({
    queryKey: ["admin-shop-order", collection.key, collection.categories.join(","), JSON.stringify(savedOrders[collection.key] ?? [])],
    queryFn: () => adminShopOrder.get(collection.key, collection.categories),
    staleTime: 0,
  });

  const byId = useMemo(() => new Map((list.data?.items ?? []).map((p) => [p.id, p])), [list.data]);
  const ids = drafts[collection.key] ?? (list.data?.items ?? []).map((p) => p.id);
  const rows = ids.filter((id) => byId.has(id));
  const dirty = Object.keys(drafts).length > 0;

  const edit = (next: number[]) => setDrafts((d) => ({ ...d, [collection.key]: next }));
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    edit(next);
  };

  function choose(key: string) {
    setActive(key);
    setShown(PAGE);
  }

  async function save(orders: Record<string, number[]>) {
    setSaving(true);
    try {
      if (Object.keys(orders).length === 0) await adminConfig.reset("productOrder");
      else await adminConfig.save("productOrder", { orders });
      setDrafts({});
      toast("סדר המוצרים נשמר");
      onSaved();
    } catch (err) {
      fail(err);
    } finally {
      setSaving(false);
    }
  }

  const saveAll = () => void save({ ...savedOrders, ...drafts });
  function backToAuto() {
    setResetting(false);
    const rest = { ...savedOrders };
    delete rest[collection.key];
    const { [collection.key]: _gone, ...otherDrafts } = drafts;
    setDrafts(otherDrafts);
    void save({ ...rest, ...otherDrafts });
  }

  const custom = Boolean(savedOrders[collection.key]?.length);

  return (
    <>
      <Card
        title="סדר המוצרים בחנות"
        actions={<div className="adm-hact">{switcher}</div>}
      >
        <div className="adm-otabs" role="tablist" aria-label="לשונית בחנות">
          {collections.map((c) => (
            <button key={c.key} type="button" role="tab" aria-selected={c.key === collection.key} className={`adm-otab${c.key === collection.key ? " on" : ""}`} onClick={() => choose(c.key)}>
              {c.he}
              {savedOrders[c.key]?.length || drafts[c.key] ? <i aria-label="סדר מותאם" /> : null}
            </button>
          ))}
        </div>

        <div className="adm-ordbar">
          <span>{list.data ? `${rows.length} מוצרים` : ""}{custom || drafts[collection.key] ? " · סדר מותאם" : " · סדר אוטומטי (מהחדש לישן)"}</span>
          {custom ? <button type="button" className="adm-reset" onClick={() => setResetting(true)}>חזרה לסדר האוטומטי</button> : null}
        </div>

        {list.isError ? <p className="adm-err" role="alert">{errorText(list.error)}</p> : null}
        {list.isLoading ? (
          <ul className="adm-rows flat adm-plist" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="adm-prow" aria-hidden="true">
                <span className="adm-sk adm-sk-img" />
                <div className="adm-pinfo"><span className="adm-sk adm-sk-line" style={{ width: `${70 - (i % 3) * 14}%` }} /><span className="adm-sk adm-sk-line short" /></div>
              </li>
            ))}
          </ul>
        ) : null}

        <ol className="adm-rows flat adm-plist adm-ord">
          {rows.slice(0, shown).map((id, i) => {
            const p = byId.get(id)!;
            return (
              <li
                key={id}
                className={`adm-prow adm-orow${dragging === id ? " drag" : ""}${over === i && dragging !== id ? " over" : ""}`}
                draggable
                onDragStart={(e) => { setDragging(id); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => { e.preventDefault(); setOver(i); }}
                onDragLeave={() => setOver((o) => (o === i ? null : o))}
                onDrop={(e) => { e.preventDefault(); if (dragging !== null) move(rows.indexOf(dragging), i); setDragging(null); setOver(null); }}
                onDragEnd={() => { setDragging(null); setOver(null); }}
              >
                <span className="adm-grip" aria-hidden="true">{I.grip()}</span>
                <span className="adm-pos">{i + 1}</span>
                {p.image ? <img src={p.image} alt="" loading="lazy" draggable={false} /> : <span className="adm-pnoimg" aria-hidden="true">{I.image()}</span>}
                <div className="adm-pinfo">
                  <span className="adm-pname" dir="auto">{decodeHtmlEntities(p.name)}</span>
                  <small>{p.price ? `₪${p.price}` : "ללא מחיר"}</small>
                </div>
                <span className="adm-acc-a">
                  <button type="button" className="adm-btn ghost small adm-top" disabled={i === 0} onClick={() => move(i, 0)}>לראש</button>
                  <button type="button" className="adm-ib" disabled={i === 0} onClick={() => edit(moveItem(rows, i, -1))} aria-label="להקדים">{I.up()}</button>
                  <button type="button" className="adm-ib" disabled={i === rows.length - 1} onClick={() => edit(moveItem(rows, i, 1))} aria-label="לאחר">{I.down()}</button>
                </span>
              </li>
            );
          })}
        </ol>
        {rows.length > shown ? <button type="button" className="adm-btn ghost add" onClick={() => setShown((n) => n + PAGE)}>הצגת עוד ({rows.length - shown})</button> : null}
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={saveAll} onDiscard={() => setDrafts({})} />
      {resetting ? (
        <ConfirmDialog title="לחזור לסדר האוטומטי?" text={`בלשונית "${collection.he}" המוצרים יוצגו שוב מהחדש לישן.`} confirmLabel="חזרה" onConfirm={backToAuto} onCancel={() => setResetting(false)} />
      ) : null}
    </>
  );
}
