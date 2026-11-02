import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ACCEPT, MAX_PHOTO, MAX_VIDEO, adminApi, adminToken, uploadMedia, type AdminList, type MediaWorld } from "../../lib/media";
import { usePageTitle } from "../ui";

const WORLDS: Array<{ key: MediaWorld; label: string }> = [
  { key: "idf", label: "צה״ל" },
  { key: "ambassadors", label: "שגרירים" },
];

const ERRORS: Record<string, string> = {
  wrong_password: "הסיסמה שגויה.",
  too_many_attempts: "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה.",
  storage_not_configured: "האחסון עדיין לא מחובר.",
  unsupported_type: "סוג הקובץ לא נתמך.",
  too_large: "הקובץ גדול מדי.",
  upload_failed: "ההעלאה נכשלה. נסו שוב.",
};

const errorText = (err: unknown) => ERRORS[err instanceof Error ? err.message : ""] ?? "משהו השתבש. נסו שוב.";

type Upload = { id: number; name: string; progress: number; error?: string };

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    <form className="adm-login" onSubmit={submit} dir="rtl">
      <h1 className="disp">ניהול מדיה</h1>
      <div className="fld">
        <label htmlFor="adm-pass">סיסמה</label>
        <input id="adm-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error ? <p className="ferr on" role="alert">{error}</p> : null}
      <button className="btn btn-red" type="submit" disabled={busy || !password}><span>{busy ? "נכנסים…" : "כניסה"}</span></button>
    </form>
  );
}

function Manager({ onLogout }: { onLogout: () => void }) {
  const [world, setWorld] = useState<MediaWorld>("idf");
  const [data, setData] = useState<AdminList | null>(null);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const counter = useRef(0);

  const load = useCallback(async (w: MediaWorld) => {
    try {
      setData(await adminApi.list(w));
      setError("");
    } catch (err) {
      if (!adminToken.get()) onLogout();
      else setError(errorText(err));
    }
  }, [onLogout]);

  useEffect(() => {
    setData(null);
    void load(world);
  }, [world, load]);

  async function send(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      const id = (counter.current += 1);
      const patch = (next: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...next } : u)));
      const isPhoto = file.type.startsWith("image/");
      setUploads((list) => [...list, { id, name: file.name, progress: 0 }]);
      if (file.size > (isPhoto ? MAX_PHOTO : MAX_VIDEO)) {
        patch({ error: `הקובץ גדול מדי (עד ${isPhoto ? "10" : "150"}MB).` });
        continue;
      }
      try {
        await uploadMedia(world, file, (progress) => patch({ progress }));
        setUploads((list) => list.filter((u) => u.id !== id));
        await load(world);
      } catch (err) {
        patch({ error: errorText(err) });
      }
    }
  }

  async function move(index: number, by: number) {
    if (!data) return;
    const items = [...data.items];
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setData({ ...data, items });
    try {
      await adminApi.reorder(world, items.map((i) => i.id));
    } catch (err) {
      setError(errorText(err));
      void load(world);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("למחוק? אי אפשר לשחזר.")) return;
    setData((d) => (d ? { ...d, items: d.items.filter((i) => i.id !== id) } : d));
    try {
      await adminApi.remove(id);
    } catch (err) {
      setError(errorText(err));
      void load(world);
    }
  }

  async function saveCaption(id: string, caption: string, before: string) {
    if (caption === before) return;
    try {
      await adminApi.setCaption(id, caption);
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="adm" dir="rtl">
      <div className="adm-top">
        <h1 className="disp">ניהול תמונות וסרטונים</h1>
        <button type="button" className="tag-clear" onClick={() => { adminToken.set(null); onLogout(); }}>יציאה</button>
      </div>

      <div className="adm-tabs" role="tablist" aria-label="חלק באתר">
        {WORLDS.map((w) => (
          <button key={w.key} type="button" role="tab" aria-selected={world === w.key} className={`chip${world === w.key ? " on" : ""}`} onClick={() => setWorld(w.key)}>{w.label}</button>
        ))}
      </div>

      {data && !data.storage ? <p className="adm-warn" role="alert">האחסון עדיין לא מחובר, ולכן אי אפשר להעלות קבצים.</p> : null}
      {error ? <p className="ferr on" role="alert">{error}</p> : null}

      <label className="adm-drop">
        <input type="file" multiple accept={ACCEPT} onChange={(e) => { void send(e.target.files); e.target.value = ""; }} disabled={data ? !data.storage : true} />
        <span><b>הוספת תמונות או סרטונים</b><small>תמונה עד 10MB (JPG, PNG, WebP). סרטון עד 150MB (MP4, WebM, MOV).</small></span>
      </label>

      {uploads.length ? (
        <ul className="adm-up" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id}>
              <span dir="auto">{u.name}</span>
              {u.error ? <b className="bad">{u.error}</b> : <span className="adm-bar"><span style={{ width: `${Math.round(u.progress * 100)}%` }} /></span>}
              {u.error ? <button type="button" className="tag-clear" onClick={() => setUploads((l) => l.filter((x) => x.id !== u.id))}>הסרה</button> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!data ? <p>טוענים…</p> : data.items.length === 0 ? (
        <p className="adm-empty">עוד לא הועלו קבצים. עד שיועלו, באתר מוצגים קבצי הדוגמה.</p>
      ) : (
        <ul className="adm-list">
          {data.items.map((item, i) => (
            <li key={item.id}>
              <span className="adm-th">
                {item.kind === "video" ? <video src={item.src} muted preload="metadata" playsInline /> : <img src={item.src} alt="" loading="lazy" />}
                <small>{item.kind === "video" ? "סרטון" : "תמונה"}</small>
              </span>
              <input className="adm-cap" defaultValue={item.caption} placeholder="כיתוב (לא חובה)" maxLength={300} aria-label="כיתוב" onBlur={(e) => void saveCaption(item.id, e.target.value, item.caption)} />
              <span className="adm-act">
                <button type="button" className="iconbtn" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="הזזה למעלה">↑</button>
                <button type="button" className="iconbtn" onClick={() => void move(i, 1)} disabled={i === data.items.length - 1} aria-label="הזזה למטה">↓</button>
                <button type="button" className="tag-clear" onClick={() => void remove(item.id)}>מחיקה</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminPage() {
  usePageTitle("ניהול מדיה");
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));

  // Not for search engines.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <section className="page-admin">
      <div className="wrap">{authed ? <Manager onLogout={() => setAuthed(false)} /> : <Login onDone={() => setAuthed(true)} />}</div>
    </section>
  );
}
