import { useMemo, useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { DEFAULT_LECTURES, type LectureConfig } from "../../lib/siteConfig";
import type { Program } from "../about";
import { ConfirmDialog, I, SaveBar, SectionHead, errorText, moveItem, same, useAdmin } from "./ui";

type Lang = "he" | "en";
const EMPTY: Program = { title: "", lead: "", body: [], notes: [] };

function newId() {
  return `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function clean(program: Program): Program {
  return {
    title: program.title.trim(),
    lead: program.lead.trim(),
    body: program.body.map((t) => t.trim()).filter(Boolean),
    notes: program.notes.map((t) => t.trim()).filter(Boolean),
  };
}

function ProgramFields({ value, onChange, lang }: { value: Program; onChange: (next: Program) => void; lang: Lang }) {
  const rtl = lang === "he";
  const dir = rtl ? "rtl" : "ltr";
  const set = (patch: Partial<Program>) => onChange({ ...value, ...patch });
  const list = (key: "body" | "notes", index: number, text: string) => set({ [key]: value[key].map((t, i) => (i === index ? text : t)) });

  return (
    <div className="adm-fields" dir={dir} lang={lang}>
      <div className="adm-field">
        <label>כותרת{rtl ? "" : " (באנגלית)"}</label>
        <textarea rows={2} value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder={rtl ? "למשל: הרצאה של דוד הלפרין" : "Title"} />
        <small>שורה חדשה בכותרת תופיע כשורה חדשה באתר.</small>
      </div>
      <div className="adm-field">
        <label>משפט פתיחה (לא חובה)</label>
        <textarea rows={2} value={value.lead} onChange={(e) => set({ lead: e.target.value })} />
      </div>

      <div className="adm-field">
        <label>פסקאות ההרצאה</label>
        {value.body.map((text, i) => (
          <div className="adm-li" key={i}>
            <textarea rows={4} value={text} onChange={(e) => list("body", i, e.target.value)} aria-label={`פסקה ${i + 1}`} />
            <button type="button" className="adm-ib" onClick={() => set({ body: value.body.filter((_, j) => j !== i) })} aria-label={`מחיקת פסקה ${i + 1}`}>{I.trash()}</button>
          </div>
        ))}
        <button type="button" className="adm-btn ghost small" onClick={() => set({ body: [...value.body, ""] })}>{I.plus()}<span>הוספת פסקה</span></button>
      </div>

      <div className="adm-field">
        <label>נקודות בתחתית הכרטיס</label>
        {value.notes.map((text, i) => (
          <div className="adm-li" key={i}>
            <textarea rows={2} value={text} onChange={(e) => list("notes", i, e.target.value)} aria-label={`נקודה ${i + 1}`} />
            <button type="button" className="adm-ib" onClick={() => set({ notes: value.notes.filter((_, j) => j !== i) })} aria-label={`מחיקת נקודה ${i + 1}`}>{I.trash()}</button>
          </div>
        ))}
        <button type="button" className="adm-btn ghost small" onClick={() => set({ notes: [...value.notes, ""] })}>{I.plus()}<span>הוספת נקודה</span></button>
      </div>
    </div>
  );
}

export function LecturesSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const saved: LectureConfig[] = stored?.lectures?.items ?? DEFAULT_LECTURES;
  const custom = Boolean(stored?.lectures);
  const [draft, setDraft] = useState<LectureConfig[]>(saved);
  const [open, setOpen] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("he");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<LectureConfig | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const dirty = useMemo(() => !same(draft, saved), [draft, saved]);

  function patch(id: string, next: Partial<LectureConfig>) {
    setDraft((list) => list.map((l) => (l.id === id ? { ...l, ...next } : l)));
  }

  function add() {
    const id = newId();
    setDraft((list) => [...list, { id, he: { ...EMPTY } }]);
    setOpen(id);
    setLang("he");
  }

  async function save() {
    const items = draft.map((l) => {
      const he = clean(l.he);
      const en = l.en ? clean(l.en) : null;
      return { id: l.id, he, ...(en && en.title ? { en } : {}) };
    });
    const missing = items.findIndex((l) => !l.he.title);
    if (missing >= 0) {
      setError(`להרצאה מספר ${missing + 1} חסרה כותרת בעברית.`);
      setOpen(draft[missing].id);
      setLang("he");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("lectures", { items });
      toast("ההרצאות נשמרו");
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
      await adminConfig.reset("lectures");
      setDraft(DEFAULT_LECTURES);
      toast("חזרנו להרצאות המקוריות");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="adm-section">
      <SectionHead
        title="הרצאות"
        text="ההרצאות שמופיעות בעמוד הפעילות, בלשונית בתי ספר והרצאות. מי שמזמין בוחר הרצאה ואז תאריך."
        onReset={custom ? () => setResetting(true) : undefined}
      />

      {error ? <p className="adm-err" role="alert">{error}</p> : null}

      <ol className="adm-acc">
        {draft.map((lec, i) => {
          const isOpen = open === lec.id;
          const title = lec.he.title.split("\n")[0] || "הרצאה חדשה";
          return (
            <li key={lec.id} className={`adm-acc-i${isOpen ? " open" : ""}`}>
              <div className="adm-acc-h">
                <button type="button" className="adm-acc-t" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : lec.id)}>
                  <span className="adm-no2">{i + 1}</span>
                  <span className="adm-acc-n" dir="auto">{title}</span>
                  <span className="adm-acc-c">{I.chevron()}</span>
                </button>
                <span className="adm-acc-a">
                  <button type="button" className="adm-ib" disabled={i === 0} onClick={() => setDraft((l) => moveItem(l, i, -1))} aria-label="להקדים">{I.up()}</button>
                  <button type="button" className="adm-ib" disabled={i === draft.length - 1} onClick={() => setDraft((l) => moveItem(l, i, 1))} aria-label="לאחר">{I.down()}</button>
                  <button type="button" className="adm-ib danger" onClick={() => setDeleting(lec)} aria-label="מחיקת ההרצאה">{I.trash()}</button>
                </span>
              </div>

              {isOpen ? (
                <div className="adm-acc-b">
                  <div className="adm-seg" role="tablist" aria-label="שפה">
                    <button type="button" role="tab" aria-selected={lang === "he"} className={lang === "he" ? "on" : ""} onClick={() => setLang("he")}>עברית</button>
                    <button type="button" role="tab" aria-selected={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>English</button>
                  </div>
                  {lang === "he" ? (
                    <ProgramFields lang="he" value={lec.he} onChange={(he) => patch(lec.id, { he })} />
                  ) : (
                    <>
                      <p className="adm-hint">הגרסה באנגלית לא חובה. אם משאירים אותה ריקה, באתר באנגלית תוצג הגרסה העברית.</p>
                      <ProgramFields lang="en" value={lec.en ?? EMPTY} onChange={(en) => patch(lec.id, { en })} />
                    </>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <button type="button" className="adm-btn ghost add" onClick={add}>{I.plus()}<span>הוספת הרצאה</span></button>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setError(""); }} />

      {deleting ? (
        <ConfirmDialog
          title="למחוק את ההרצאה?"
          text={`"${deleting.he.title.split("\n")[0] || "הרצאה חדשה"}" תוסר מהאתר אחרי השמירה.`}
          onConfirm={() => { setDraft((l) => l.filter((x) => x.id !== deleting.id)); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
      {resetting ? (
        <ConfirmDialog title="לחזור להרצאות המקוריות?" text="כל ההרצאות שערכתם יוחלפו בשתי ההרצאות שהיו באתר מההתחלה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} />
      ) : null}
    </div>
  );
}

