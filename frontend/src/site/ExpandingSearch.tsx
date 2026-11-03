import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { t } from "./i18n";
import { SearchSuggest } from "./SearchSuggest";
import { Icon } from "./ui";

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function useDesktop() {
  const query = "(min-width: 901px)";
  const [on, setOn] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const change = () => setOn(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  return on;
}

/**
 * A round search button that stretches out into the search field over its row, with the suggestions panel below.
 * On a phone the field opens across its row (the nearest positioned parent); on a computer the same button opens a modal.
 */
export function ExpandingSearch({ draft, setDraft, startOpen, rich, onCommit }: {
  draft: string;
  setDraft: (value: string) => void;
  startOpen: boolean;
  /** Suggestions, and a modal on computers. Off keeps just the field. */
  rich: boolean;
  onCommit: (term: string) => void;
}) {
  const desktop = useDesktop() && rich;
  const [open, setOpen] = useState(startOpen && !desktop);
  const [modal, setModal] = useState<"" | "in" | "out">("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const modalInput = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // A search that is already in the address (a shared link, the back button) shows its field open.
  useEffect(() => {
    if (!desktop && draft.trim() && !open) setOpen(true);
  }, [desktop, draft, open]);

  function openModal() {
    setModal("in");
    setTimeout(() => modalInput.current?.focus({ preventScroll: true }), 50);
  }

  function closeModal() {
    setModal((m) => (m === "in" ? "out" : m));
    setTimeout(() => {
      setModal("");
      button.current?.focus({ preventScroll: true });
    }, 220);
  }

  // The page behind stays put while the modal is up.
  useEffect(() => {
    if (!modal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modal]);

  /** The field opens from, and closes back into, the button: measure where the button sits in the row. */
  function toggle(next: boolean) {
    const row = box.current?.offsetParent?.getBoundingClientRect();
    const btn = button.current?.getBoundingClientRect();
    if (row && btn && box.current) {
      box.current.style.setProperty("--l", `${Math.max(0, btn.left - row.left)}px`);
      box.current.style.setProperty("--r", `${Math.max(0, row.right - btn.right)}px`);
    }
    setOpen(next);
    setFocused(next);
    if (next) setTimeout(() => input.current?.focus({ preventScroll: true }), 60);
  }

  const close = () => {
    input.current?.blur();
    setFocused(false);
  };

  return (
    <>
      {desktop && draft.trim() ? (
        <span className="cterm">
          <button type="button" className="cterm-b" ref={button} aria-haspopup="dialog" aria-label={t("חיפוש מוצר: {q}", { q: draft.trim() })} onClick={openModal}>
            <SearchIcon />
            <span>{draft.trim()}</span>
          </button>
          <button type="button" className="cterm-x" aria-label={t("ניקוי החיפוש")} onClick={() => setDraft("")}><Icon.close /></button>
        </span>
      ) : (
        <button type="button" className="cbtn" ref={button} aria-label={t("חיפוש מוצר")} aria-haspopup={desktop ? "dialog" : undefined} onClick={() => (desktop ? openModal() : toggle(true))}><SearchIcon /></button>
      )}
      {desktop ? (
        modal
          ? createPortal(
              <div className={`smodal${modal === "out" ? " out" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                <div className="smodal-card" role="dialog" aria-modal="true" aria-label={t("חיפוש מוצר")}>
                  <div className="smodal-bar" role="search">
                    <SearchIcon />
                    <input
                      ref={modalInput}
                      type="search"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={t("חיפוש מוצר…")}
                      aria-label={t("חיפוש מוצר")}
                      enterKeyHint="search"
                      autoComplete="off"
                    />
                    {draft ? <button type="button" className="msearch-x" aria-label={t("ניקוי החיפוש")} onClick={() => { setDraft(""); modalInput.current?.focus(); }}><Icon.close /></button> : null}
                    <button type="button" className="smodal-x" onClick={closeModal}>{t("סגירה")}<kbd>Esc</kbd></button>
                  </div>
                  <div className="smodal-body">
                    <SearchSuggest inline draft={draft} open inputRef={modalInput} onFill={setDraft} onCommit={onCommit} onClose={closeModal} />
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null
      ) : (
        <>
          <div className={`msearch${open ? " open" : ""}`} role="search" ref={box}>
            <SearchIcon />
            <input
              ref={input}
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("חיפוש מוצר…")}
              aria-label={t("חיפוש מוצר")}
              enterKeyHint="search"
              autoComplete="off"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              tabIndex={open ? 0 : -1}
            />
            {draft ? (
              <button type="button" className="msearch-x" aria-label={t("ניקוי החיפוש")} onClick={() => { setDraft(""); input.current?.focus(); }}><Icon.close /></button>
            ) : null}
            <button type="button" className="msearch-c" tabIndex={open ? 0 : -1} onClick={() => { setDraft(""); toggle(false); }}>{t("ביטול")}</button>
          </div>
          {rich ? <SearchSuggest draft={draft} open={open && focused} inputRef={input} onFill={setDraft} onCommit={onCommit} onClose={close} /> : null}
        </>
      )}
    </>
  );
}
