import { useMemo, useState } from "react";
import { adminConfig, type CalendarTest, type StoredConfig } from "../../lib/adminConfig";
import { DEFAULT_CALENDAR, type CalendarSettings } from "../../lib/siteConfig";
import { Card, ConfirmDialog, I, SaveBar, SectionHead, Switch, errorText, same, useAdmin } from "./ui";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DEFAULT: CalendarSettings = { icsUrl: "", closedWeekdays: DEFAULT_CALENDAR.closedWeekdays, monthsAhead: DEFAULT_CALENDAR.monthsAhead, blockedDates: [] };

const SHORT_DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** A month of the booking calendar as visitors will see it: taken, blocked, closed and free days. */
function Preview({ taken, draft, today }: { taken: string[]; draft: CalendarSettings; today: string }) {
  const [offset, setOffset] = useState(0);
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const base = new Date(`${today}T12:00:00`);
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const y = first.getFullYear();
  const m = first.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  const last = new Date(base.getFullYear(), base.getMonth() + draft.monthsAhead, base.getDate()).toISOString().slice(0, 10);
  const cells: Array<number | null> = [...Array.from({ length: first.getDay() }, () => null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const blocked = new Set(draft.blockedDates);

  function state(iso: string, weekday: number) {
    if (iso <= today || iso > last) return "off";
    if (takenSet.has(iso)) return "taken";
    if (blocked.has(iso)) return "blocked";
    if (draft.closedWeekdays.includes(weekday)) return "closed";
    return "free";
  }

  return (
    <div className="adm-cal">
      <div className="adm-cal-h">
        <button type="button" onClick={() => setOffset((o) => o - 1)} disabled={offset <= 0} aria-label="החודש הקודם">{I.right()}</button>
        <b>{first.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</b>
        <button type="button" onClick={() => setOffset((o) => o + 1)} disabled={offset >= draft.monthsAhead} aria-label="החודש הבא">{I.left()}</button>
      </div>
      <div className="adm-cal-g" role="grid">
        {SHORT_DAYS.map((d) => <span key={d} className="adm-cal-w" role="columnheader">{d}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const iso = isoOf(y, m, day);
          const st = state(iso, (first.getDay() + day - 1) % 7);
          return <span key={iso} className={`adm-cal-d ${st}`} role="gridcell" title={dayLabel(iso)}>{day}</span>;
        })}
      </div>
      <ul className="adm-cal-key">
        <li><i className="free" />פנוי</li>
        <li><i className="taken" />תפוס ביומן</li>
        <li><i className="blocked" />נחסם ידנית</li>
        <li><i className="closed" />יום סגור</li>
      </ul>
    </div>
  );
}

const dayLabel = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });

