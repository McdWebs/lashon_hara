import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminProducts, type AdminProduct, type ProductInput, type ProductList, type StoredConfig } from "../../lib/adminConfig";
import { fetchCategories } from "../../lib/catalog";
import { decodeHtmlEntities } from "../../lib/html";
import { CategoryPicker } from "./ShopSection";
import { ShopOrder } from "./ShopOrder";
import { Card, ConfirmDialog, I, SectionHead, Switch, errorText, useAdmin } from "./ui";

const EMPTY: ProductInput = {
  name: "",
  status: "publish",
  regularPrice: "",
  salePrice: "",
  stockStatus: "instock",
  sku: "",
  shortDescription: "",
  description: "",
  categories: [],
  images: [],
};

const fromProduct = (p: AdminProduct): ProductInput => ({
  name: decodeHtmlEntities(p.name),
  status: p.status === "publish" ? "publish" : "draft",
  regularPrice: p.regularPrice,
  salePrice: p.salePrice,
  stockStatus: p.stockStatus === "outofstock" ? "outofstock" : "instock",
  sku: p.sku,
  shortDescription: p.shortDescription,
  description: p.description,
  categories: p.categories.map((c) => c.id),
  images: p.images.map((i) => ({ id: i.id, src: i.src, alt: i.alt })),
});

const STATUS_LABEL: Record<string, string> = { publish: "מפורסם", draft: "טיוטה", private: "פרטי", pending: "ממתין", trash: "באשפה" };

