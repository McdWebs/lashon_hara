import { Drawer } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { t, Link, NavLink, setSiteLang, siteLang } from "./i18n";
import { AccessibilityWidget } from "../components/AccessibilityWidget";
import { SkipLink } from "../components/SkipLink";
import { langFromPath, stripLocale, withLocale } from "../i18n/locale";
import { LocaleContext, buildLocale } from "../i18n/useLocale";
import { useCart } from "../lib/cart";
import { SITE, waLink } from "../lib/site";
import { CookieBanner } from "./CookieBanner";
import { Icon } from "./ui";
import "./site.css";

const DOORS = [
  { to: "/who-we-are", label: "אודות" },
  { to: "/activity", label: "הפעילות שלנו" },
  { to: "/shop", label: "הקולקציה" },
  { to: "/join", label: "הצטרפו" },
] as const;

/** The collection door also owns the product, cart and checkout pages. */
function doorIsCurrent(pathname: string, to: string) {
  const inner = stripLocale(pathname);
  if (to === "/shop") return /^\/(shop|cart|checkout|order-confirmation)/.test(inner);
  return inner === to || inner.startsWith(`${to}/`);
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label={t("לשון הרע, לא מדבר אליי! — לעמוד הבית")}>
      {siteLang() === "en"
        ? <img src="/images/site/logo-en.svg" alt="" width="1635" height="134" />
        : <img src="/images/site/logo.svg" alt="" width="1347" height="180" />}
    </Link>
  );
}

/** The same page in the other language. */
function LangSwitch({ className, short, onClick }: { className?: string; short?: boolean; onClick?: () => void }) {
  const { pathname, search, hash } = useLocation();
  const other = siteLang() === "en" ? "he" : "en";
  const label = other === "en" ? (short ? "EN" : "English") : (short ? "HE" : "עברית");
  return <RouterLink className={className} to={`${withLocale(pathname, other)}${search}${hash}`} lang={other} onClick={onClick}>{label}</RouterLink>;
}

function Nav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((sum, item) => sum + item.quantity, 0) + s.pendingAdds);
  const badge = useRef<HTMLSpanElement>(null);
  const lastCount = useRef(count);

  useEffect(() => {
    if (count > lastCount.current) {
      badge.current?.classList.remove("pop");
      void badge.current?.offsetWidth;
      badge.current?.classList.add("pop");
    }
    lastCount.current = count;
  }, [count]);

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Logo />
        <nav className="nls" aria-label={t("ניווט ראשי")}>
          {DOORS.map((door) => {
            const current = doorIsCurrent(pathname, door.to);
            return (
              <NavLink key={door.to} to={door.to} className={`nl${current ? " cur" : ""}`} aria-current={current ? "page" : undefined}>
                <span>{t(door.label)}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="nact">
          <LangSwitch className="lang" short />
          <Link className="ncart" to="/cart" aria-label={t("סל הקניות, {n} פריטים", { n: count })}>
            <Icon.bag />
            <span className="nbadge" ref={badge}>{count}</span>
          </Link>
          <button className="nmenu" onClick={() => setMenuOpen(true)} aria-label={t("תפריט")}><Icon.menu /></button>
        </div>
      </div>
      <Drawer
        anchor="top"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        disablePortal
        slotProps={{ paper: { className: "menu-paper", role: "dialog", "aria-label": t("תפריט") } }}
      >
        <div className="menu-top">
          <Logo />
          <button className="iconbtn" onClick={() => setMenuOpen(false)} aria-label={t("סגירת תפריט")}><Icon.close /></button>
        </div>
        <nav className="mis" aria-label={t("ניווט ראשי")}>
          {DOORS.map((door) => (
            <Link key={door.to} to={door.to} className={`mi${doorIsCurrent(pathname, door.to) ? " cur" : ""}`} onClick={() => setMenuOpen(false)}>
              <span>{t(door.label)}</span>
              <Icon.arrow />
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          <LangSwitch onClick={() => setMenuOpen(false)} />
        </div>
      </Drawer>
    </header>
  );
}

function Footer() {
  return (
    <footer className="foot" id="foot">
      <div className="wrap foot-in">
        <div className="foot-a">
          <Logo />
          <p className="foot-say">{t("מה שאנחנו לובשים הופך לחלק ממה שאנחנו אומרים.")}</p>
        </div>
        <div className="foot-b">
          <Link className="btn btn-red" to="/join#donate"><span>{t("לתרומה")}</span><Icon.arrow /></Link>
          <div className="foot-icons">
            <a className="iconbtn dark" href={waLink()} aria-label="WhatsApp"><Icon.wa /></a>
            <Link className="iconbtn dark" to="/join?panel=contact" aria-label={t("צרו קשר")}><Icon.mail /></Link>
            <a className="iconbtn dark" href={SITE.instagram} aria-label="Instagram"><Icon.ig /></a>
            <a className="iconbtn dark" href={SITE.facebook} aria-label="Facebook"><Icon.fb /></a>
          </div>
        </div>
      </div>
      <div className="wrap foot-legal">
        <nav aria-label={t("מידע משפטי")}>
          <Link to="/terms">{t("תקנון ומדיניות פרטיות")}</Link>
          <Link to="/accessibility">{t("הצהרת נגישות")}</Link>
        </nav>
        <span>{t("© לשון הרע לא מדבר אליי")}</span>
      </div>
    </footer>
  );
}

/** Rises each `.rv` block into view as it reaches the screen, including blocks that arrive after data loads. */
function useReveal(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -30px 0px" },
    );
    const watch = () => el.querySelectorAll(".rv:not(.in)").forEach((node) => io.observe(node));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [root]);
}

export function SiteLayout() {
  const { pathname, hash } = useLocation();
  const lang = langFromPath(pathname);
  setSiteLang(lang);
  const dir = lang === "en" ? "ltr" : "rtl";
  const locale = useMemo(() => buildLocale(lang), [lang]);
  const hydrateCart = useCart((s) => s.hydrate);
  const root = useRef<HTMLDivElement>(null);
  const prevPath = useRef(pathname);
  useReveal(root);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    const before = document.body.style.background;
    document.body.style.background = "#FFFFFF";
    return () => {
      document.body.style.background = before;
    };
  }, [lang, dir]);

  useEffect(() => {
    // Switching worlds keeps the visitor where they are; every other page starts at the top.
    const sameHub = stripLocale(pathname).startsWith("/activity") && stripLocale(prevPath.current).startsWith("/activity");
    if (pathname !== prevPath.current && !sameHub && !hash) window.scrollTo(0, 0);
    prevPath.current = pathname;
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [pathname, hash]);

  return (
    <LocaleContext.Provider value={locale}>
      <SkipLink />
      <div className="lh lh-js a11y-zoom-scope" dir={dir} key={lang} ref={root}>
        <Nav />
        <main id="main-content">
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
      <AccessibilityWidget />
    </LocaleContext.Provider>
  );
}
