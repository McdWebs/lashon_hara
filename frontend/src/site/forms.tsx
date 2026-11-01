import { Drawer } from "@mui/material";
import { useCallback, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { t, Link } from "./i18n";
import { track, type AnalyticsEvent } from "../lib/analytics";
import { submitForm } from "../lib/forms";
import { Icon, OkMark } from "./ui";

export type FieldKind = "text" | "email" | "tel" | "num" | "check" | "choice";
export type Rule = { required?: boolean; kind?: FieldKind; active?: (values: Values) => boolean };
export type Values = Record<string, string>;

const REQUIRED = "שדה חובה";

const COMPLETED_EVENT: Record<string, AnalyticsEvent> = {
  school: "school_contact_completed",
  ambassador: "ambassador_application_completed",
  donate: "donation_started",
};

/** Israeli mobile and landline numbers, with or without +972, spaces or dashes. */
export function isIsraeliPhone(value: string) {
  return /^(?:\+972|0)(?:[23489]\d{7}|[57]\d{8})$/.test(value.replace(/[\s\-()]/g, ""));
}

export function fieldError(value: string, rule: Rule): string {
  const v = value.trim();
  if (rule.kind === "check") return rule.required && !v ? t("יש לאשר כדי להמשיך") : "";
  if (rule.kind === "choice") return rule.required && !v ? t("יש לבחור אפשרות") : "";
  if (!v) return rule.required ? t(REQUIRED) : "";
  if (rule.kind === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return t("יש להזין כתובת מייל תקינה");
  if (rule.kind === "tel" && !isIsraeliPhone(v)) return t("יש להזין מספר טלפון תקין");
  if (rule.kind === "num" && !/^\d{1,5}$/.test(v)) return t("יש להזין מספר");
  return "";
}

type Options = {
  kind?: string;
  initial?: Values;
  /** Replaces the default send to /api/forms. Throw to show a failure and keep what was typed. */
  send?: (values: Values) => Promise<void>;
  onSent?: (values: Values) => void;
  toPayload?: (values: Values) => Record<string, unknown>;
};

export function useSiteForm(rules: Record<string, Rule>, options: Options = {}) {
  const [values, setValues] = useState<Values>(options.initial ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const sending = useRef(false);
  const honey = useRef<HTMLInputElement>(null);
  // Several forms can share a page, so ids are unique per form.
  const uid = useId();

  const isActive = (key: string, current: Values) => rules[key]?.active?.(current) ?? true;

  const set = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  }, []);

  const check = (key: string, current = values) => {
    const msg = isActive(key, current) ? fieldError(current[key] ?? "", rules[key] ?? {}) : "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
    return msg;
  };

  const field = (key: string) => ({
    id: `${uid}-${key}`,
    name: key,
    value: values[key] ?? "",
    error: errors[key] ?? "",
    required: Boolean(rules[key]?.required),
    onChange: (value: string) => set(key, value),
    onBlur: () => {
      if ((values[key] ?? "").trim() || errors[key]) check(key);
    },
  });

  const reset = (next: Values = {}) => {
    setValues(next);
    setErrors({});
    setDone(false);
    setFailed(null);
    setInvalid(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending.current) return;
    const bad = Object.keys(rules).filter((key) => check(key));
    const firstBad = bad[0];
    setInvalid(Boolean(firstBad));
    if (firstBad) {
      const el = document.getElementById(`${uid}-${firstBad}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    sending.current = true;
    setBusy(true);
    setFailed(null);
    try {
      if (honey.current?.value) {
        setDone(true);
        return;
      }
      if (options.send) {
        await options.send(values);
      } else {
        const payload = options.toPayload ? options.toPayload(values) : values;
        const result = await submitForm(options.kind ?? "contact", window.location.pathname, payload);
        if (!result.ok) throw new Error(t("השליחה לא הצליחה. מה שכתבתם נשמר — נסו שוב."));
        const event = options.kind ? COMPLETED_EVENT[options.kind] : undefined;
        if (event) track(event);
        setDone(true);
      }
      options.onSent?.(values);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : t("משהו השתבש. נסו שוב."));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  return { values, set, field, reset, onSubmit, busy, done, failed, invalid, honey, setFailed };
}

export type SiteForm = ReturnType<typeof useSiteForm>;
type FieldProps = ReturnType<SiteForm["field"]>;

export function Field({ f, label, type = "text", mode, auto, rows, note, readOnly, dir }: {
  f: FieldProps;
  label: string;
  type?: "text" | "email" | "tel";
  mode?: "tel" | "email" | "numeric";
  auto?: string;
  rows?: number;
  note?: string;
  readOnly?: boolean;
  dir?: "ltr" | "rtl";
}) {
  const shared = {
    id: f.id,
    name: f.name,
    value: f.value,
    readOnly,
    dir,
    "aria-invalid": f.error ? true : undefined,
    "aria-describedby": `${f.id}-err`,
    "aria-required": f.required || undefined,
    onBlur: f.onBlur,
    onChange: (e: { target: { value: string } }) => f.onChange(e.target.value),
  };
  return (
    <div className={`fld${readOnly ? " ro" : ""}${f.error ? " bad" : ""}`}>
      <label htmlFor={f.id}>
        {label}
        {f.required ? <span className="req" aria-hidden="true"> *</span> : null}
      </label>
      {rows ? <textarea rows={rows} {...shared} /> : <input type={type} inputMode={mode} autoComplete={auto} {...shared} />}
      {note ? <span className="fnote">{note}</span> : null}
      <span className="err" id={`${f.id}-err`} role="alert">{f.error}</span>
    </div>
  );
}

export function Check({ f, children }: { f: FieldProps; children: ReactNode }) {
  return (
    <label className={`chk${f.error ? " bad" : ""}`}>
      <input
        id={f.id}
        type="checkbox"
        name={f.name}
        checked={Boolean(f.value)}
        aria-describedby={`${f.id}-err`}
        onChange={(e) => f.onChange(e.target.checked ? "1" : "")}
      />
      <span className="box" aria-hidden="true"><Icon.ok /></span>
      <span>{children}{f.required ? " *" : ""}</span>
      <span className="err" id={`${f.id}-err`} role="alert">{f.error}</span>
    </label>
  );
}

export function Toggle({ f, children }: { f: FieldProps; children: ReactNode }) {
  return (
    <label className="tgl">
      <input id={f.id} type="checkbox" name={f.name} checked={Boolean(f.value)} onChange={(e) => f.onChange(e.target.checked ? "1" : "")} />
      <span className="tg" aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}

export function Choice({ f, label, options }: { f: FieldProps; label: string; options: Array<{ value: string; label: string; disabled?: boolean }> }) {
  return (
    <>
      <div id={f.id} className={`seg${f.error ? " bad" : ""}`} role="radiogroup" aria-label={label} tabIndex={-1}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            className={`sg${f.value === o.value ? " on" : ""}`}
            aria-checked={f.value === o.value}
            aria-disabled={o.disabled || undefined}
            onClick={() => {
              if (!o.disabled) f.onChange(o.value);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      {f.error ? <span className="err on" role="alert">{f.error}</span> : null}
    </>
  );
}

export function Reveal({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={`reveal${open ? " open" : ""}`} aria-hidden={!open}>
      <div><div>{open ? children : null}</div></div>
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button type="submit" className={`btn btn-red sub${busy ? " busy" : ""}`} aria-busy={busy}>
      <span className="sl"><span className="s1">{children}</span><span className="s2">{t("שולחים…")}</span></span>
      <span className="spin" aria-hidden="true" />
    </button>
  );
}

/** Form frame shared by all four forms: consent line, errors, loading state, and the thank-you in place of the form. */
export function FormShell({ form, submitLabel, thanksTitle, thanksText, children, noConsent }: {
  form: SiteForm;
  submitLabel: string;
  thanksTitle?: string;
  thanksText?: string;
  children: ReactNode;
  noConsent?: boolean;
}) {
  if (form.done) {
    return (
      <div className="thanks on" tabIndex={-1} ref={(el) => el?.focus()}>
        <OkMark />
        <span className="thanks-t">{thanksTitle}</span>
        <span className="thanks-x">{thanksText}</span>
      </div>
    );
  }
  return (
    <form noValidate onSubmit={form.onSubmit} data-form="1">
      {children}
      <input ref={form.honey} className="honey" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {noConsent ? null : (
        <p className="consent">{t("בשליחת הטופס אתם מאשרים את")}{" "}<Link to="/terms">{t("מדיניות הפרטיות")}</Link>.</p>
      )}
      {form.invalid ? <p className="ferr on" role="alert">{t("נא לתקן את השדות המסומנים.")}</p> : null}
      {form.failed ? <p className="ferr on" role="alert">{form.failed}</p> : null}
      <SubmitButton busy={form.busy}>{submitLabel}</SubmitButton>
    </form>
  );
}

export function Panel({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      disablePortal
      slotProps={{ paper: { className: "pnl-paper", role: "dialog", "aria-label": title } }}
    >
      <div className="pnl-h">
        <h2>{title}</h2>
        <button className="iconbtn" onClick={onClose} aria-label={t("סגירה")}><Icon.close /></button>
      </div>
      <div className="pnl-b">{children}</div>
    </Drawer>
  );
}
