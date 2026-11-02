import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { LocaleRedirect } from "./components/LocaleRedirect";
import { langFromPath } from "./i18n/locale";
import { SiteLayout } from "./site/SiteLayout";
import { AboutPage as SiteAboutPage } from "./site/pages/AboutPage";
import { ActivityPage as SiteActivityPage } from "./site/pages/ActivityPage";
import { AdminPage as SiteAdminPage } from "./site/pages/AdminPage";
import { CartPage as SiteCartPage } from "./site/pages/CartPage";
import { CheckoutPage as SiteCheckoutPage } from "./site/pages/CheckoutPage";
import { CollectionPage as SiteCollectionPage } from "./site/pages/CollectionPage";
import { ConfirmationPage as SiteConfirmationPage } from "./site/pages/ConfirmationPage";
import { HomePage as SiteHomePage } from "./site/pages/HomePage";
import { JoinPage as SiteJoinPage } from "./site/pages/JoinPage";
import { ProductPage as SiteProductPage } from "./site/pages/ProductPage";
import {
  AccessibilityPage as SiteAccessibilityPage,
  NotFoundPage as SiteNotFoundPage,
  TermsPage as SiteTermsPage,
} from "./site/pages/SimplePages";
import { createAppTheme } from "./theme";

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });
const cacheLtr = createCache({ key: "muiltr" });

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

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
      <Route path="join" element={<SiteJoinPage />} />
      <Route path="admin" element={<SiteAdminPage />} />
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
        <Routes>
          <Route path="/en">
            {newSitePages()}
          </Route>
          {newSitePages()}
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemedTree />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
