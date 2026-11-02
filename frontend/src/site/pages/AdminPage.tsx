import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { adminApi, adminToken } from "../../lib/media";
import { CalendarSection } from "../admin/CalendarSection";
import { CounterSection } from "../admin/CounterSection";
import { FlagsSection } from "../admin/FlagsSection";
import { LecturesSection } from "../admin/LecturesSection";
import { MediaSection } from "../admin/MediaSection";
import { ShopSection } from "../admin/ShopSection";
import { AdminContext, Brand, ERRORS, I, errorText, type AdminTools } from "../admin/ui";
import "../admin.css";

const SECTIONS = [
  { key: "media", label: "תמונות וסרטונים", page: "/activity/idf" },
  { key: "lectures", label: "הרצאות", page: "/activity" },
  { key: "calendar", label: "יומן ותאריכים", page: "/activity" },
  { key: "shop", label: "חנות", page: "/shop" },
  { key: "counter", label: "מונה צמידים", page: "/activity" },
  { key: "flags", label: "דגלי תכונות", page: "/" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

const startSection = (): SectionKey => SECTIONS.find((s) => `#${s.key}` === window.location.hash)?.key ?? "media";

type Toast = { id: number; text: string; bad?: boolean };

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
          <h1>ניהול האתר</h1>
          <p>כניסה לצוות. כאן מעדכנים תמונות, הרצאות, יומן וחנות.</p>
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
  const [section, setSection] = useState<SectionKey>(startSection);
  const [stored, setStored] = useState<StoredConfig | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((text: string, bad = false) => {
    const id = (counter.current += 1);
    setToasts((list) => [...list, { id, text, bad }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), bad ? 5000 : 2600);
  }, []);

  const fail = useCallback(
    (err: unknown) => {
      if (!adminToken.get() || (err instanceof Error && err.message === "unauthorized")) {
        adminToken.set(null);
        onLogout(ERRORS.unauthorized);
      } else toast(errorText(err), true);
    },
    [onLogout, toast],
  );

  const reload = useCallback(async () => {
    try {
      setStored(await adminConfig.get());
    } catch (err) {
      fail(err);
    }
  }, [fail]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const tools = useMemo<AdminTools>(() => ({ toast, fail }), [toast, fail]);
  const active = SECTIONS.find((s) => s.key === section)!;

  function choose(key: SectionKey) {
    setSection(key);
    window.history.replaceState(null, "", `#${key}`);
    window.scrollTo({ top: 0 });
  }

  const loading = <p className="adm-loading">טוענים…</p>;

  return (
    <AdminContext.Provider value={tools}>
      <div className="adm-app">
        <header className="adm-bar">
          <div className="adm-bar-in">
            <Brand />
            <span className="adm-bar-t">ניהול האתר</span>
            <span className="adm-bar-r">
              <a className="adm-link" href={active.page} target="_blank" rel="noreferrer"><span>לצפייה באתר</span>{I.ext()}</a>
              <button type="button" className="adm-link" onClick={() => { adminToken.set(null); onLogout(); }}>יציאה</button>
            </span>
          </div>
          <nav className="adm-nav" aria-label="חלקי הניהול">
            <div className="adm-nav-in">
              {SECTIONS.map((s) => (
                <button key={s.key} type="button" className={`adm-nav-i${section === s.key ? " on" : ""}`} aria-current={section === s.key ? "page" : undefined} onClick={() => choose(s.key)}>{s.label}</button>
              ))}
            </div>
          </nav>
        </header>

        <main className="adm-main">
          {section === "media" ? <MediaSection /> : null}
          {section === "lectures" ? (stored ? <LecturesSection stored={stored} onSaved={() => void reload()} /> : loading) : null}
          {section === "calendar" ? (stored ? <CalendarSection stored={stored} onSaved={() => void reload()} /> : loading) : null}
          {section === "shop" ? (stored ? <ShopSection stored={stored} onSaved={() => void reload()} /> : loading) : null}
          {section === "counter" ? (stored ? <CounterSection stored={stored} onSaved={() => void reload()} /> : loading) : null}
          {section === "flags" ? (stored ? <FlagsSection stored={stored} onSaved={() => void reload()} /> : loading) : null}
        </main>

        <div className="adm-toasts" aria-live="polite">
          {toasts.map((t) => (
            <span key={t.id} className={`adm-toast${t.bad ? " bad" : ""}`}>{t.bad ? null : I.check()}{t.text}</span>
          ))}
        </div>
      </div>
    </AdminContext.Provider>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(adminToken.get()));
  const [notice, setNotice] = useState("");

  // Not for search engines, and its own tab title.
  useEffect(() => {
    const before = document.title;
    document.title = "ניהול האתר · לשון הרע לא מדבר אליי";
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
