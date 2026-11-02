import { createContext, useContext, type ReactNode } from "react";

export const ERRORS: Record<string, string> = {
  wrong_password: "הסיסמה שגויה.",
  too_many_attempts: "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה.",
  storage_not_configured: "האחסון עדיין לא מחובר.",
  unsupported_type: "סוג הקובץ לא נתמך.",
  too_large: "הקובץ גדול מדי.",
  upload_failed: "ההעלאה נכשלה. נסו שוב.",
  unauthorized: "פג תוקף הכניסה. יש להיכנס מחדש.",
  invalid_payload: "חלק מהפרטים לא תקינים. בדקו את השדות ונסו שוב.",
  database_unavailable: "מסד הנתונים לא זמין כרגע.",
  calendar_url_invalid: "הקישור ליומן לא תקין. צריך קישור https ציבורי.",
  calendar_unreachable: "לא הצלחנו לקרוא את היומן. בדקו את הקישור.",
  calendar_too_large: "קובץ היומן גדול מדי.",
};

export const errorText = (err: unknown) => ERRORS[err instanceof Error ? err.message : ""] ?? "משהו השתבש. נסו שוב.";

/* ---------- icons ---------- */
export function Ico({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const I = {
  upload: (size?: number) => <Ico size={size}><path d="M12 16V5" /><path d="M7 10l5-5 5 5" /><path d="M5 19h14" /></Ico>,
  trash: () => <Ico><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 12h8l1-12" /></Ico>,
  close: () => <Ico><path d="M6 6l12 12" /><path d="M18 6L6 18" /></Ico>,
  play: () => <Ico size={22}><path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" /></Ico>,
  image: () => <Ico size={16}><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M5 17l5-5 4 4 2-2 3 3" /></Ico>,
  video: () => <Ico size={16}><rect x="3.5" y="6" width="12" height="12" rx="2" /><path d="M15.5 10.5l5-3v9l-5-3" /></Ico>,
  right: () => <Ico><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Ico>,
  left: () => <Ico><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></Ico>,
  up: () => <Ico><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></Ico>,
  down: () => <Ico><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></Ico>,
  plus: () => <Ico><path d="M12 5v14" /><path d="M5 12h14" /></Ico>,
  ext: () => <Ico size={18}><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M18 14v5H5V6h5" /></Ico>,
  eye: () => <Ico><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></Ico>,
  check: () => <Ico size={16}><path d="M5 12.5l4.5 4.5L19 7.5" /></Ico>,
  chevron: () => <Ico size={18}><path d="M6 9l6 6 6-6" /></Ico>,
};

export function Brand() {
  return (
    <span className="adm-brand">
      <img src="/images/site/logo.svg" alt="לשון הרע לא מדבר אליי" width="194" height="26" />
    </span>
  );
}

/* ---------- shared: toasts and errors ---------- */
export type AdminTools = {
  toast: (text: string, bad?: boolean) => void;
  /** Shows the error, or sends the person back to the sign-in when the session ended. */
  fail: (err: unknown) => void;
};

export const AdminContext = createContext<AdminTools>({ toast: () => undefined, fail: () => undefined });
export const useAdmin = () => useContext(AdminContext);

/* ---------- shared building blocks ---------- */
export function Card({ title, hint, children, actions }: { title: string; hint?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="adm-sec">
      <header className="adm-sec-h">
        <div>
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

/** Appears once something has been changed: save, or go back to what was saved. */
export function SaveBar({ dirty, saving, onSave, onDiscard }: { dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void }) {
  if (!dirty) return null;
  return (
    <div className="adm-save" role="region" aria-label="שמירת שינויים">
      <span>יש שינויים שלא נשמרו</span>
      <span className="adm-save-b">
        <button type="button" className="adm-btn ghost" onClick={onDiscard} disabled={saving}>ביטול</button>
        <button type="button" className="adm-btn primary" onClick={onSave} disabled={saving}>{saving ? "שומרים…" : "שמירה"}</button>
      </span>
    </div>
  );
}

export function SectionHead({ title, text, onReset, resetText }: { title: string; text: string; onReset?: () => void; resetText?: string }) {
  return (
    <div className="adm-head">
      <h1>{title}</h1>
      <p>{text}</p>
      {onReset ? <button type="button" className="adm-reset" onClick={onReset}>{resetText ?? "חזרה להגדרות המקוריות"}</button> : null}
    </div>
  );
}

/** A switch with a visible label. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`adm-sw${on ? " on" : ""}`} onClick={() => onChange(!on)}>
      <span className="adm-sw-t" aria-hidden="true"><i /></span>
      <span>{label}</span>
    </button>
  );
}

export function moveItem<T>(list: T[], index: number, by: number): T[] {
  const target = index + by;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function ConfirmDialog({ title, text, confirmLabel = "מחיקה", onConfirm, onCancel }: { title: string; text: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="adm-modal" role="alertdialog" aria-modal="true" aria-label={title} onClick={onCancel} onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}>
      <div className="adm-card adm-confirm" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="adm-confirm-b">
          <button type="button" className="adm-btn danger" onClick={onConfirm}>{confirmLabel}</button>
          <button type="button" className="adm-btn ghost" onClick={onCancel} autoFocus>ביטול</button>
        </div>
      </div>
    </div>
  );
}
