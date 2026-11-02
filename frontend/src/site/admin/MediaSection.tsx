import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { ACCEPT, MAX_PHOTO, MAX_VIDEO, adminApi, adminToken, uploadMedia, type AdminList, type MediaWorld } from "../../lib/media";
import { ERRORS, I, SectionHead, errorText, useAdmin } from "./ui";

const WORLDS: Array<{ key: MediaWorld; label: string; page: string }> = [
  { key: "idf", label: "צה״ל", page: "/activity/idf" },
  { key: "ambassadors", label: "שגרירים", page: "/activity/ambassadors" },
];

type Items = AdminList["items"];
type Upload = { id: number; world: MediaWorld; name: string; preview?: string; isVideo: boolean; progress: number; error?: string };

export function MediaSection() {
  const { toast, fail } = useAdmin();
  const [world, setWorld] = useState<MediaWorld>("idf");
  const [lists, setLists] = useState<Record<MediaWorld, AdminList | null>>({ idf: null, ambassadors: null });
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [fileDrag, setFileDrag] = useState(false);
  const [viewing, setViewing] = useState<Items[number] | null>(null);
  const [deleting, setDeleting] = useState<Items[number] | null>(null);
  const counter = useRef(0);
  const dragDepth = useRef(0);

  const load = useCallback(
    async (w: MediaWorld) => {
      try {
        const data = await adminApi.list(w);
        setLists((l) => ({ ...l, [w]: data }));
      } catch (err) {
        fail(err);
      }
    },
    [fail],
  );

  useEffect(() => {
    void load("idf");
    void load("ambassadors");
  }, [load]);

  const current = lists[world];
  const items: Items = current?.items ?? [];
  const storage = (lists.idf ?? lists.ambassadors)?.storage;
  const here = uploads.filter((u) => u.world === world);
  const active = WORLDS.find((w) => w.key === world)!;

  /* uploads */
  async function send(files: FileList | File[] | null) {
    if (!files) return;
    const target = world;
    for (const file of Array.from(files)) {
      const id = (counter.current += 1);
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      const patch = (next: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...next } : u)));
      setUploads((list) => [...list, { id, world: target, name: file.name, preview, isVideo, progress: 0 }]);
      if (!(file.type.startsWith("image/") || isVideo)) {
        patch({ error: ERRORS.unsupported_type });
        continue;
      }
      if (file.size > (isVideo ? MAX_VIDEO : MAX_PHOTO)) {
        patch({ error: `הקובץ גדול מדי (עד ${isVideo ? "150" : "10"}MB).` });
        continue;
      }
      try {
        await uploadMedia(target, file, (progress) => patch({ progress }));
        setUploads((list) => list.filter((u) => u.id !== id));
        URL.revokeObjectURL(preview);
        await load(target);
        toast(isVideo ? "הסרטון הועלה" : "התמונה הועלתה");
      } catch (err) {
        if (!adminToken.get()) fail(err);
        else patch({ error: errorText(err) });
      }
    }
  }

  function dismissUpload(id: number) {
    setUploads((list) => {
      const gone = list.find((u) => u.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((u) => u.id !== id);
    });
  }

  /* files dragged over the page */
  function onFileEnter(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepth.current += 1;
    setFileDrag(true);
  }
  function onFileLeave(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setFileDrag(false);
  }
  function onFileDrop(e: DragEvent) {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    dragDepth.current = 0;
    setFileDrag(false);
    if (storage) void send(e.dataTransfer.files);
  }

  /* order, caption, delete */
  async function saveOrder(next: Items) {
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: next } } : l));
    try {
      await adminApi.reorder(world, next.map((i) => i.id));
    } catch (err) {
      fail(err);
      void load(world);
    }
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    void saveOrder(next);
  }

  function dropOn(targetId: string) {
    if (!dragging || dragging === targetId) return;
    const from = items.findIndex((i) => i.id === dragging);
    const to = items.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    void saveOrder(next);
  }

  async function saveCaption(item: Items[number], caption: string) {
    if (caption === item.caption) return;
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: l[world]!.items.map((i) => (i.id === item.id ? { ...i, caption } : i)) } } : l));
    try {
      await adminApi.setCaption(item.id, caption);
      toast("הכיתוב נשמר");
    } catch (err) {
      fail(err);
    }
  }

  async function confirmDelete() {
    const item = deleting;
    if (!item) return;
    setDeleting(null);
    setLists((l) => (l[world] ? { ...l, [world]: { ...l[world]!, items: l[world]!.items.filter((i) => i.id !== item.id) } } : l));
    try {
      await adminApi.remove(item.id);
      toast("הקובץ נמחק");
    } catch (err) {
      fail(err);
      void load(world);
    }
  }

  useEffect(() => {
    if (!viewing && !deleting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewing(null);
        setDeleting(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing, deleting]);

  return (
    <div
      className="adm-media"
      onDragEnter={onFileEnter}
      onDragLeave={onFileLeave}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
      onDrop={onFileDrop}
    >
      <SectionHead title="תמונות וסרטונים" text="מה שמועלה כאן מופיע בעמוד הפעילות באתר. הסדר כאן הוא הסדר באתר." />

      <div className="adm-row">
        <div className="adm-tabs" role="tablist" aria-label="חלק באתר">
          {WORLDS.map((w) => {
            const count = lists[w.key]?.items.length;
            return (
              <button key={w.key} type="button" role="tab" aria-selected={world === w.key} className={`adm-tab${world === w.key ? " on" : ""}`} onClick={() => setWorld(w.key)}>
                <span>{w.label}</span>
                <b>{count === undefined ? "–" : count}</b>
              </button>
            );
          })}
        </div>
        <a className="adm-link dark" href={active.page} target="_blank" rel="noreferrer"><span>לצפייה בעמוד באתר</span>{I.ext()}</a>
      </div>

      {storage === false ? (
        <p className="adm-note" role="alert"><b>האחסון עדיין לא מחובר.</b> אי אפשר להעלות קבצים עד שמוסיפים את הגדרות האחסון בשרת.</p>
      ) : null}

      <label className={`adm-drop${storage === false ? " off" : ""}`}>
        <input type="file" multiple accept={ACCEPT} disabled={!storage} onChange={(e) => { void send(e.target.files); e.target.value = ""; }} />
        <span className="adm-drop-i">{I.upload(26)}</span>
        <span className="adm-drop-t">
          <b>גוררים לכאן קבצים, או לוחצים לבחירה</b>
          <small>תמונה עד 10MB (JPG, PNG, WebP) · סרטון עד 150MB (MP4, WebM, MOV)</small>
        </span>
        <span className="adm-btn primary">בחירת קבצים</span>
      </label>

      {items.length === 0 && here.length === 0 && current ? (
        <div className="adm-empty">
          <b>עוד לא הועלו קבצים ל{active.label}</b>
          <span>עד שיועלו, באתר מוצגים קבצי הדוגמה. ברגע שמעלים את הקובץ הראשון, הם מוחלפים בקבצים שלכם.</span>
        </div>
      ) : null}

      {current === null ? <p className="adm-loading">טוענים…</p> : null}

      <ul className="adm-grid" aria-label={`קבצים: ${active.label}`}>
        {here.map((u) => (
          <li key={`u${u.id}`} className="adm-item up">
            <div className="adm-m">
              {u.isVideo ? <video src={u.preview} muted playsInline preload="metadata" /> : <img src={u.preview} alt="" />}
              <span className="adm-up-s">
                {u.error ? (
                  <>
                    <b>{u.error}</b>
                    <button type="button" className="adm-btn light" onClick={() => dismissUpload(u.id)}>הסרה</button>
                  </>
                ) : (
                  <>
                    <b>{Math.round(u.progress * 100)}%</b>
                    <span className="adm-prog"><span style={{ width: `${Math.round(u.progress * 100)}%` }} /></span>
                  </>
                )}
              </span>
            </div>
            <p className="adm-fn" dir="auto">{u.name}</p>
          </li>
        ))}

        {items.map((item, i) => (
          <li
            key={item.id}
            className={`adm-item${dragging === item.id ? " lifted" : ""}${over === item.id && dragging !== item.id ? " target" : ""}`}
            draggable
            onDragStart={(e) => { setDragging(item.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", item.id); }}
            onDragOver={(e) => { if (dragging) { e.preventDefault(); setOver(item.id); } }}
            onDragEnd={() => { setDragging(null); setOver(null); }}
            onDrop={(e) => { if (dragging) { e.preventDefault(); dropOn(item.id); } setDragging(null); setOver(null); }}
          >
            <div className="adm-m">
              <button type="button" className="adm-open" onClick={() => setViewing(item)} aria-label={item.kind === "video" ? "צפייה בסרטון" : "הגדלת התמונה"}>
                {item.kind === "video" ? <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" /> : <img src={item.src} alt="" loading="lazy" draggable={false} />}
                {item.kind === "video" ? <span className="adm-play">{I.play()}</span> : null}
              </button>
              <span className="adm-no">{i + 1}</span>
              <span className="adm-kind">{item.kind === "video" ? I.video() : I.image()}{item.kind === "video" ? "סרטון" : "תמונה"}</span>
              <span className="adm-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="להקדים">{I.right()}</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="לאחר">{I.left()}</button>
                <button type="button" className="danger" onClick={() => setDeleting(item)} aria-label="מחיקה">{I.trash()}</button>
              </span>
            </div>
            <input className="adm-cap" defaultValue={item.caption} placeholder="הוספת כיתוב" maxLength={300} aria-label="כיתוב" onBlur={(e) => void saveCaption(item, e.target.value.trim())} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
          </li>
        ))}
      </ul>

      {items.length > 1 ? <p className="adm-hint">אפשר לגרור כרטיס כדי לשנות את הסדר, או להשתמש בחצים.</p> : null}

      {fileDrag && storage ? (
        <div className="adm-veil" aria-hidden="true">
          <span>{I.upload(40)}</span>
          <b>שחררו כאן להעלאה ל{active.label}</b>
        </div>
      ) : null}

      {viewing ? (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="תצוגה" onClick={() => setViewing(null)}>
          <button type="button" className="adm-x" onClick={() => setViewing(null)} aria-label="סגירה">{I.close()}</button>
          <div className="adm-view" onClick={(e) => e.stopPropagation()}>
            {viewing.kind === "video" ? <video src={viewing.src} controls autoPlay playsInline /> : <img src={viewing.src} alt={viewing.caption} />}
            {viewing.caption ? <p>{viewing.caption}</p> : null}
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="adm-modal" role="alertdialog" aria-modal="true" aria-label="אישור מחיקה" onClick={() => setDeleting(null)}>
          <div className="adm-card adm-confirm" onClick={(e) => e.stopPropagation()}>
            <span className="adm-confirm-m">
              {deleting.kind === "video" ? <video src={`${deleting.src}#t=0.1`} muted playsInline preload="metadata" /> : <img src={deleting.src} alt="" />}
            </span>
            <h2>למחוק את {deleting.kind === "video" ? "הסרטון" : "התמונה"}?</h2>
            <p>הקובץ יימחק גם מהאתר ולא ניתן יהיה לשחזר אותו.</p>
            <div className="adm-confirm-b">
              <button type="button" className="adm-btn danger" onClick={() => void confirmDelete()}>מחיקה</button>
              <button type="button" className="adm-btn ghost" onClick={() => setDeleting(null)} autoFocus>ביטול</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