export function CalendarSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.calendar);
  const saved: CalendarSettings = stored?.calendar ?? DEFAULT;
  const [draft, setDraft] = useState<CalendarSettings>(saved);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<CalendarTest | null>(null);
  const [testError, setTestError] = useState("");
  const [newDay, setNewDay] = useState("");
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const dirty = !same(draft, saved);
  const set = (patch: Partial<CalendarSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const today = new Date().toISOString().slice(0, 10);

  async function check() {
    setTesting(true);
    setTest(null);
    setTestError("");
    try {
      setTest(await adminConfig.testCalendar(draft.icsUrl.trim()));
    } catch (err) {
      setTestError(errorText(err));
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("calendar", { ...draft, icsUrl: draft.icsUrl.trim(), blockedDates: [...new Set(draft.blockedDates)].sort() });
      toast("היומן נשמר");
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
      await adminConfig.reset("calendar");
      setDraft(DEFAULT);
      setTest(null);
      toast("חזרנו להגדרות המקוריות");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  function toggleDay(index: number, closed: boolean) {
    set({ closedWeekdays: closed ? [...draft.closedWeekdays, index].sort() : draft.closedWeekdays.filter((d) => d !== index) });
  }

  function addDay() {
    if (!newDay || draft.blockedDates.includes(newDay)) return;
    set({ blockedDates: [...draft.blockedDates, newDay].sort() });
    setNewDay("");
  }

  const upcoming = draft.blockedDates.filter((d) => d >= today);
  const past = draft.blockedDates.filter((d) => d < today);

  return (
    <div className="adm-section">
      <SectionHead
        title="יומן ותאריכים"
        text="קובעים אילו ימים אפשר להזמין לבית ספר. ימים עם אירוע ביומן מופיעים באתר כתפוסים, ובקשות שהתקבלו מהאתר מופיעות כ״התבקש״."
        onReset={custom ? () => setResetting(true) : undefined}
      />

      <Card
        title="חיבור יומן"
        hint={<>הדביקו כאן את הקישור בפורמט iCal (קובץ ‎.ics) של היומן. האתר קורא אותו כל כמה דקות ומסמן את הימים שיש בהם אירוע.</>}
      >
        <div className="adm-field">
          <label htmlFor="adm-ics">קישור ליומן</label>
          <div className="adm-inline">
            <input id="adm-ics" className="adm-in" dir="ltr" placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" value={draft.icsUrl} onChange={(e) => { set({ icsUrl: e.target.value }); setTest(null); setTestError(""); }} />
            <button type="button" className="adm-btn ghost" onClick={() => void check()} disabled={testing || !draft.icsUrl.trim()}>{testing ? "בודקים…" : "בדיקת החיבור"}</button>
          </div>
        </div>
        {test ? (
          <div className="adm-ok" role="status">
            <b>היומן מחובר.</b> נמצאו {test.events} אירועים, והם תופסים {test.totalDays} ימים. כך ייראה היומן באתר:
          </div>
        ) : null}
        {test ? <Preview taken={test.days} draft={draft} today={today} /> : null}
        {testError ? <p className="adm-err" role="alert">{testError}</p> : null}

        <details className="adm-help">
          <summary>איפה מוצאים את הקישור?</summary>
          <div>
            <p><b>Google Calendar:</b> בדפדפן, לוחצים על שלוש הנקודות ליד היומן ← <i>הגדרות ושיתוף</i> ← <i>שילוב יומן</i> ← מעתיקים את <i>הכתובת הסודית בפורמט iCal</i>.</p>
            <p><b>Apple Calendar:</b> לוחצים על סמל השיתוף ליד היומן ← <i>יומן ציבורי</i> ← מעתיקים את הקישור. קישור שמתחיל ב‎-webcal מתאים גם הוא.</p>
            <p>הקישור הסודי של גוגל נותן גישה לקריאת היומן, ולכן אל תשתפו אותו עם אחרים.</p>
          </div>
        </details>
      </Card>

      <Card title="ימים סגורים בשבוע" hint="בימים האלה אי אפשר להזמין הרצאה.">
        <div className="adm-sws">
          {DAYS.map((name, i) => (
            <Switch key={name} on={draft.closedWeekdays.includes(i)} onChange={(on) => toggleDay(i, on)} label={name} />
          ))}
        </div>
      </Card>

      <Card title="כמה חודשים קדימה אפשר להזמין">
        <div className="adm-field narrow">
          <label htmlFor="adm-months" className="sr">מספר חודשים</label>
          <select id="adm-months" className="adm-in" value={draft.monthsAhead} onChange={(e) => set({ monthsAhead: Number(e.target.value) })}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n === 1 ? "חודש אחד" : `${n} חודשים`}</option>)}
          </select>
        </div>
      </Card>

      <Card title="חסימת תאריכים ידנית" hint="ימים שאין בהם אירוע ביומן, אבל אי אפשר להזמין בהם: חופשה, חג, יום עמוס.">
        <div className="adm-inline">
          <input type="date" className="adm-in" value={newDay} min={today} onChange={(e) => setNewDay(e.target.value)} aria-label="תאריך לחסימה" />
          <button type="button" className="adm-btn ghost" onClick={addDay} disabled={!newDay}>{I.plus()}<span>חסימה</span></button>
        </div>
        {upcoming.length === 0 ? <p className="adm-hint">אין ימים חסומים.</p> : (
          <ul className="adm-chips">
            {upcoming.map((d) => (
              <li key={d}>
                <span>{dayLabel(d)}</span>
                <button type="button" onClick={() => set({ blockedDates: draft.blockedDates.filter((x) => x !== d) })} aria-label={`הסרת החסימה: ${dayLabel(d)}`}>{I.close()}</button>
              </li>
            ))}
          </ul>
        )}
        {past.length ? <button type="button" className="adm-reset" onClick={() => set({ blockedDates: upcoming })}>ניקוי תאריכים שכבר עברו ({past.length})</button> : null}
      </Card>

      {error ? <p className="adm-err" role="alert">{error}</p> : null}
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setTest(null); setError(""); }} />
      {resetting ? <ConfirmDialog title="לחזור להגדרות המקוריות?" text="החיבור ליומן והתאריכים החסומים יימחקו. שישי ושבת יחזרו להיות סגורים, ויהיה אפשר להזמין שלושה חודשים קדימה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
