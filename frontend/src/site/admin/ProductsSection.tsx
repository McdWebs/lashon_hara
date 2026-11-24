import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { adminProducts, type AdminProduct, type ProductInput, type ProductList, type StoredConfig } from "../../lib/adminConfig";
import { fetchCategories } from "../../lib/catalog";
import { MAX_PHOTO, uploadProductImage } from "../../lib/media";
import { decodeHtmlEntities } from "../../lib/html";
import { CategoryPicker } from "./ShopSection";
import { ShopOrder } from "./ShopOrder";
import { Card, ConfirmDialog, ERRORS, I, SectionHead, Switch, errorText, useAdmin } from "./ui";

const MAX_IMAGES = 30;

/** How a photo is told apart in the form: by its store id, or by its link while it has none yet. */
const keyOf = (img: { id?: number; src: string }) => (img.id ? `id:${img.id}` : `src:${img.src}`);
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  images: p.images.map((i) => ({ id: i.id, src: i.src, alt: i.alt, hidden: Boolean(i.hidden) })),
});

const STATUS_LABEL: Record<string, string> = { publish: "מפורסם", draft: "טיוטה", private: "פרטי", pending: "ממתין", trash: "באשפה" };

function ProductForm({ id, onClose, onSaved }: { id: number | "new"; onClose: () => void; onSaved: (product: AdminProduct) => void }) {
  const { toast, fail } = useAdmin();
  const [draft, setDraft] = useState<ProductInput | null>(id === "new" ? EMPTY : null);
  /** Products with sizes or colours are priced per variation in the store, not here. */
  const [simple, setSimple] = useState(true);
  const [picking, setPicking] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState<Array<{ key: string; preview: string; progress: number }>>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  /** The product's options (colors, sizes), and which photo each one shows: option id to the photo's key. */
  const [variations, setVariations] = useState<NonNullable<AdminProduct["variations"]>>([]);
  const [links, setLinks] = useState<Record<number, string>>({});
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: fetchCategories, staleTime: 5 * 60_000 });
  const names = new Map((categories.data ?? []).map((c) => [c.id, c.name]));

  useEffect(() => {
    if (id === "new") return;
    adminProducts.get(id).then((p) => {
      setSimple(p.type === "simple");
      const next = fromProduct(p);
      const options = p.variations ?? [];
      // An option can have a photo that is not in the product's own list; it is shown too, so it can be seen and moved.
      const known = new Set(next.images.map((i) => i.id));
      for (const v of options) {
        if (v.imageId && v.imageSrc && !known.has(v.imageId)) {
          known.add(v.imageId);
          next.images.push({ id: v.imageId, src: v.imageSrc, alt: "", hidden: false });
        }
      }
      setVariations(options);
      setLinks(Object.fromEntries(options.filter((v) => v.imageId).map((v) => [v.id, `id:${v.imageId}`])));
      setDraft(next);
    }).catch((err) => { fail(err); onClose(); });
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

  /** Photos from the computer go to the image storage; the store copies them into its library when the product is saved. */
  function addFiles(files: File[]) {
    const room = Math.max(0, MAX_IMAGES - draft!.images.length - uploading.length);
    const picked = files.slice(0, room);
    setError(files.length > picked.length ? `אפשר עד ${MAX_IMAGES} תמונות למוצר.` : "");
    for (const file of picked) {
      if (!IMAGE_TYPES.includes(file.type)) { setError(ERRORS.unsupported_type); continue; }
      if (file.size > MAX_PHOTO) { setError(ERRORS.too_large); continue; }
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const preview = URL.createObjectURL(file);
      setUploading((u) => [...u, { key, preview, progress: 0 }]);
      uploadProductImage(file, (progress) => setUploading((u) => u.map((x) => (x.key === key ? { ...x, progress } : x))))
        .then((src) => setDraft((d) => (d ? { ...d, images: [...d.images, { src, alt: d.name }] } : d)))
        .catch((err) => { fail(err); setError(errorText(err)); })
        .finally(() => { URL.revokeObjectURL(preview); setUploading((u) => u.filter((x) => x.key !== key)); });
    }
  }

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
      const variationLinks = variations.flatMap((v) => {
        const at = d.images.findIndex((img) => keyOf(img) === links[v.id]);
        return links[v.id] && at >= 0 ? [{ variationId: v.id, imageIndex: at }] : [];
      });
      const body: ProductInput = { ...d, name: d.name.trim(), images: d.images.map((i) => (i.id ? { id: i.id, hidden: Boolean(i.hidden) } as ProductInput["images"][number] : { src: i.src, alt: i.alt, hidden: Boolean(i.hidden) })), variationLinks };
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
            {draft.images.length || uploading.length ? (
              <ul className="adm-pimgs">
                {draft.images.map((img, i) => {
                  const main = i === draft.images.findIndex((x) => !x.hidden);
                  const move = (to: number) => {
                    const next = [...draft.images];
                    const [one] = next.splice(i, 1);
                    next.splice(to, 0, one);
                    set({ images: next });
                  };
                  return (
                    <li key={`${img.id ?? img.src}-${i}`} className={img.hidden ? "hid" : undefined}>
                      <img src={img.src} alt="" loading="lazy" />
                      <span className="adm-pimg-t">
                        <b>{img.hidden ? "מוסתרת" : main ? "תמונה ראשית" : `תמונה ${i + 1}`}</b>
                        <small>{img.hidden ? "לא מוצגת באתר" : main ? "מוצגת בכרטיס ובראש עמוד המוצר" : "בגלריית המוצר"}</small>
                      </span>
                      <span className="adm-pimg-b">
                        <button type="button" className="adm-ib" onClick={() => move(0)} disabled={i === 0 || Boolean(img.hidden)} aria-label="הפיכה לתמונה הראשית" title="הפיכה לתמונה הראשית">{I.star()}</button>
                        <button type="button" className="adm-ib" onClick={() => move(i - 1)} disabled={i === 0} aria-label="הזזה למעלה" title="הזזה למעלה">{I.up()}</button>
                        <button type="button" className="adm-ib" onClick={() => move(i + 1)} disabled={i === draft.images.length - 1} aria-label="הזזה למטה" title="הזזה למטה">{I.down()}</button>
                        <button
                          type="button"
                          className="adm-ib"
                          onClick={() => set({ images: draft.images.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)) })}
                          disabled={img.id === undefined}
                          aria-label={img.hidden ? "הצגה באתר" : "הסתרה מהאתר"}
                          title={img.id === undefined ? "אפשר להסתיר אחרי השמירה" : img.hidden ? "הצגה באתר" : "הסתרה מהאתר"}
                        >
                          {img.hidden ? I.eye() : I.eyeOff()}
                        </button>
                        <button type="button" className="adm-ib danger" onClick={() => set({ images: draft.images.filter((_, j) => j !== i) })} aria-label="מחיקת התמונה מהמוצר" title="מחיקת התמונה מהמוצר">{I.close()}</button>
                      </span>
                      {variations.length > 0 ? (
                        <span className="adm-pimg-opt">
                          {variations.some((v) => links[v.id] === keyOf(img)) ? (
                            <span className="adm-pimg-chips" aria-label="האפשרויות שמציגות את התמונה הזו">
                              {variations.filter((v) => links[v.id] === keyOf(img)).map((v) => <em key={v.id}>{v.label}</em>)}
                            </span>
                          ) : <small>לא מחוברת לאפשרות</small>}
                          <select
                            className="adm-in"
                            value=""
                            aria-label="חיבור התמונה לאפשרות"
                            onChange={(e) => { const vid = Number(e.target.value); if (vid) setLinks((l) => ({ ...l, [vid]: keyOf(img) })); }}
                          >
                            <option value="">חיבור לאפשרות…</option>
                            {variations.filter((v) => links[v.id] !== keyOf(img)).map((v) => (
                              <option key={v.id} value={v.id}>{v.label}{links[v.id] ? " (כעת בתמונה אחרת)" : ""}</option>
                            ))}
                          </select>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
                {uploading.map((u) => (
                  <li key={u.key} className="adm-pimg-up" aria-busy="true">
                    <img src={u.preview} alt="" />
                    <span className="adm-pimg-t"><b>מעלים…</b></span>
                    <span className="adm-pimg-bar"><i style={{ width: `${Math.round(u.progress * 100)}%` }} /></span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div
              className={`adm-drop${dragOver ? " over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles([...e.dataTransfer.files]); }}
              onClick={() => { if (draft.images.length + uploading.length < MAX_IMAGES) fileInput.current?.click(); }}
            >
              <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(",")} multiple hidden onChange={(e) => { addFiles([...(e.target.files ?? [])]); e.target.value = ""; }} />
              <button type="button" className="adm-btn ghost" disabled={draft.images.length + uploading.length >= MAX_IMAGES}>{I.upload(18)}<span>העלאת תמונות</span></button>
              <small>או גררו קבצים לכאן · JPG, PNG או WebP, עד 10MB</small>
            </div>
            <label className="adm-pimg-or" htmlFor="p-img-url">או הדביקו קישור לתמונה</label>
            <div className="adm-pimg-add">
              <input id="p-img-url" className="adm-in" dir="ltr" placeholder="https://…" value={newImage} onChange={(e) => setNewImage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }} aria-label="קישור לתמונה" />
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
            <button type="button" className="adm-btn primary" onClick={() => void save()} disabled={saving || uploading.length > 0}>{saving ? "שומרים…" : uploading.length ? "מעלים תמונות…" : id === "new" ? "הוספת המוצר" : "שמירה"}</button>
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

  // The next page is fetched quietly while this one is read, so Next is usually instant.
  const nextPage = list.data && page < list.data.totalPages ? page + 1 : 0;
  useEffect(() => {
    if (nextPage) void client.prefetchQuery({ queryKey: ["admin-products", search, nextPage], queryFn: () => adminProducts.list({ search, status: "any", page: nextPage }), staleTime: 60_000 });
  }, [client, search, nextPage]);

  const goTo = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" } as ScrollToOptions);
  };
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
  /** The next page or a new search is on its way: show placeholders at once instead of leaving the old rows looking frozen. */
  const waiting = list.isLoading || list.isPlaceholderData;
  const switcher = (
    <div className="adm-vsw" role="tablist" aria-label="תצוגה">
      <button type="button" role="tab" aria-selected={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")}>כל המוצרים</button>
      <button type="button" role="tab" aria-selected={view === "order"} className={view === "order" ? "on" : ""} onClick={() => setView("order")}>סדר בחנות</button>
    </div>
  );
  return (
    <div className="adm-section">
      <SectionHead title="מוצרים" />
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
        {waiting ? (
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
        <ul className="adm-rows flat adm-plist" hidden={waiting}>
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
            <button type="button" className="adm-btn ghost small" disabled={page <= 1 || waiting} onClick={() => goTo(page - 1)}>הקודם</button>
            <span>עמוד {page} מתוך {data.totalPages}</span>
            <button type="button" className="adm-btn ghost small" disabled={page >= data.totalPages || waiting} onClick={() => goTo(page + 1)}>הבא</button>
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
