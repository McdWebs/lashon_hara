import { useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { DEFAULT_NEW_COLLECTION, DEFAULT_SHOP, type NewCollectionConfig } from "../../lib/siteConfig";
import { Card, ConfirmDialog, SaveBar, SectionHead, errorText, same, useAdmin } from "./ui";

/** The block on the home page that shows the new products: its title, and which products it shows. */
export function NewCollectionSection({ stored, onSaved }: { stored: StoredConfig | null; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const custom = Boolean(stored?.newCollection);
  const saved: NewCollectionConfig = stored?.newCollection ?? DEFAULT_NEW_COLLECTION;
  const [draft, setDraft] = useState<NewCollectionConfig>(saved);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const collections = (stored?.shop ?? DEFAULT_SHOP).collections.filter((c) => c.key !== "all");
  const dirty = !same(draft, saved);
  const valid = draft.he.trim() !== "" && draft.en.trim() !== "";

  async function save() {
    setError("");
    setSaving(true);
    try {
      await adminConfig.save("newCollection", { ...draft, he: draft.he.trim(), en: draft.en.trim() });
      toast("הקולקציה החדשה נשמרה");
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
      await adminConfig.reset("newCollection");
      setDraft(DEFAULT_NEW_COLLECTION);
      toast("חזרנו להגדרה המקורית");
      onSaved();
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="adm-section">
      <SectionHead title="הקולקציה החדשה" text="הבלוק שמופיע בעמוד הבית עם המוצרים החדשים: אפשר לשנות את הכותרת ולבחור אילו מוצרים יוצגו בו." onReset={custom ? () => setResetting(true) : undefined} resetText="חזרה להגדרה המקורית" />

      <Card title="הכותרת">
        <div className="adm-field">
          <label htmlFor="nc-he">בעברית</label>
          <input id="nc-he" className="adm-in" value={draft.he} maxLength={60} onChange={(e) => setDraft({ ...draft, he: e.target.value })} />
        </div>
        <div className="adm-field">
          <label htmlFor="nc-en">באנגלית</label>
          <input id="nc-en" className="adm-in" dir="ltr" value={draft.en} maxLength={60} onChange={(e) => setDraft({ ...draft, en: e.target.value })} />
        </div>
      </Card>

      <Card title="אילו מוצרים מוצגים" hint="שמונה מוצרים, מהחדש לישן.">
        <div className="adm-field">
          <label htmlFor="nc-src">הקטגוריה</label>
          <select id="nc-src" className="adm-in" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
            <option value="">המוצרים החדשים ביותר בחנות</option>
            {collections.map((c) => <option key={c.key} value={c.key}>{c.he}</option>)}
          </select>
        </div>
        {error ? <p className="adm-err" role="alert">{error}</p> : null}
      </Card>

      <SaveBar dirty={dirty && valid} saving={saving} onSave={() => void save()} onDiscard={() => { setDraft(saved); setError(""); }} />
      {resetting ? <ConfirmDialog title="לחזור להגדרה המקורית?" text="הכותרת והקטגוריה יחזרו למה שהיה באתר מההתחלה." confirmLabel="חזרה" onConfirm={() => void reset()} onCancel={() => setResetting(false)} /> : null}
    </div>
  );
}
