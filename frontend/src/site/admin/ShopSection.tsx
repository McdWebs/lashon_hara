import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { fetchCategories, type WcCategory } from "../../lib/catalog";
import { DEFAULT_SHOP, SORT_CATALOG, priceLabel, type PriceRange, type ShopCollection, type ShopConfig } from "../../lib/siteConfig";
import { Card, ConfirmDialog, I, SaveBar, SectionHead, Switch, errorText, moveItem, same, useAdmin } from "./ui";

/** The home page tiles open these tabs, so they can be edited but not removed. */
const LINKED_FROM_HOME = new Set(["bracelets", "clothing", "sport", "special"]);

const newKey = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;

function CategoryPicker({ selected, onChange, onClose, categories }: { selected: number[]; onChange: (ids: number[]) => void; onClose: () => void; categories: WcCategory[] }) {
  const [search, setSearch] = useState("");
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.id) === q).sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [categories, search]);

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="בחירת קטגוריות" onClick={onClose}>
      <div className="adm-card adm-picker" onClick={(e) => e.stopPropagation()}>
        <div className="adm-picker-h">
          <h2>בחירת קטגוריות</h2>
          <button type="button" className="adm-ib" onClick={onClose} aria-label="סגירה">{I.close()}</button>
        </div>
        <input className="adm-in" type="search" placeholder="חיפוש קטגוריה…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="חיפוש קטגוריה" autoFocus />
        <ul className="adm-picker-l">
          {shown.map((c) => {
            const on = selected.includes(c.id);
            return (
              <li key={c.id}>
                <label className={on ? "on" : ""}>
                  <input type="checkbox" checked={on} onChange={() => onChange(on ? selected.filter((id) => id !== c.id) : [...selected, c.id])} />
                  <span className="adm-cb" aria-hidden="true">{I.check()}</span>
                  <span className="adm-picker-n" dir="auto">{c.name}</span>
                  <small>{c.count} מוצרים</small>
                </label>
              </li>
            );
          })}
          {shown.length === 0 ? <li className="adm-hint">לא נמצאו קטגוריות.</li> : null}
        </ul>
        <button type="button" className="adm-btn primary" onClick={onClose}>סיום ({selected.length} נבחרו)</button>
      </div>
    </div>
  );
}

