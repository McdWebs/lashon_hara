import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";
import { legacyTarget } from "./legacyUrls";
import { NotFoundPage } from "./pages/SimplePages";

/** An address nobody here knows: if it is an old-store address, open its new page; otherwise the not-found page. */
export function LegacyGate() {
  const { pathname } = useLocation();
  const { loc } = useLocale();
  const [target, setTarget] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setTarget(undefined);
    legacyTarget(pathname).then((to) => !cancelled && setTarget(to), () => !cancelled && setTarget(null));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (target === undefined) return null;
  return target ? <Navigate to={loc(target)} replace /> : <NotFoundPage />;
}
