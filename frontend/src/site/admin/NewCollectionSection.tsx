import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminConfig, type AdminProduct, type StoredConfig } from "../../lib/adminConfig";
import { fetchProductsByIds } from "../../lib/catalog";
import { decodeHtmlEntities } from "../../lib/html";
import { DEFAULT_NEW_COLLECTION, DEFAULT_SHOP, type NewCollectionConfig } from "../../lib/siteConfig";
import { ProductPicker } from "./ProductPicker";
import { Card, ConfirmDialog, I, SaveBar, SectionHead, errorText, moveItem, same, useAdmin } from "./ui";

const MAX = 8;

/** The block on the home page that shows the new products: its title, and which products it shows. */
export function NewCollectionSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.newCollection);
  const saved: NewCollectionConfig = { ...(stored?.newCollection ?? DEFAULT_NEW_COLLECTION), products: stored?.newCollection?.products ?? [] };
  const [draft, setDraft] = useState<NewCollectionConfig>(saved);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  /** What was just picked, so a row can show its name before the saved list has been read back. */
  const [fresh, setFresh] = useState<Map<number, AdminProduct>>(new Map());

  const ids = draft.products ?? [];
  const current = useQuery({ queryKey: ["admin-nc-products", saved.products?.join(",")], queryFn: () => fetchProductsByIds(saved.products ?? []), enabled: (saved.products ?? []).length > 0, staleTime: 60_000 });
  const info = (id: number) => {
    const f = fresh.get(id);
    if (f) return { name: f.name, img: f.images[0]?.src };
    const c = current.data?.items.find((p) => p.id === id);
    return c ? { name: c.name, img: c.images[0]?.src } : { name: `מוצר ${id}`, img: undefined };
  };

  const collections = (stored?.shop ?? DEFAULT_SHOP).collections.filter((c) => c.key !== "all");
  const dirty = !same(draft, saved);
  const valid = draft.he.trim() !== "" && draft.en.trim() !== "";

  async function save() {
    setError("");
    setSaving(true);
    try {
      const { products, ...rest } = draft;
      await adminConfig.save("newCollection", { ...rest, he: draft.he.trim(), en: draft.en.trim(), ...(products && products.length ? { products } : {}) });
      toast("הקולקציה החדשה נשמרה");
      onSaved();
    } catch (err) {
      fail(err);
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setResetting(false);
    try {
      await adminConfig.reset("newCollection");
      setDraft({ ...DEFAULT_NEW_COLLECTION, products: [] });
      toast("חזרנו להגדרה המקורית");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="adm-section">
      <SectionHead title="הקולקציה החדשה" text="הבלוק שמופיע בעמוד הבית עם המוצרים החדשים: אפשר לשנות את הכותרת ולבחור אילו מוצרים יוצגו בו." onReset={custom ? () => setResetting(true) : undefined} resetText="חזרה להגדרה המקורית" />

      <Card title="הכותרת">
        <div className="adm-field">
          <label htmlFor="nc-he">בעברית</label>
          <input id="nc-he" className="adm-in" value={draft.he} maxLength={60} onChange={(e) => setDraft({ ...draft, he: e.target.value })} />
        </div>
        <div className="adm-field">
          <label htmlFor="nc-en">באנגלית</label>
          <input id="nc-en" className="adm-in" dir="ltr" value={draft.en} maxLength={60} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />
        </div>
      </Card>

      <Card title="אילו מוצרים מוצגים" hint="עד שמונה מוצרים. אפשר לבחור אותם בעצמכם, או להשאיר את זה אוטומטי לפי קטגוריה.">
        <div className="adm-field">
          <label>מוצרים שנבחרו</label>
          {ids.length ? (
            <ol className="adm-rows flat adm-plist">
              {ids.map((id, i) => {
                const m = info(id);
                return (
                  <li key={id} className="adm-prow">
                    {m.img ? <img src={m.img} alt="" loading="lazy" /> : <span className="adm-pnoimg" aria-hidden="true">{I.image()}</span>}
                    <div className="adm-pinfo"><span className="adm-pname" dir="auto">{decodeHtmlEntities(m.name)}</span></div>
                    <span className="adm-acc-a">
                      <button type="button" className="adm-ib" disabled={i === 0} onClick={() => setDraft((d) => ({ ...d, products: moveItem(ids, i, -1) }))} aria-label="להקדים">{I.up()}</button>
                      <button type="button" className="adm-ib" disabled={i === ids.length - 1} onClick={() => setDraft((d) => ({ ...d, products: moveItem(ids, i, 1) }))} aria-label="לאחר">{I.down()}</button>
                      <button type="button" className="adm-ib danger" onClick={() => setDraft((d) => ({ ...d, products: ids.filter((x) => x !== id) }))} aria-label="הסרה">{I.close()}</button>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : <p className="adm-hint">לא נבחרו מוצרים, אז מוצגים אוטומטית לפי הקטגוריה למטה.</p>}
          <button type="button" className="adm-btn ghost add" onClick={() => setPicking(true)}>{I.plus()}<span>{ids.length ? "עריכת הבחירה" : "בחירת מוצרים"}</span></button>
        </div>

        <div className="adm-field">
          <label htmlFor="nc-src">אוטומטי: לפי קטגוריה</label>
          <select id="nc-src" className="adm-in" value={draft.source} disabled={ids.length > 0} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
            <option value="">המוצרים החדשים ביותר בחנות</option>
            {collections.map((c) => <option key={c.key} value={c.key}>{c.he}</option>)}
          </select>
          {ids.length ? <small>כשנבחרו מוצרים, הקטגוריה לא בשימוש. הסירו את כולם כדי לחזור למצב אוטומטי.</small> : <small>שמונה המוצרים החדשים ביותר, מהחדש לישן.</small>}
        </div>
        {error ? <p className="adm-err" role="alert">{error}</p> : null}
      </Card>

      <SaveBar dirty={dirty && valid} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setError(""); }} />
      {picking ? (
        <ProductPicker
          selected={ids}
          max={MAX}
          onChange={(next, products) => { setDraft((d) => ({ ...d, products: next })); setFresh((m) => { const n = new Map(m); products.forEach((p) => n.set(p.id, p)); return n; }); }}
          onClose={() => setPicking(false)}
        />
      ) : null}
      {resetting ? <ConfirmDialog title="לחזור להגדרה המקורית?" text="הכותרת והקטגוריה יחזרו למה שהיה באתר מההתחלה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
