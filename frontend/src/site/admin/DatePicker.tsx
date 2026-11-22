import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { I } from "./ui";

const SHORT_DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (iso: string) => new Date(`${iso}T12:00:00`);
const addDays = (iso: string, n: number) => {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d);
};
const label = (iso: string) => parse(iso).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

/**
 * A date field that opens a month grid under it. Days before `min` cannot be picked, `marked` days (already used) are shown and skipped,
 * and `dim` weekdays are softened but still pickable. Arrow keys move by day and week, Enter picks, Escape closes.
 */
export function DatePicker({ value, onChange, min, marked, dim, ariaLabel, placeholder = "בחירת תאריך" }: {
  value: string;
  onChange: (iso: string) => void;
  min: string;
  marked?: Set<string>;
  dim?: number[];
  ariaLabel: string;
  placeholder?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(value || min);
  const [month, setMonth] = useState(() => (value || min).slice(0, 7));

  const first = parse(`${month}-01`);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: Array<number | null> = [...Array.from({ length: first.getDay() }, () => null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const today = isoOf(new Date());
  const earliest = min.slice(0, 7);

  function show() {
    const start = value || min;
    setCursor(start);
    setMonth(start.slice(0, 7));
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function pick(iso: string) {
    if (iso < min || marked?.has(iso)) return;
    onChange(iso);
    close();
  }

  function go(iso: string) {
    if (iso < min) return;
    setCursor(iso);
    setMonth(iso.slice(0, 7));
  }

  function shiftMonth(by: number) {
    const d = new Date(first.getFullYear(), first.getMonth() + by, 1);
    const next = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    if (next < earliest) return;
    setMonth(next);
    const day = Math.min(Number(cursor.slice(8)), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
    setCursor(`${next}-${pad(day)}`);
  }

  // Make sure the whole grid is on screen when it opens (the field can sit near the bottom of a phone screen).
  useEffect(() => {
    if (open) root.current?.querySelector(".adm-dp-pop")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>(`[data-iso="${cursor}"]`)?.focus({ preventScroll: true });
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, cursor, month]);

  // The grid reads right to left, so "left" is the next day.
  function onGridKey(e: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: 7, ArrowUp: -7 };
    if (e.key in moves) go(addDays(cursor, moves[e.key]));
    else if (e.key === "PageDown") shiftMonth(1);
    else if (e.key === "PageUp") shiftMonth(-1);
    else if (e.key === "Escape") close();
    else return;
    e.preventDefault();
  }

  return (
    <div className="adm-dp" ref={root}>
      <button
        ref={button}
        type="button"
        className={`adm-in adm-dp-b${value ? "" : " empty"}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-pop`}
        onClick={() => (open ? close(false) : show())}
      >
        <span>{value ? label(value) : placeholder}</span>
        {I.calendar()}
      </button>

      {open ? (
        <div className="adm-dp-pop" id={`${id}-pop`} role="dialog" aria-label={ariaLabel} onKeyDown={onGridKey}>
          <div className="adm-dp-h">
            <button type="button" onClick={() => shiftMonth(-1)} disabled={month <= earliest} aria-label="החודש הקודם">{I.right()}</button>
            <b aria-live="polite">{first.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</b>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="החודש הבא">{I.left()}</button>
          </div>
          <div className="adm-dp-g" role="grid">
            {SHORT_DAYS.map((d) => <span key={d} className="adm-dp-w" role="columnheader">{d}</span>)}
            {cells.map((day, i) => {
              if (day === null) return <span key={`e${i}`} />;
              const iso = `${month}-${pad(day)}`;
              const off = iso < min;
              const used = Boolean(marked?.has(iso));
              const weekday = (first.getDay() + day - 1) % 7;
              return (
                <button
                  key={iso}
                  type="button"
                  data-iso={iso}
                  tabIndex={iso === cursor ? 0 : -1}
                  disabled={off || used}
                  aria-label={`${label(iso)}${used ? " (כבר חסום)" : ""}`}
                  aria-pressed={iso === value}
                  className={`adm-dp-d${iso === value ? " sel" : ""}${iso === today ? " today" : ""}${used ? " used" : ""}${dim?.includes(weekday) ? " dim" : ""}`}
                  onClick={() => pick(iso)}
                >{day}</button>
              );
            })}
          </div>
          <div className="adm-dp-f">
            <button type="button" className="adm-link dark" onClick={() => go(today < min ? min : today)}>היום</button>
            {value ? <button type="button" className="adm-link dark" onClick={() => { onChange(""); close(); }}>ניקוי</button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
