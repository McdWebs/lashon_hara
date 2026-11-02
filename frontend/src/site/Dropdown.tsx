import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./ui";

export type DropdownOption = { value: string; label: string };

/**
 * A menu that opens under its button. Works with the mouse and the keyboard:
 * arrows move, Enter or Space picks, Escape closes, and typing a letter jumps to a match.
 */
export function Dropdown({ label, text, value, options, onChange, active }: {
  /** What a screen reader calls it. */
  label: string;
  /** What the button shows. */
  text: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** A non-default choice is in effect. */
  active?: boolean;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);

  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  function show() {
    setCursor(selected);
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function pick(index: number) {
    onChange(options[index].value);
    close();
  }

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setCursor((c) => Math.min(c + 1, last));
    else if (e.key === "ArrowUp") setCursor((c) => Math.max(c - 1, 0));
    else if (e.key === "Home") setCursor(0);
    else if (e.key === "End") setCursor(last);
    else if (e.key === "Enter" || e.key === " ") pick(cursor);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else if (e.key.length === 1) {
      const next = options.findIndex((o, i) => i > cursor && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (next >= 0) setCursor(next);
      return;
    } else return;
    e.preventDefault();
  }

  return (
    <div className={`cdrop${open ? " open" : ""}`} ref={root}>
      <button
        ref={button}
        type="button"
        className={`cdrop-b${active ? " on" : ""}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
      >
        <span>{text}</span>
        <span className="cdrop-c" aria-hidden="true"><Icon.chevron /></span>
      </button>

      {open ? (
        <ul
          ref={list}
          id={`${id}-list`}
          className="cdrop-m"
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          aria-activedescendant={`${id}-o${cursor}`}
          onKeyDown={onListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-o${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`cdrop-o${i === cursor ? " cur" : ""}`}
              onPointerEnter={() => setCursor(i)}
              onClick={() => pick(i)}
            >
              <span>{o.label}</span>
              {o.value === value ? <Icon.ok /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