export function ShopSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.shop);
  const saved: ShopConfig = stored?.shop ?? DEFAULT_SHOP;
  const [draft, setDraft] = useState<ShopConfig>(saved);
  const [picking, setPicking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ShopCollection | null>(null);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories, staleTime: 5 * 60_000 });
  const names = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c.name])), [categories.data]);
  const dirty = !same(draft, saved);

  const setCollection = (key: string, patch: Partial<ShopCollection>) =>
    setDraft((d) => ({ ...d, collections: d.collections.map((c) => (c.key === key ? { ...c, ...patch } : c)) }));
  const setPrice = (index: number, patch: Partial<PriceRange>) =>
    setDraft((d) => ({ ...d, prices: d.prices.map((p, i) => (i === index ? { ...p, ...patch } : p)) }));

  /* sorts: the default stays first and always shown; the rest can be hidden or moved */
  const sortOrder = [...draft.sorts, ...SORT_CATALOG.map((s) => s.key).filter((k) => !draft.sorts.includes(k))];
  function toggleSort(key: string, on: boolean) {
    setDraft((d) => ({ ...d, sorts: on ? [...d.sorts, key] : d.sorts.filter((k) => k !== key) }));
  }
  function moveSort(key: string, by: number) {
    const shownOrder = draft.sorts;
    const i = shownOrder.indexOf(key);
    if (i < 1) return;
    const next = moveItem(shownOrder, i, by);
    if (next.indexOf("") !== 0) return;
    setDraft((d) => ({ ...d, sorts: next }));
  }

  function numberOrUndefined(text: string) {
    const clean = text.replace(/[^\d]/g, "");
    return clean === "" ? undefined : Number(clean);
  }

  async function save() {
    const problems: string[] = [];
    draft.collections.forEach((c) => {
      if (!c.he.trim() || !c.en.trim()) problems.push("לכל לשונית צריך שם בעברית ובאנגלית.");
      if (c.key !== "all" && c.categories.length === 0) problems.push(`ללשונית "${c.he || c.key}" לא נבחרו קטגוריות.`);
    });
    draft.prices.forEach((p) => {
      if (p.min === undefined && p.max === undefined) problems.push("בטווח מחירים צריך למלא לפחות ערך אחד.");
      if (p.min !== undefined && p.max !== undefined && p.min >= p.max) problems.push("בטווח מחירים, הערך הנמוך צריך להיות קטן מהגבוה.");
    });
    if (problems.length) {
      setError([...new Set(problems)].join(" "));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("shop", {
        collections: draft.collections.map((c) => ({ key: c.key, he: c.he.trim(), en: c.en.trim(), categories: c.categories, ...(c.hidden ? { hidden: true } : {}) })),
        sorts: draft.sorts,
        prices: draft.prices,
      });
      toast("הגדרות החנות נשמרו");
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
      await adminConfig.reset("shop");
      setDraft(DEFAULT_SHOP);
      toast("חזרנו להגדרות המקוריות");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  const pickingFor = draft.collections.find((c) => c.key === picking);

  return (
    <div className="adm-section">
      <SectionHead
        title="חנות: לשוניות, מיון ומחיר"
        text="מה מופיע בשורת הלשוניות של הקולקציה, איזו אפשרויות מיון יש, ואילו טווחי מחיר."
        onReset={custom ? () => setResetting(true) : undefined}
      />

      <Card title="לשוניות" hint="כל לשונית מציגה מוצרים מקטגוריות אחת או יותר בחנות. לשונית שאינה מוצגת בשורה עדיין נפתחת מקישור, למשל מאריחי עמוד הבית.">
        <ol className="adm-rows">
          {draft.collections.map((c, i) => {
            const isAll = c.key === "all";
            const linked = LINKED_FROM_HOME.has(c.key);
            return (
              <li key={c.key} className="adm-row-i">
                <div className="adm-row-top">
                  <span className="adm-no2">{i + 1}</span>
                  <div className="adm-pair">
                    <div className="adm-field">
                      <label htmlFor={`he-${c.key}`}>שם בעברית</label>
                      <input id={`he-${c.key}`} className="adm-in" value={c.he} maxLength={40} onChange={(e) => setCollection(c.key, { he: e.target.value })} />
                    </div>
                    <div className="adm-field">
                      <label htmlFor={`en-${c.key}`}>Name in English</label>
                      <input id={`en-${c.key}`} className="adm-in" dir="ltr" value={c.en} maxLength={40} onChange={(e) => setCollection(c.key, { en: e.target.value })} />
                    </div>
                  </div>
                  <span className="adm-acc-a">
                    <button type="button" className="adm-ib" disabled={i <= 1 || isAll} onClick={() => setDraft((d) => ({ ...d, collections: moveItem(d.collections, i, -1) }))} aria-label="להקדים">{I.up()}</button>
                    <button type="button" className="adm-ib" disabled={isAll || i === draft.collections.length - 1} onClick={() => setDraft((d) => ({ ...d, collections: moveItem(d.collections, i, 1) }))} aria-label="לאחר">{I.down()}</button>
                    <button type="button" className="adm-ib danger" disabled={isAll || linked} title={linked ? "אריחי עמוד הבית מקשרים ללשונית הזאת" : undefined} onClick={() => setDeleting(c)} aria-label="מחיקת הלשונית">{I.trash()}</button>
                  </span>
                </div>

                <div className="adm-row-b">
                  {isAll ? (
                    <p className="adm-hint">מציגה את כל המוצרים. הלשונית הראשונה, תמיד מוצגת.</p>
                  ) : (
                    <>
                      <div className="adm-cats">
                        {c.categories.map((id) => <span key={id} className="adm-tagc" dir="auto">{names.get(id) ?? `קטגוריה ${id}`}</span>)}
                        {c.categories.length === 0 ? <span className="adm-warn-t">לא נבחרו קטגוריות</span> : null}
                        <button type="button" className="adm-btn ghost small" onClick={() => setPicking(c.key)}>{I.plus()}<span>בחירת קטגוריות</span></button>
                      </div>
                      <Switch on={!c.hidden} onChange={(on) => setCollection(c.key, { hidden: !on })} label="מוצגת בשורת הלשוניות" />
                      {linked ? <small className="adm-hint">מקושרת מעמוד הבית.</small> : null}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className="adm-btn ghost add"
          onClick={() => setDraft((d) => ({ ...d, collections: [...d.collections, { key: newKey(), he: "", en: "", categories: [] }] }))}
        >{I.plus()}<span>הוספת לשונית</span></button>
      </Card>

      <Card title="אפשרויות מיון" hint="מה אפשר לבחור ברשימת המיון. ברירת המחדל תמיד ראשונה.">
        <ul className="adm-rows flat">
          {sortOrder.map((key) => {
            const s = SORT_CATALOG.find((x) => x.key === key)!;
            const shown = draft.sorts.includes(key);
            const i = draft.sorts.indexOf(key);
            return (
              <li key={key} className="adm-sortrow">
                <Switch on={shown} onChange={(on) => toggleSort(key, on)} label={s.he} />
                <small dir="ltr">{s.en}</small>
                {key === "" ? <small className="adm-hint">תמיד מוצגת</small> : (
                  <span className="adm-acc-a">
                    <button type="button" className="adm-ib" disabled={!shown || i <= 1} onClick={() => moveSort(key, -1)} aria-label="להקדים">{I.up()}</button>
                    <button type="button" className="adm-ib" disabled={!shown || i === draft.sorts.length - 1} onClick={() => moveSort(key, 1)} aria-label="לאחר">{I.down()}</button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="טווחי מחיר" hint="הטווחים ברשימת סינון המחיר, בשקלים. משאירים ריק בצד אחד כדי לקבל ״עד״ או ״מעל״.">
        <ul className="adm-rows flat">
          {draft.prices.map((p, i) => (
            <li key={i} className="adm-pricerow">
              <div className="adm-field narrow">
                <label htmlFor={`pmin-${i}`}>מ-₪</label>
                <input id={`pmin-${i}`} className="adm-in" inputMode="numeric" dir="ltr" value={p.min ?? ""} placeholder="ללא" onChange={(e) => setPrice(i, { min: numberOrUndefined(e.target.value) })} />
              </div>
              <div className="adm-field narrow">
                <label htmlFor={`pmax-${i}`}>עד-₪</label>
                <input id={`pmax-${i}`} className="adm-in" inputMode="numeric" dir="ltr" value={p.max ?? ""} placeholder="ללא" onChange={(e) => setPrice(i, { max: numberOrUndefined(e.target.value) })} />
              </div>
              <span className="adm-preview-s" aria-live="polite">{p.min === undefined && p.max === undefined ? "—" : priceLabel(p, "he")}</span>
              <button type="button" className="adm-ib danger" onClick={() => setDraft((d) => ({ ...d, prices: d.prices.filter((_, j) => j !== i) }))} aria-label="מחיקת הטווח">{I.trash()}</button>
            </li>
          ))}
        </ul>
        <button type="button" className="adm-btn ghost add" onClick={() => setDraft((d) => ({ ...d, prices: [...d.prices, {}] }))} disabled={draft.prices.length >= 8}>{I.plus()}<span>הוספת טווח</span></button>
      </Card>

      {error ? <p className="adm-err" role="alert">{error}</p> : null}
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setError(""); }} />

      {pickingFor ? (
        categories.isError ? (
          <ConfirmDialog title="הקטגוריות לא נטענו" text="לא הצלחנו לקרוא את הקטגוריות מהחנות. נסו שוב עוד רגע." confirmLabel="סגירה" onConfirm={() => setPicking(null)} onCancel={() => setPicking(null)} />
        ) : (
          <CategoryPicker categories={categories.data ?? []} selected={pickingFor.categories} onChange={(ids) => setCollection(pickingFor.key, { categories: ids })} onClose={() => setPicking(null)} />
        )
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title="למחוק את הלשונית?"
          text={`"${deleting.he || deleting.key}" תוסר מהקולקציה אחרי השמירה.`}
          onConfirm={() => { setDraft((d) => ({ ...d, collections: d.collections.filter((c) => c.key !== deleting.key) })); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
      {resetting ? <ConfirmDialog title="לחזור להגדרות המקוריות?" text="הלשוניות, המיון והמחירים יחזרו למה שהיה באתר מההתחלה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
