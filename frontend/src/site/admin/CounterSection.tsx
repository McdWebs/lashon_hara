import { useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { DEFAULT_COUNTER } from "../../lib/siteConfig";
import { Card, ConfirmDialog, SaveBar, SectionHead, Switch, errorText, useAdmin } from "./ui";

export function CounterSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.counter);
  const saved = stored?.counter ? stored.counter.value : DEFAULT_COUNTER;
  const [sample, setSample] = useState(saved === null);
  const [text, setText] = useState(saved === null ? "" : String(saved));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const value = sample ? null : /^\d{1,10}$/.test(text.replace(/[,\s]/g, "")) ? Number(text.replace(/[,\s]/g, "")) : undefined;
  const dirty = value !== saved;

  async function save() {
    if (value === undefined) {
      setError("יש להזין מספר שלם.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("counter", { value });
      toast("המספר נשמר");
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
      await adminConfig.reset("counter");
      setSample(false);
      setText(String(DEFAULT_COUNTER));
      toast("חזרנו למספר המקורי");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="adm-section">
      <SectionHead title="מונה הצמידים" text="המספר שמופיע בראש עמוד הפעילות: כמה צמידים חולקו חינם." onReset={custom ? () => setResetting(true) : undefined} resetText="חזרה למספר המקורי" />

      <Card title="המספר באתר">
        <div className="adm-counter">
          <div className="adm-field">
            <label htmlFor="adm-count">כמה צמידים חולקו</label>
            <input id="adm-count" className="adm-in big" inputMode="numeric" dir="ltr" value={text} disabled={sample} onChange={(e) => { setText(e.target.value); setError(""); }} />
          </div>
          <div className="adm-preview" aria-live="polite">
            <small>כך זה נראה באתר</small>
            <b dir="ltr">{value === null ? "000,000" : value === undefined ? "—" : value.toLocaleString("en-US")}</b>
          </div>
        </div>
        <Switch on={sample} onChange={setSample} label="להציג מספר לדוגמה (000,000) עד שיש מספר סופי" />
        {error ? <p className="adm-err" role="alert">{error}</p> : null}
      </Card>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} onDiscard={() => { setSample(saved === null); setText(saved === null ? "" : String(saved)); setError(""); }} />
      {resetting ? <ConfirmDialog title="לחזור למספר המקורי?" text="המספר שהזנתם יוחלף במספר שהיה באתר מההתחלה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