function ProductForm({ id, onClose, onSaved }: { id: number | "new"; onClose: () => void; onSaved: (product: AdminProduct) => void }) {
  const { toast, fail } = useAdmin();
  const [draft, setDraft] = useState<ProductInput | null>(id === "new" ? EMPTY : null);
  /** Products with sizes or colours are priced per variation in the store, not here. */
  const [simple, setSimple] = useState(true);
  const [picking, setPicking] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories, staleTime: 5 * 60_000 });
  const names = new Map((categories.data ?? []).map((c) => [c.id, c.name]));

  useEffect(() => {
    if (id === "new") return;
    adminProducts.get(id).then((p) => { setSimple(p.type === "simple"); setDraft(fromProduct(p)); }).catch((err) => { fail(err); onClose(); });
  }, [id, fail, onClose]);

  if (!draft) {
    return (
      <div className="adm-modal adm-sheet" role="dialog" aria-modal="true" aria-busy="true" aria-label="טוענים מוצר">
        <div className="adm-card adm-pform" aria-hidden="true" style={{ padding: 22, gap: 18 }}>
          <span className="adm-sk adm-sk-line" style={{ width: "40%", height: 28 }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="adm-field">
              <span className="adm-sk adm-sk-line short" />
              <span className="adm-sk adm-sk-field" style={i === 4 ? { height: 110 } : undefined} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const set = (patch: Partial<ProductInput>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const money = (text: string) => text.replace(/[^\d.]/g, "");

  function addImage() {
    const url = newImage.trim();
    if (!/^https:\/\/\S+$/.test(url)) {
      setError("קישור לתמונה צריך להתחיל ב-https.");
      return;
    }
    setError("");
    set({ images: [...draft!.images, { src: url, alt: draft!.name }] });
    setNewImage("");
  }

  async function save() {
    const d = draft!;
    if (!d.name.trim()) return setError("צריך שם למוצר.");
    if (simple && !/^\d+(\.\d{1,2})?$/.test(d.regularPrice)) return setError("צריך מחיר תקין, למשל 25 או 24.90.");
    if (simple && d.salePrice && Number(d.salePrice) >= Number(d.regularPrice)) return setError("מחיר המבצע צריך להיות נמוך מהמחיר הרגיל.");
    setError("");
    setSaving(true);
    try {
      const body: ProductInput = { ...d, name: d.name.trim(), images: d.images.map((i) => (i.id ? { id: i.id } as ProductInput["images"][number] : { src: i.src, alt: i.alt })) };
      const saved = id === "new" ? await adminProducts.create(body) : await adminProducts.update(id, body);
      toast(id === "new" ? "המוצר נוסף" : "המוצר נשמר");
      onSaved(saved);
    } catch (err) {
      fail(err);
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-modal adm-sheet" role="dialog" aria-modal="true" aria-label={id === "new" ? "מוצר חדש" : "עריכת מוצר"} onKeyDown={(e) => { if (e.key === "Escape" && !picking) onClose(); }}>
      <div className="adm-card adm-pform">
        <header className="adm-pf-h">
          <h2>{id === "new" ? "מוצר חדש" : "עריכת מוצר"}</h2>
          <button type="button" className="adm-ib" onClick={onClose} aria-label="סגירה">{I.close()}</button>
        </header>

        <div className="adm-pf-body">
          <div className="adm-pf-cols">
          <div className="adm-pf-col">
          <section className="adm-pf-g">
            <div className="adm-field">
              <label htmlFor="p-name">שם המוצר</label>
              <input id="p-name" className="adm-in" value={draft.name} maxLength={200} autoFocus={id === "new"} placeholder="למשל: צמיד סיליקון" onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="adm-field">
              <label>קטגוריות</label>
              <div className="adm-cats">
                {draft.categories.map((cid) => (
                  <span key={cid} className="adm-tagc adm-tagc-x" dir="auto">
                    {decodeHtmlEntities(names.get(cid) ?? `קטגוריה ${cid}`)}
                    <button type="button" onClick={() => set({ categories: draft.categories.filter((x) => x !== cid) })} aria-label="הסרת הקטגוריה">{I.close()}</button>
                  </span>
                ))}
                <button type="button" className="adm-btn ghost small" onClick={() => setPicking(true)}>{I.plus()}<span>{draft.categories.length ? "עוד קטגוריות" : "בחירת קטגוריות"}</span></button>
              </div>
            </div>
          </section>

          <section className="adm-pf-g">
            <h3>מחיר ומלאי</h3>
            {simple ? (
              <div className="adm-pf-prices">
                <div className="adm-field">
                  <label htmlFor="p-price">מחיר רגיל</label>
                  <span className="adm-money"><input id="p-price" className="adm-in" inputMode="decimal" dir="ltr" placeholder="0" value={draft.regularPrice} onChange={(e) => set({ regularPrice: money(e.target.value) })} /><i>₪</i></span>
                </div>
                <div className="adm-field">
                  <label htmlFor="p-sale">מחיר מבצע</label>
                  <span className="adm-money"><input id="p-sale" className="adm-in" inputMode="decimal" dir="ltr" placeholder="ללא" value={draft.salePrice} onChange={(e) => set({ salePrice: money(e.target.value) })} /><i>₪</i></span>
                </div>
              </div>
            ) : <p className="adm-hint">למוצר הזה יש מידות או גרסאות, והמחירים שלהן נערכים בחנות עצמה.</p>}
            <div className="adm-field">
              <label htmlFor="p-sku">מק״ט</label>
              <input id="p-sku" className="adm-in" dir="ltr" value={draft.sku} maxLength={80} onChange={(e) => set({ sku: e.target.value })} />
            </div>
            <div className="adm-pf-sw">
              <Switch on={draft.status === "publish"} onChange={(on) => set({ status: on ? "publish" : "draft" })} label={draft.status === "publish" ? "מפורסם באתר" : "טיוטה, לא מוצג באתר"} />
              <Switch on={draft.stockStatus === "instock"} onChange={(on) => set({ stockStatus: on ? "instock" : "outofstock" })} label={draft.stockStatus === "instock" ? "במלאי" : "אזל מהמלאי"} />
            </div>
          </section>

          </div>
          <div className="adm-pf-col">
          <section className="adm-pf-g">
            <h3>תמונות</h3>
            {draft.images.length ? (
              <ul className="adm-pimgs">
                {draft.images.map((img, i) => (
                  <li key={`${img.id ?? img.src}-${i}`}>
                    <img src={img.src} alt="" loading="lazy" />
                    {i === 0 ? <small>ראשית</small> : null}
                    <button type="button" className="adm-ib danger" onClick={() => set({ images: draft.images.filter((_, j) => j !== i) })} aria-label="הסרת התמונה">{I.close()}</button>
                  </li>
                ))}
              </ul>
            ) : <p className="adm-hint">עוד אין תמונות. הדביקו קישור לתמונה.</p>}
            <div className="adm-pimg-add">
              <input className="adm-in" dir="ltr" placeholder="https://… קישור לתמונה" value={newImage} onChange={(e) => setNewImage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }} aria-label="קישור לתמונה" />
              <button type="button" className="adm-btn ghost" onClick={addImage} disabled={!newImage.trim()}>הוספה</button>
            </div>
          </section>

          <section className="adm-pf-g">
            <h3>תיאור</h3>
            <div className="adm-field">
              <label htmlFor="p-short">תיאור קצר</label>
              <textarea id="p-short" rows={2} value={draft.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} />
            </div>
            <div className="adm-field">
              <label htmlFor="p-desc">תיאור מלא</label>
              <textarea id="p-desc" rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
              <small>אפשר HTML בסיסי, כמו בחנות עצמה.</small>
            </div>
          </section>
          </div>
          </div>
        </div>

        <footer className="adm-pf-f">
          {error ? <p className="adm-err" role="alert">{error}</p> : null}
          <div className="adm-pf-fb">
            <button type="button" className="adm-btn primary" onClick={() => void save()} disabled={saving}>{saving ? "שומרים…" : id === "new" ? "הוספת המוצר" : "שמירה"}</button>
            <button type="button" className="adm-btn ghost" onClick={onClose} disabled={saving}>ביטול</button>
          </div>
        </footer>
      </div>
      {picking ? <CategoryPicker categories={categories.data ?? []} selected={draft.categories} onChange={(ids) => set({ categories: ids })} onClose={() => setPicking(false)} /> : null}
    </div>
  );
}

export function ProductsSection({ stored, onSaved }: { stored: StoredConfig; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const client = useQueryClient();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "order">("list");
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => { setSearch(input.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(t);
  }, [input]);

  const list = useQuery({ queryKey: ["admin-products", search, page], queryFn: () => adminProducts.list({ search, status: "any", page }), placeholderData: (prev) => prev });
  /* The store takes a second or more to answer, and its own list can lag behind. So the screen changes at once
     and the lists already loaded are edited in place instead of being fetched again. */
  const editLists = (change: (list: ProductList, key: readonly unknown[]) => ProductList) =>
    client.setQueriesData<ProductList>({ queryKey: ["admin-products"] }, (list) => (list ? change(list, []) : list));

  async function remove(p: AdminProduct) {
    setDeleting(null);
    const before = client.getQueriesData<ProductList>({ queryKey: ["admin-products"] });
    editLists((list) => (list.items.some((i) => i.id === p.id) ? { ...list, items: list.items.filter((i) => i.id !== p.id), total: Math.max(0, list.total - 1) } : { ...list, total: Math.max(0, list.total - 1) }));
    try {
      await adminProducts.remove(p.id);
      toast("המוצר הועבר לאשפה");
    } catch (err) {
      before.forEach(([key, data]) => client.setQueryData(key, data));
      fail(err);
    }
  }

  function saved(product: AdminProduct) {
    setEditing(null);
    const isNew = editing === "new";
    client.getQueriesData<ProductList>({ queryKey: ["admin-products"] }).forEach(([key, list]) => {
      if (!list) return;
      const [, listSearch, listPage] = key as [string, string, number];
      if (!isNew) {
        client.setQueryData<ProductList>(key, { ...list, items: list.items.map((i) => (i.id === product.id ? product : i)) });
      } else if (listSearch === "" && listPage === 1) {
        client.setQueryData<ProductList>(key, { ...list, items: [product, ...list.items].slice(0, 20), total: list.total + 1 });
      }
    });
  }

  const data = list.data;
  const switcher = (
    <div className="adm-vsw" role="tablist" aria-label="תצוגה">
      <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}>כל המוצרים</button>
      <button type="button" role="tab" aria-selected={view === "order"} className={view === "order" ? "on" : ""} onClick={() => setView("order")}>סדר בחנות</button>
    </div>
  );
  return (
    <div className="adm-section">
      <SectionHead title="מוצרים" text="כל המוצרים בחנות: חיפוש, עריכה, הוספה ומחיקה, וגם הסדר שבו הם מופיעים בחנות. שינויים מופיעים באתר תוך שניות." />
      {view === "order" ? <ShopOrder stored={stored} onSaved={onSaved} switcher={switcher} /> : null}
      {view === "list" ? (
      <Card
        title={data ? `${data.total} מוצרים` : "מוצרים"}
        actions={<div className="adm-hact one">{switcher}<button type="button" className="adm-btn primary" onClick={() => setEditing("new")} aria-label="מוצר חדש">{I.plus()}<span className="adm-btn-t">מוצר חדש</span></button></div>}
      >
        <div className="adm-ptools">
          <input className="adm-in" type="search" placeholder="חיפוש מוצר…" value={input} onChange={(e) => setInput(e.target.value)} aria-label="חיפוש מוצר" />
        </div>
        {list.isError ? <p className="adm-err" role="alert">{errorText(list.error)}</p> : null}
        {list.isLoading ? (
          <ul className="adm-rows flat adm-plist" aria-busy="true" aria-label="טוענים מוצרים">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="adm-prow" aria-hidden="true">
                <span className="adm-sk adm-sk-img" />
                <div className="adm-pinfo">
                  <span className="adm-sk adm-sk-line" style={{ width: `${70 - (i % 3) * 14}%` }} />
                  <span className="adm-sk adm-sk-line short" />
                </div>
                <span className="adm-sk adm-sk-btn" />
                <span className="adm-sk adm-sk-btn" />
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="adm-rows flat adm-plist">
          {data?.items.map((p) => (
            <li key={p.id} className="adm-prow">
              {p.images[0] ? <img src={p.images[0].src} alt="" loading="lazy" /> : <span className="adm-pnoimg" aria-hidden="true">{I.image()}</span>}
              <div className="adm-pinfo">
                <button type="button" className="adm-plink" dir="auto" onClick={() => setEditing(p.id)}>{decodeHtmlEntities(p.name)}</button>
                <small>
                  {p.salePrice ? <><s>₪{p.regularPrice}</s> ₪{p.salePrice}</> : p.regularPrice ? `₪${p.regularPrice}` : "ללא מחיר"}
                  {" · "}{STATUS_LABEL[p.status] ?? p.status}
                  {p.stockStatus === "outofstock" ? " · אזל מהמלאי" : ""}
                </small>
              </div>
              <span className="adm-acc-a">
                <button type="button" className="adm-ib" onClick={() => setEditing(p.id)} aria-label={`עריכת ${p.name}`}>{I.edit()}</button>
                <button type="button" className="adm-ib danger" onClick={() => setDeleting(p)} aria-label={`מחיקת ${p.name}`}>{I.trash()}</button>
              </span>
            </li>
          ))}
          {data && data.items.length === 0 ? <li className="adm-hint">לא נמצאו מוצרים.</li> : null}
        </ul>
        {data && data.totalPages > 1 ? (
          <div className="adm-pager">
            <button type="button" className="adm-btn ghost small" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>הקודם</button>
            <span>עמוד {page} מתוך {data.totalPages}</span>
            <button type="button" className="adm-btn ghost small" disabled={page >= data.totalPages} onClick={() => setPage((n) => n + 1)}>הבא</button>
          </div>
        ) : null}
      </Card>
      ) : null}

      {editing !== null ? <ProductForm id={editing} onClose={() => setEditing(null)} onSaved={saved} /> : null}
      {deleting ? (
        <ConfirmDialog
          title="למחוק את המוצר?"
          text={`"${decodeHtmlEntities(deleting.name)}" יוסר מהאתר ויועבר לאשפה בחנות, משם אפשר לשחזר אותו.`}
          onConfirm={() => void remove(deleting)}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
