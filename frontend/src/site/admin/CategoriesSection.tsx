import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminCategories, type AdminCategory, type StoredConfig } from "../../lib/adminConfig";
import { decodeHtmlEntities } from "../../lib/html";
import { DEFAULT_SHOP } from "../../lib/siteConfig";
import { Dropdown } from "../Dropdown";
import { Card, ConfirmDialog, I, SectionHead, errorText, useAdmin } from "./ui";

const KEY = ["admin-categories-full"] as const;
const clean = (c: AdminCategory) => ({ ...c, name: decodeHtmlEntities(c.name) });

/** Add or rename a category, and say which one it sits under. */
function CategoryForm({ category, all, onClose, onSaved }: { category: AdminCategory | "new"; all: AdminCategory[]; onClose: () => void; onSaved: (saved: AdminCategory, isNew: boolean) => void }) {
  const { toast, fail } = useAdmin();
  const isNew = category === "new";
  const [name, setName] = useState(isNew ? "" : decodeHtmlEntities(category.name));
  const [parent, setParent] = useState(isNew ? 0 : category.parent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // A category cannot sit under itself, so it and its own sub-categories are left out.
  const options = useMemo(() => {
    const self = isNew ? -1 : category.id;
    return [
      { value: "0", label: "ללא (קטגוריה ראשית)" },
      ...all.filter((c) => c.id !== self && c.parent !== self).sort((a, b) => a.name.localeCompare(b.name, "he")).map((c) => ({ value: String(c.id), label: decodeHtmlEntities(c.name) })),
    ];
  }, [all, category, isNew]);

  async function save() {
    if (!name.trim()) return setError("צריך שם לקטגוריה.");
    setError("");
    setSaving(true);
    try {
      const body = { name: name.trim(), parent };
      const saved = isNew ? await adminCategories.create(body) : await adminCategories.update(category.id, body);
      toast(isNew ? "הקטגוריה נוספה" : "הקטגוריה נשמרה");
      onSaved(saved, isNew);
    } catch (err) {
      fail(err);
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label={isNew ? "קטגוריה חדשה" : "עריכת קטגוריה"} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="adm-card adm-catform">
        <div className="adm-picker-h">
          <h2>{isNew ? "קטגוריה חדשה" : "עריכת קטגוריה"}</h2>
          <button type="button" className="adm-ib" onClick={onClose} aria-label="סגירה">{I.close()}</button>
        </div>
        <div className="adm-field">
          <label htmlFor="c-name">שם הקטגוריה</label>
          <input id="c-name" className="adm-in" value={name} maxLength={80} autoFocus onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void save(); }} />
        </div>
        <div className="adm-field">
          <label>נמצאת תחת</label>
          <div className="adm-dd">
            <Dropdown label="נמצאת תחת" text={options.find((o) => o.value === String(parent))?.label ?? ""} value={String(parent)} options={options} onChange={(v) => setParent(Number(v))} />
          </div>
        </div>
        {error ? <p className="adm-err" role="alert">{error}</p> : null}
        <div className="adm-confirm-b">
          <button type="button" className="adm-btn primary" onClick={() => void save()} disabled={saving}>{saving ? "שומרים…" : isNew ? "הוספה" : "שמירה"}</button>
          <button type="button" className="adm-btn ghost" onClick={onClose} disabled={saving}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

export function CategoriesSection({ stored }: { stored: StoredConfig }) {
  const { toast, fail } = useAdmin();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  const list = useQuery({ queryKey: KEY, queryFn: async () => (await adminCategories.list()).items.map(clean), staleTime: 60_000 });
  const all = list.data ?? [];
  const tabs = (stored.shop ?? DEFAULT_SHOP).collections;

  /** Top-level categories, each followed by the ones under it. A search shows only what matches. */
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byName = (a: AdminCategory, b: AdminCategory) => a.name.localeCompare(b.name, "he");
    const ids = new Set(all.map((c) => c.id));
    const roots = all.filter((c) => c.parent === 0 || !ids.has(c.parent)).sort(byName);
    const out: Array<AdminCategory & { depth: number }> = [];
    for (const r of roots) {
      out.push({ ...r, depth: 0 });
      for (const child of all.filter((c) => c.parent === r.id).sort(byName)) out.push({ ...child, depth: 1 });
    }
    return q ? out.filter((c) => c.name.toLowerCase().includes(q)) : out;
  }, [all, search]);

  const setCache = (change: (items: AdminCategory[]) => AdminCategory[]) => client.setQueryData<AdminCategory[]>(KEY, (items) => change(items ?? []));
  // The category pickers elsewhere in the admin read the shop's own list; ask for it again next time.
  const staleOthers = () => void client.invalidateQueries({ queryKey: ["admin-categories"] });

  function saved(category: AdminCategory, isNew: boolean) {
    const fresh = clean(category);
    setCache((items) => (isNew ? [...items, fresh] : items.map((c) => (c.id === fresh.id ? { ...c, name: fresh.name, parent: fresh.parent } : c))));
    staleOthers();
    setEditing(null);
  }

  async function remove(category: AdminCategory) {
    setDeleting(null);
    const before = client.getQueryData<AdminCategory[]>(KEY);
    setCache((items) => items.filter((c) => c.id !== category.id).map((c) => (c.parent === category.id ? { ...c, parent: category.parent } : c)));
    try {
      await adminCategories.remove(category.id);
      toast("הקטגוריה נמחקה");
      staleOthers();
    } catch (err) {
      client.setQueryData(KEY, before);
      fail(err);
    }
  }

  const usedBy = (id: number) => tabs.filter((t) => t.categories.includes(id)).map((t) => t.he);
  const deleteText = (c: AdminCategory) => {
    const tabsUsing = usedBy(c.id);
    return [
      `"${c.name}" תימחק מהחנות, ואי אפשר לשחזר אותה.`,
      c.count ? `${c.count} מוצרים שהיו בה יישארו בחנות, בלי הקטגוריה הזאת.` : "",
      all.some((x) => x.parent === c.id) ? "תתי־הקטגוריות שלה יעברו לרמה שמעליה." : "",
      tabsUsing.length ? `היא משמשת בלשונית ${tabsUsing.map((n) => `"${n}"`).join(", ")} בחנות, ואחרי המחיקה הלשונית תציג פחות מוצרים.` : "",
    ].filter(Boolean).join(" ");
  };

  return (
    <div className="adm-section">
      <SectionHead title="קטגוריות" />
      <Card
        title={list.data ? `${all.length} קטגוריות` : "קטגוריות"}
        actions={<button type="button" className="adm-btn primary" onClick={() => setEditing("new")}>{I.plus()}<span>קטגוריה חדשה</span></button>}
      >
        <div className="adm-ptools">
          <input className="adm-in" type="search" placeholder="חיפוש קטגוריה…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="חיפוש קטגוריה" />
        </div>
        {list.isError ? <p className="adm-err" role="alert">{errorText(list.error)}</p> : null}
        {list.isLoading ? (
          <ul className="adm-rows flat adm-plist" aria-busy="true" aria-label="טוענים קטגוריות">
            {Array.from({ length: 7 }, (_, i) => (
              <li key={i} className="adm-prow" aria-hidden="true">
                <div className="adm-pinfo"><span className="adm-sk adm-sk-line" style={{ width: `${60 - (i % 3) * 12}%` }} /><span className="adm-sk adm-sk-line short" /></div>
                <span className="adm-sk adm-sk-btn" /><span className="adm-sk adm-sk-btn" />
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="adm-rows flat adm-plist">
          {rows.map((c) => {
            const tabsUsing = usedBy(c.id);
            return (
              <li key={c.id} className={`adm-prow adm-crow${c.depth ? " sub" : ""}`}>
                <div className="adm-pinfo">
                  <button type="button" className="adm-plink" dir="auto" onClick={() => setEditing(c)}>{c.name}</button>
                  <small>
                    {c.count} מוצרים
                    {c.hiddenOnSite ? " · מוסתרת באתר" : ""}
                    {tabsUsing.length ? ` · בלשונית ${tabsUsing.join(", ")}` : ""}
                  </small>
                </div>
                <span className="adm-acc-a">
                  <button type="button" className="adm-ib" onClick={() => setEditing(c)} aria-label={`עריכת ${c.name}`}>{I.edit()}</button>
                  <button type="button" className="adm-ib danger" onClick={() => setDeleting(c)} aria-label={`מחיקת ${c.name}`}>{I.trash()}</button>
                </span>
              </li>
            );
          })}
          {list.data && rows.length === 0 ? <li className="adm-hint">לא נמצאו קטגוריות.</li> : null}
        </ul>
      </Card>

      {editing !== null ? <CategoryForm category={editing} all={all} onClose={() => setEditing(null)} onSaved={saved} /> : null}
      {deleting ? <ConfirmDialog title="למחוק את הקטגוריה?" text={deleteText(deleting)} onConfirm={() => void remove(deleting)} onCancel={() => setDeleting(null)} /> : null}
    </div>
  );
}
