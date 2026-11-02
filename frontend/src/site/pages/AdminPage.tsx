import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import {
  ACCEPT,
  MAX_PHOTO,
  MAX_VIDEO,
  adminApi,
  adminToken,
  uploadMedia,
  type AdminList,
  type MediaWorld,
} from "../../lib/media";
import "../admin.css";

const WORLDS: Array<{ key: MediaWorld; label: string; page: string }> = [
  { key: "idf", label: "צה״ל", page: "/activity/idf" },
  { key: "ambassadors", label: "שגרירים", page: "/activity/ambassadors" },
];

const ERRORS: Record<string, string> = {
  wrong_password: "הסיסמה שגויה.",
  too_many_attempts: "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה.",
  storage_not_configured: "האחסון עדיין לא מחובר.",
  unsupported_type: "סוג הקובץ לא נתמך.",
  too_large: "הקובץ גדול מדי.",
  upload_failed: "ההעלאה נכשלה. נסו שוב.",
  unauthorized: "פג תוקף הכניסה. יש להיכנס מחדש.",
};

const errorText = (err: unknown) => ERRORS[err instanceof Error ? err.message : ""] ?? "משהו השתבש. נסו שוב.";

type Items = AdminList["items"];
type Upload = { id: number; world: MediaWorld; name: string; preview?: string; isVideo: boolean; progress: number; error?: string };
type Toast = { id: number; text: string; bad?: boolean };

