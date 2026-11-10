import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { LocaleRedirect } from "./components/LocaleRedirect";
import { langFromPath, stripLocale } from "./i18n/locale";
import { useSiteConfig } from "./lib/siteConfig";
import { SiteLayout } from "./site/SiteLayout";
import { CollectionPage as SiteCollectionPage } from "./site/pages/CollectionPage";
import { HomePage as SiteHomePage } from "./site/pages/HomePage";
import { ProductPage as SiteProductPage } from "./site/pages/ProductPage";
import {
  AccessibilityPage as SiteAccessibilityPage,
  NotFoundPage as SiteNotFoundPage,
  TermsPage as SiteTermsPage,
} from "./site/pages/SimplePages";
import { createAppTheme } from "./theme";

// Pages most visitors never open load only when asked for, so the shop starts from a smaller file.
const SiteAboutPage = lazy(() => import("./site/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const SiteActivityPage = lazy(() => import("./site/pages/ActivityPage").then((m) => ({ default: m.ActivityPage })));
const SiteAdminPage = lazy(() => import("./site/pages/AdminPage").then((m) => ({ default: m.AdminPage })));
const SiteCartPage = lazy(() => import("./site/pages/CartPage").then((m) => ({ default: m.CartPage })));
const SiteCheckoutPage = lazy(() => import("./site/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const SiteConfirmationPage = lazy(() => import("./site/pages/ConfirmationPage").then((m) => ({ default: m.ConfirmationPage })));
const SiteJoinPage = lazy(() => import("./site/pages/JoinPage").then((m) => ({ default: m.JoinPage })));
const SitePayPage = lazy(() => import("./site/pages/PayPage").then((m) => ({ default: m.PayPage })));

/** A payment link from the old store (/checkout/order-pay/123/?key=…) opens the same payment screen here. */
function OldPayLink() {
  const { id = "" } = useParams();
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("key") ?? "";
  return <LocaleRedirect to={`/order-pay/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`} />;
}

/** The English pages exist only while the English flag is on; otherwise they open the same page in Hebrew. */
function EnglishGate() {
  const { config, ready } = useSiteConfig();
  const { pathname, search, hash } = useLocation();
  // Wait for the answer, so a visitor on an English link is not sent to Hebrew just because the answer is still on its way.
  if (!ready) return null;
  if (!config.flags.english) return <Navigate to={`${stripLocale(pathname)}${search}${hash}`} replace />;
  return <Outlet />;
}

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });
const cacheLtr = createCache({ key: "muiltr" });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, gcTime: 24 * 60 * 60_000, retry: 1 } },
});

/** Shop lists are saved in the browser, so a return visit shows the last answer at once and refreshes behind it. */
const persister = createSyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : window.localStorage,
  key: "lh-shop-cache",
  throttleTime: 1000,
});
const persistOptions = {
  persister,
  maxAge: 24 * 60 * 60_000,
  buster: "v1",
  dehydrateOptions: {
    shouldDehydrateQuery: (q: { queryKey: readonly unknown[]; state: { status: string } }) =>
      q.state.status === "success" && ["site-collection", "site-home-latest"].includes(String(q.queryKey[0])),
  },
};

/** The new four-door site, in Hebrew and under /en in English. */
function newSitePages() {
  return (
    <Route element={<SiteLayout />}>
      <Route index element={<SiteHomePage />} />
      <Route path="who-we-are" element={<SiteAboutPage />} />
      <Route path="activity" element={<SiteActivityPage />} />
      <Route path="activity/:world" element={<SiteActivityPage />} />
      <Route path="shop" element={<SiteCollectionPage />} />
      <Route path="shop/product/:id" element={<SiteProductPage />} />
      <Route path="cart" element={<SiteCartPage />} />
      <Route path="checkout" element={<SiteCheckoutPage />} />
      <Route path="order-confirmation" element={<SiteConfirmationPage />} />
      <Route path="order-pay/:id" element={<SitePayPage />} />
      <Route path="checkout/order-pay/:id" element={<OldPayLink />} />
      <Route path="join" element={<SiteJoinPage />} />
      <Route path="terms" element={<SiteTermsPage />} />
      <Route path="accessibility" element={<SiteAccessibilityPage />} />
      <Route path="about" element={<LocaleRedirect to="/who-we-are" />} />
      <Route path="about-us" element={<LocaleRedirect to="/who-we-are" />} />
      <Route path="activities" element={<LocaleRedirect to="/activity" />} />
      <Route path="our-activity" element={<LocaleRedirect to="/activity" />} />
      <Route path="schools" element={<LocaleRedirect to="/activity" />} />
      <Route path="donate" element={<LocaleRedirect to="/join#donate" />} />
      <Route path="contact" element={<LocaleRedirect to="/join?panel=contact" />} />
      <Route path="contact-us" element={<LocaleRedirect to="/join?panel=contact" />} />
      <Route path="join-us" element={<LocaleRedirect to="/join" />} />
      <Route path="*" element={<SiteNotFoundPage />} />
    </Route>
  );
}

function ThemedTree() {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const direction = lang === "he" ? "rtl" : "ltr";
  const theme = useMemo(() => createAppTheme(direction), [direction]);
  const cache = direction === "rtl" ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={null}>
        <Routes>
          {/* The team's tools have their own layout, without the public header and footer. */}
          <Route path="admin" element={<SiteAdminPage />} />
          <Route path="/en" element={<EnglishGate />}>
            {newSitePages()}
          </Route>
          {newSitePages()}
        </Routes>
        </Suspense>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <BrowserRouter>
        <ThemedTree />
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
