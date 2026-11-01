import * as he from "./about";
import * as en from "./about.en";
import { siteLang } from "./i18n";

export function copy() {
  return siteLang() === "en" ? en : he;
}
