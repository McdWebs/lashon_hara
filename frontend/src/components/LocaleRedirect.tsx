import { Navigate } from "react-router-dom";
import { useLocale } from "../i18n/useLocale";

export function LocaleRedirect({ to }: { to: string }) {
  const { loc } = useLocale();
  return <Navigate to={loc(to)} replace />;
}
