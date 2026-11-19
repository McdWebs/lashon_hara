import { useCallback, useEffect, useState } from "react";
import { adminStories, type AdminStory } from "../../lib/stories";
import { Card, ConfirmDialog, SectionHead, Switch, useAdmin } from "./ui";

const dateText = (iso: string) => new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

export function StoriesSection() {
  const { toast, fail } = useAdmin();
  const [items, setItems] = useState<AdminStory[] | null>(null);
  const [filter, setFilter] = useState<"all" | "shown" | "hidden">("all");
  const [deleting, setDeleting] = useState<AdminStory | null>(null);

  const load = useCallback(async () => {
    try {
      setItems((await adminStories.list()).items);
    } catch (err) {
      fail(err);
    }
  }, [fail]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setShown(story: AdminStory, shown: boolean) {
    setItems((list) => list?.map((s) => (s.id === story.id ? { ...s, shown } : s)) ?? null);
    try {
      await adminStories.show(story.id, shown);
      toast(shown ? "הסיפור יוצג באתר" : "הסיפור הוסתר");
    } catch (err) {
      setItems((list) => list?.map((s) => (s.id === story.id ? { ...s, shown: !shown } : s)) ?? null);
      fail(err);
    }
  }

  async function remove(story: AdminStory) {
    setDeleting(null);
    try {
      await adminStories.remove(story.id);
      setItems((list) => list?.filter((s) => s.id !== story.id) ?? null);
      toast("הסיפור נמחק");
    } catch (err) {
      fail(err);
    }
  }

  const visible = (items ?? []).filter((s) => (filter === "shown" ? s.shown : filter === "hidden" ? !s.shown : true));
  const shownCount = (items ?? []).filter((s) => s.shown).length;

  return (
    <div className="adm-section">
      <SectionHead title="סיפורים" text="כל הסיפורים ששלחו מעמוד ההצטרפות. בוחרים אילו להציג בעמוד הסיפורים באתר. את העמוד עצמו מפעילים בלשונית ״חסמים״." />

      <Card title={`הסיפורים שהתקבלו${items ? ` (${items.length})` : ""}`} hint={items ? `מוצגים באתר: ${shownCount}` : undefined}>
        <div className="adm-seg" role="group" aria-label="סינון">
          {([["all", "הכול"], ["shown", "מוצגים"], ["hidden", "לא מוצגים"]] as const).map(([key, label]) => (
            <button key={key} type="button" className={`adm-nav-i${filter === key ? " on" : ""}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
        {items === null ? <p className="adm-loading">טוענים…</p> : null}
        {items && visible.length === 0 ? <p className="adm-loading">{items.length === 0 ? "עדיין לא התקבלו סיפורים." : "אין סיפורים בסינון הזה."}</p> : null}
        <ul className="adm-rows">
          {visible.map((s) => (
            <li key={s.id} className="adm-row-i adm-story">
              <div className="adm-row">
                <strong>{s.name || "ללא שם"}{s.hideName ? " (ביקש/ה לא להציג את השם)" : ""}</strong>
                <span className="adm-story-d">{dateText(s.date)}</span>
              </div>
              <p className="adm-story-t">{s.story}</p>
              {s.attachmentName ? <p className="adm-story-d">צורף קובץ: {s.attachmentName} (הקובץ עצמו לא נשמר באתר)</p> : null}
              <div className="adm-row">
                <Switch on={s.shown} onChange={(on) => void setShown(s, on)} label="להציג באתר" />
                <span className="adm-row">
                  <span className={`adm-state${s.consent ? " on" : ""}`}>{s.consent ? "אישרו פרסום" : "לא אישרו פרסום"}</span>
                  <button type="button" className="adm-btn" onClick={() => setDeleting(s)}>מחיקה</button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {deleting ? <ConfirmDialog title="למחוק את הסיפור?" text="הסיפור יימחק לצמיתות ולא ניתן יהיה לשחזר אותו." onConfirm={() => void remove(deleting)} onCancel={() => setDeleting(null)} /> : null}
    </div>
  );
}
