import { create } from "zustand";
import type { Audience } from "../i18n/locale";

const key = "lh-audience";

function read(): Audience {
  try {
    const v = sessionStorage.getItem(key);
    if (v === "parent" || v === "teacher" || v === "student" || v === "school") return v;
  } catch {
    /* ignore */
  }
  return "default";
}

type Prefs = {
  audience: Audience;
  setAudience: (a: Audience) => void;
};

export const usePrefs = create<Prefs>((set) => ({
  audience: typeof window === "undefined" ? "default" : read(),
  setAudience: (audience) => {
    try {
      sessionStorage.setItem(key, audience);
    } catch {
      /* ignore */
    }
    set({ audience });
  },
}));
