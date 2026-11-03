import { useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { DEFAULT_FLAGS, type Flags } from "../../lib/siteConfig";
import { Card, ConfirmDialog, SaveBar, SectionHead, Switch, errorText, same, useAdmin } from "./ui";

/** Every switch the team can flip. To add one: a key in `Flags` and a default in `DEFAULT_FLAGS`, then a line here. */
const FLAGS: Array<{ key: keyof Flags; title: string; text: string }> = [
  {
    key: "english",
    title: "גרסה באנגלית",
    text: "כשהחסם פועל, מופיע באתר מתג השפה והגרסה באנגלית. כשהוא כבוי, האתר מוצג בעברית בלבד, וקישורים לעמודים באנגלית פותחים את העמוד המקביל בעברית. מפת האתר לגוגל מתעדכנת בהתאם.",
  },
  {
    key: "shopMission",
    title: "משפט החלוקה בחנות",
    text: "כשהחסם פועל, מופיע מתחת לכותרת החנות המשפט על כך שהמכירות מאפשרות לחלק מוצרים בחינם לבתי ספר ולמוסדות חינוך. כשהוא כבוי, המשפט לא מוצג.",
  },
];

export function FlagsSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.flags);
  const saved: Flags = { ...DEFAULT_FLAGS, ...stored?.flags };
  const [draft, setDraft] = useState<Flags>(saved);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const dirty = !same(draft, saved);

  async function save() {
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("flags", draft);
      toast("ההגדרות נשמרו");
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
      await adminConfig.reset("flags");
      setDraft(DEFAULT_FLAGS);
      toast("חזרנו להגדרות המקוריות");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="adm-section">
      <SectionHead
        title="חסמים"
        text="מפעילים ומכבים תכונות של האתר בלי לפרסם גרסה חדשה. שינוי מגיע לאתר בתוך כדקה."
        onReset={custom ? () => setResetting(true) : undefined}
      />

      <Card title="תכונות">
        <ul className="adm-flags">
          {FLAGS.map((flag) => (
            <li key={flag.key}>
              <Switch on={draft[flag.key]} onChange={(on) => setDraft((d) => ({ ...d, [flag.key]: on }))} label={flag.title} />
              <p>{flag.text}</p>
              <span className={`adm-state${draft[flag.key] ? " on" : ""}`}>{draft[flag.key] ? "פועל" : "כבוי"}</span>
            </li>
          ))}
        </ul>
      </Card>

      {error ? <p className="adm-err" role="alert">{error}</p> : null}
      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setError(""); }} />
      {resetting ? <ConfirmDialog title="לחזור להגדרות המקוריות?" text="כל החסמים יחזרו למצב שבו האתר נשלח: אנגלית ומשפט החלוקה בחנות כבויים." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
