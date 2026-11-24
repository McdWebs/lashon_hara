import { useEffect, useRef, useState } from "react";
import { adminConfig, type StoredConfig } from "../../lib/adminConfig";
import { shrinkImage, uploadSiteImage } from "../../lib/media";
import { IMAGE_SLOTS, slotImage, type ImageSlot } from "../../lib/siteImages";
import { Card, I, SectionHead, errorText, useAdmin } from "./ui";

const GROUPS = [...new Set(IMAGE_SLOTS.map((s) => s.group))];

/** Every replaceable picture on the site. A picture is shrunk and converted to WebP on the computer before it is uploaded, and the change is live within about a minute. */
export function ImagesSection({ stored, onSaved }: { stored: StoredConfig; onSaved: () => void }) {
  const { toast, fail } = useAdmin();
  const slots = stored.images?.slots ?? {};
  const [busy, setBusy] = useState("");
  const [viewing, setViewing] = useState<ImageSlot | null>(null);
  const pick = useRef<HTMLInputElement>(null);
  const target = useRef<ImageSlot | null>(null);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  async function save(next: Record<string, string>) {
    if (Object.keys(next).length === 0) await adminConfig.reset("images");
    else await adminConfig.save("images", { slots: next });
    onSaved();
  }

  async function onFile(file: File | undefined) {
    const slot = target.current;
    if (!file || !slot) return;
    setBusy(slot.key);
    try {
      const url = await uploadSiteImage(await shrinkImage(file, slot.width));
      await save({ ...slots, [slot.key]: url });
      toast("התמונה הוחלפה");
    } catch (err) {
      fail(err);
      toast(errorText(err));
    } finally {
      setBusy("");
    }
  }

  async function back(slot: ImageSlot) {
    setBusy(slot.key);
    try {
      const { [slot.key]: _gone, ...rest } = slots;
      void _gone;
      await save(rest);
      toast("חזרה לתמונה המקורית");
    } catch (err) {
      fail(err);
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <SectionHead title="תמונות האתר" />
      <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <nav className="adm-imgs-nav" aria-label="קבוצות תמונות">
        {GROUPS.map((group) => (
          <button key={group} type="button" className="adm-chip" onClick={() => document.getElementById(`imgs-${GROUPS.indexOf(group)}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            {group}
          </button>
        ))}
      </nav>
      {GROUPS.map((group, gi) => {
        const inGroup = IMAGE_SLOTS.filter((s) => s.group === group);
        const entries = [...new Set(inGroup.map((s) => s.set ?? s.key))].map((id) => inGroup.filter((s) => (s.set ?? s.key) === id));
        return (
          <div key={group} id={`imgs-${gi}`} className="adm-imgs-g">
            <Card title={group} hint={`${inGroup.length} תמונות`}>
              <ul className="adm-imgs">
                {entries.map((parts) => (
                  <li key={parts[0].key} className="adm-ent">
                    {parts[0].set ? <span className="adm-ent-t">{parts[0].set}</span> : null}
                    {parts.map((slot) => {
                      const custom = Boolean(slots[slot.key]);
                      return (
                        <div key={slot.key} className="adm-part">
                          <button type="button" className={`adm-part-f ${slot.shape}`} onClick={() => setViewing(slot)} aria-label={`הגדלה: ${slot.part ?? slot.label}`}>
                            <img src={slotImage(stored.images?.slots, slot.key)} alt="" loading="lazy" />
                            {busy === slot.key ? <span className="adm-img-busy">מעלים…</span> : null}
                          </button>
                          <span className="adm-part-i">
                            <span className="adm-part-t">{slot.part ?? slot.label}</span>
                            <span className={`adm-part-s${custom ? " on" : ""}`}>{custom ? "הוחלפה" : "תמונה מקורית"}</span>
                            <span className="adm-img-b">
                              <button type="button" className="adm-btn small ghost" disabled={Boolean(busy)} onClick={() => { target.current = slot; pick.current?.click(); }}>
                                {custom ? "החלפה נוספת" : "החלפה"}
                              </button>
                              <button type="button" className="adm-btn small ghost" onClick={() => setViewing(slot)}>
                                {I.eye()}
                                הגדלה
                              </button>
                              {custom ? (
                                <button type="button" className="adm-link" disabled={Boolean(busy)} onClick={() => void back(slot)}>
                                  חזרה למקורית
                                </button>
                              ) : null}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        );
      })}
      {viewing ? (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="תצוגה בגודל מלא" onClick={() => setViewing(null)}>
          <button type="button" className="adm-x" onClick={() => setViewing(null)} aria-label="סגירה">{I.close()}</button>
          <div className="adm-view" onClick={(e) => e.stopPropagation()}>
            <img src={slotImage(stored.images?.slots, viewing.key)} alt="" />
            <p>{viewing.set ? `${viewing.set} · ${viewing.part}` : viewing.label}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
