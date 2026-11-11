import type { Values } from "./forms";

const KEY = "lh-school-draft";

/** What a school typed in the bracelet request, kept in the browser so it is never typed twice. */
export type SchoolDraft = { values: Values; wantsLecture: boolean };

export function loadSchoolDraft(): SchoolDraft | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return raw && typeof raw.values === "object" ? { values: raw.values, wantsLecture: Boolean(raw.wantsLecture) } : null;
  } catch {
    return null;
  }
}

export function saveSchoolDraft(values: Values, wantsLecture = false) {
  try {
    const keep = wantsLecture || loadSchoolDraft()?.wantsLecture || false;
    localStorage.setItem(KEY, JSON.stringify({ values, wantsLecture: keep }));
  } catch {
    /* the draft is a convenience; without storage the form still works */
  }
}

export function clearSchoolDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