/* ---- icons ---- */
function Ico({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const I = {
  upload: (size?: number) => <Ico size={size}><path d="M12 16V5" /><path d="M7 10l5-5 5 5" /><path d="M5 19h14" /></Ico>,
  trash: () => <Ico><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 12h8l1-12" /></Ico>,
  close: () => <Ico><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Ico>,
  play: () => <Ico size={22}><path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" /></Ico>,
  image: () => <Ico size={16}><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M5 17l5-5 4 4 2-2 3 3" /></Ico>,
  video: () => <Ico size={16}><rect x="3.5" y="6" width="12" height="12" rx="2" /><path d="M15.5 10.5l5-3v9l-5-3" /></Ico>,
  right: () => <Ico><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Ico>,
  left: () => <Ico><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></Ico>,
  ext: () => <Ico size={18}><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M18 14v5H5V6h5" /></Ico>,
  eye: () => <Ico><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></Ico>,
  check: () => <Ico size={16}><path d="M5 12.5l4.5 4.5L19 7.5" /></Ico>,
};

function Brand() {
  return (
    <span className="adm-brand">
      <img src="/images/site/logo.svg" alt="לשון הרע לא מדבר אליי" width="194" height="26" />
    </span>
  );
}

/* ---- sign in ---- */
function Login({ onDone, notice }: { onDone: () => void; notice?: string }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(notice ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      adminToken.set((await adminApi.login(password)).token);
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-login-wrap">
      <form className="adm-card adm-login" onSubmit={submit}>
        <Brand />
        <div className="adm-login-t">
          <h1>ניהול מדיה</h1>
          <p>כניסה לצוות. כאן מעלים תמונות וסרטונים לעמוד הפעילות.</p>
        </div>
        <div className="adm-field">
          <label htmlFor="adm-pass">סיסמה</label>
          <span className="adm-pass">
            <input id="adm-pass" type={show ? "text" : "password"} autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="adm-eye" onClick={() => setShow((v) => !v)} aria-label={show ? "הסתרת הסיסמה" : "הצגת הסיסמה"} aria-pressed={show}>{I.eye()}</button>
          </span>
        </div>
        {error ? <p className="adm-err" role="alert">{error}</p> : null}
        <button className="adm-btn primary big" type="submit" disabled={busy || !password}>{busy ? "נכנסים…" : "כניסה"}</button>
      </form>
    </div>
  );
}

/* ---- the manager ---- */
function Manager({ onLogout }: { onLogout: (notice?: string) => void }) {
  const [world, setWorld] = useState<MediaWorld>("idf");
  const [lists, setLists] = useState<Record<MediaWorld, AdminList | null>>({ idf: null, ambassadors: null });
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [fileDrag, setFileDrag] = useState(false);
  const [viewing, setViewing] = useState<Items[number] | null>(null);
  const [deleting, setDeleting] = useState<Items[number] | null>(null);
  const counter = useRef(0);
  const dragDepth = useRef(0);

  const toast = useCallback((text: string, bad = false) => {
    const id = (counter.current += 1);
    setToasts((list) => [...list, { id, text, bad }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), bad ? 5000 : 2600);
  }, []);

  const fail = useCallback(
    (err: unknown) => {
      if (!adminToken.get()) onLogout(ERRORS.unauthorized);
      else toast(errorText(err), true);
    },
    [onLogout, toast],
  );

  const load = useCallback(
    async (w: MediaWorld) => {
      try {
        const data = await adminApi.list(w);
        setLists((l) => ({ ...l, [w]: data }));
      } catch (err) {
        fail(err);
      }
    },
    [fail],
  );

  useEffect(() => {
    void load("idf");
    void load("ambassadors");
  }, [load]);

  const current = lists[world];
  const items: Items = current?.items ?? [];
  const storage = (lists.idf ?? lists.ambassadors)?.storage;
  const here = uploads.filter((u) => u.world === world);

  /* uploads */
  async function send(files: FileList | File[] | null) {
    if (!files) return;
    const target = world;
    for (const file of Array.from(files)) {
      const id = (counter.current += 1);
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      const patch = (next: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...next } : u)));
      setUploads((list) => [...list, { id, world: target, name: file.name, preview, isVideo, progress: 0 }]);
      const supported = file.type.startsWith("image/") || isVideo;
      if (!supported) {
        patch({ error: "סוג הקובץ לא נתמך." });
        continue;
      }
      if (file.size > (isVideo ? MAX_VIDEO : MAX_PHOTO)) {
        patch({ error: `הקובץ גדול מדי (עד ${isVideo ? "150" : "10"}MB).` });
        continue;
      }
      try {
        await uploadMedia(target, file, (progress) => patch({ progress }));
        setUploads((list) => list.filter((u) => u.id !== id));
        URL.revokeObjectURL(preview);
        await load(target);
        toast(isVideo ? "הסרטון הועלה" : "התמונה הועלתה");
      } catch (err) {
        if (!adminToken.get()) onLogout(ERRORS.unauthorized);
        else patch({ error: errorText(err) });
      }
    }
  }

  function dismissUpload(id: number) {
    setUploads((list) => {
      const gone = list.find((u) => u.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((u) => u.id !== id);
    });
  }

  /* file drag over the whole page */
  function onFileEnter(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepth.current += 1;
    setFileDrag(true);
  }
  function onFileLeave(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setFileDrag(false);
  }
  function onFileDrop(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragDepth.current = 0;
    setFileDrag(false);
    if (storage) void send(e.dataTransfer.files);
  }

  /* order */
  async function saveOrder(next: Items) {
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: next } } : l));
    try {
      await adminApi.reorder(world, next.map((i) => i.id));
    } catch (err) {
      fail(err);
      void load(world);
    }
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void saveOrder(next);
  }

  function dropOn(targetId: string) {
    if (!dragging || dragging === targetId) return;
    const from = items.findIndex((i) => i.id === dragging);
    const to = items.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    void saveOrder(next);
  }

  /* caption, delete */
  async function saveCaption(item: Items[number], caption: string) {
    if (caption === item.caption) return;
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: l[world]!.items.map((i) => (i.id === item.id ? { ...i, caption } : i)) } } : l));
    try {
      await adminApi.setCaption(item.id, caption);
      toast("הכיתוב נשמר");
    } catch (err) {
      fail(err);
    }
  }

  async function confirmDelete() {
    const item = deleting;
    if (!item) return;
    setDeleting(null);
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: l[world]!.items.filter((i) => i.id !== item.id) } } : l));
    try {
      await adminApi.remove(item.id);
      toast("הקובץ נמחק");
    } catch (err) {
      fail(err);
      void load(world);
    }
  }

  useEffect(() => {
    if (!viewing && !deleting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewing(null);
        setDeleting(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing, deleting]);

  const active = WORLDS.find((w) => w.key === world)!;

  return (
    <div
      className={`adm-app${fileDrag ? " dropping" : ""}`}
      onDragEnter={onFileEnter}
      onDragLeave={onFileLeave}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
      onDrop={onFileDrop}
    >
      <header className="adm-bar">
        <div className="adm-bar-in">
          <Brand />
          <span className="adm-bar-t">ניהול מדיה</span>
          <span className="adm-bar-r">
            <a className="adm-link" href={active.page} target="_blank" rel="noreferrer"><span>לצפייה באתר</span>{I.ext()}</a>
            <button type="button" className="adm-link" onClick={() => { adminToken.set(null); onLogout(); }}>יציאה</button>
          </span>
        </div>
      </header>

      <main className="adm-main">
        <div className="adm-head">
          <h1>תמונות וסרטונים</h1>
          <p>מה שמועלה כאן מופיע בעמוד הפעילות באתר. הסדר כאן הוא הסדר באתר.</p>
        </div>

        <div className="adm-tabs" role="tablist" aria-label="חלק באתר">
          {WORLDS.map((w) => {
            const count = lists[w.key]?.items.length;
            return (
              <button key={w.key} type="button" role="tab" aria-selected={world === w.key} className={`adm-tab${world === w.key ? " on" : ""}`} onClick={() => setWorld(w.key)}>
                <span>{w.label}</span>
                <b>{count === undefined ? "–" : count}</b>
              </button>
            );
          })}
        </div>

        {storage === false ? (
          <p className="adm-note" role="alert"><b>האחסון עדיין לא מחובר.</b> אי אפשר להעלות קבצים עד שמוסיפים את הגדרות האחסון בשרת.</p>
        ) : null}

        <label className={`adm-drop${storage === false ? " off" : ""}`}>
          <input type="file" multiple accept={ACCEPT} disabled={!storage} onChange={(e) => { void send(e.target.files); e.target.value = ""; }} />
          <span className="adm-drop-i">{I.upload(26)}</span>
          <span className="adm-drop-t">
            <b>גוררים לכאן קבצים, או לוחצים לבחירה</b>
            <small>תמונה עד 10MB (JPG, PNG, WebP) · סרטון עד 150MB (MP4, WebM, MOV)</small>
          </span>
          <span className="adm-btn primary">בחירת קבצים</span>
        </label>

        {items.length === 0 && here.length === 0 && current ? (
          <div className="adm-empty">
            <b>עוד לא הועלו קבצים ל{active.label}</b>
            <span>עד שיועלו, באתר מוצגים קבצי הדוגמה. ברגע שמעלים את הקובץ הראשון, הם מוחלפים בקבצים שלכם.</span>
          </div>
        ) : null}

        {current === null ? <p className="adm-loading">טוענים…</p> : null}

        <ul className="adm-grid" aria-label={`קבצים: ${active.label}`}>
          {here.map((u) => (
            <li key={`u${u.id}`} className="adm-item up">
              <div className="adm-m">
                {u.isVideo ? <video src={u.preview} muted playsInline preload="metadata" /> : <img src={u.preview} alt="" />}
                <span className="adm-up-s">
                  {u.error ? (
                    <>
                      <b>{u.error}</b>
                      <button type="button" className="adm-btn light" onClick={() => dismissUpload(u.id)}>הסרה</button>
                    </>
                  ) : (
                    <>
                      <b>{Math.round(u.progress * 100)}%</b>
                      <span className="adm-prog"><span style={{ width: `${Math.round(u.progress * 100)}%` }} /></span>
                    </>
                  )}
                </span>
              </div>
              <p className="adm-fn" dir="auto">{u.name}</p>
            </li>
          ))}

          {items.map((item, i) => (
            <li
              key={item.id}
              className={`adm-item${dragging === item.id ? " lifted" : ""}${over === item.id && dragging !== item.id ? " target" : ""}`}
              draggable
              onDragStart={(e) => { setDragging(item.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", item.id); }}
              onDragOver={(e) => { if (dragging) { e.preventDefault(); setOver(item.id); } }}
              onDragEnd={() => { setDragging(null); setOver(null); }}
              onDrop={(e) => { if (dragging) { e.preventDefault(); dropOn(item.id); } setDragging(null); setOver(null); }}
            >
              <div className="adm-m">
                <button type="button" className="adm-open" onClick={() => setViewing(item)} aria-label={item.kind === "video" ? "צפייה בסרטון" : "הגדלת התמונה"}>
                  {item.kind === "video" ? <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" /> : <img src={item.src} alt="" loading="lazy" draggable={false} />}
                  {item.kind === "video" ? <span className="adm-play">{I.play()}</span> : null}
                </button>
                <span className="adm-no">{i + 1}</span>
                <span className="adm-kind">{item.kind === "video" ? I.video() : I.image()}{item.kind === "video" ? "סרטון" : "תמונה"}</span>
                <span className="adm-tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="להקדים">{I.right()}</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="לאחר">{I.left()}</button>
                  <button type="button" className="danger" onClick={() => setDeleting(item)} aria-label="מחיקה">{I.trash()}</button>
                </span>
              </div>
              <input className="adm-cap" defaultValue={item.caption} placeholder="הוספת כיתוב" maxLength={300} aria-label="כיתוב" onBlur={(e) => void saveCaption(item, e.target.value.trim())} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
            </li>
          ))}
        </ul>

        {items.length > 1 ? <p className="adm-hint">אפשר לגרור כרטיס כדי לשנות את הסדר, או להשתמש בחצים.</p> : null}
      </main>

      {fileDrag && storage ? (
        <div className="adm-veil" aria-hidden="true">
          <span>{I.upload(40)}</span>
          <b>שחררו כאן להעלאה ל{active.label}</b>
        </div>
      ) : null}

      {viewing ? (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="תצוגה" onClick={() => setViewing(null)}>
          <button type="button" className="adm-x" onClick={() => setViewing(null)} aria-label="סגירה">{I.close()}</button>
          <div className="adm-view" onClick={(e) => e.stopPropagation()}>
            {viewing.kind === "video" ? <video src={viewing.src} controls autoPlay playsInline /> : <img src={viewing.src} alt={viewing.caption} />}
            {viewing.caption ? <p>{viewing.caption}</p> : null}
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="adm-modal" role="alertdialog" aria-modal="true" aria-label="אישור מחיקה" onClick={() => setDeleting(null)}>
          <div className="adm-card adm-confirm" onClick={(e) => e.stopPropagation()}>
            <span className="adm-confirm-m">
              {deleting.kind === "video" ? <video src={`${deleting.src}#t=0.1`} muted playsInline preload="metadata" /> : <img src={deleting.src} alt="" />}
            </span>
            <h2>למחוק את {deleting.kind === "video" ? "הסרטון" : "התמונה"}?</h2>
            <p>הקובץ יימחק גם מהאתר ולא ניתן יהיה לשחזר אותו.</p>
            <div className="adm-confirm-b">
              <button type="button" className="adm-btn danger" onClick={() => void confirmDelete()}>מחיקה</button>
              <button type="button" className="adm-btn ghost" onClick={() => setDeleting(null)} autoFocus>ביטול</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="adm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <span key={t.id} className={`adm-toast${t.bad ? " bad" : ""}`}>{t.bad ? null : I.check()}{t.text}</span>
        ))}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));
  const [notice, setNotice] = useState("");

  // Not for search engines, and its own tab title.
  useEffect(() => {
    const before = document.title;
    document.title = "ניהול מדיה · לשון הרע לא מדבר אליי";
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
      document.title = before;
    };
  }, []);

  return (
    <div className="adm-root" dir="rtl" lang="he">
      {authed ? (
        <Manager onLogout={(message) => { setNotice(message ?? ""); setAuthed(false); }} />
      ) : (
        <Login onDone={() => { setNotice(""); setAuthed(true); }} notice={notice} />
      )}
    </div>
  );
}
