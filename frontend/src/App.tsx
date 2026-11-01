import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { AppLayout } from "./components/AppLayout";
import { LocaleRedirect } from "./components/LocaleRedirect";
import { langFromPath } from "./i18n/locale";
import { SCHOOLS_PRODUCT_ID, FEATURES } from "./lib/site";
import { AmbassadorsPage } from "./pages/AmbassadorsPage";
import { CommitmentPage } from "./pages/CommitmentPage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { MessagePage } from "./pages/MessagePage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { QuizPage } from "./pages/QuizPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { StoriesPage } from "./pages/StoriesPage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { FaqPage, MagazinePage } from "./pages/SimplePages";
import { AccountPage } from "./pages/CommercePages";
import { SiteLayout } from "./site/SiteLayout";
import { AboutPage as SiteAboutPage } from "./site/pages/AboutPage";
import { ActivityPage as SiteActivityPage } from "./site/pages/ActivityPage";
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

/** The new four-door site, in Hebrew and under /en in English. Pages outside its map stay on the old layout for now, so no link breaks. */
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

function legacyPages() {
  return (
    <Route element={<AppLayout />}>
      <Route path="movement" element={<HomePage />} />
      <Route path="message" element={<MessagePage />} />
      <Route path="message/quiz" element={<QuizPage />} />
      <Route path="join/commitment" element={<CommitmentPage />} />
      <Route path="join/ambassadors" element={<AmbassadorsPage />} />
      <Route path="stories" element={<StoriesPage />} />
      <Route path="stories/:slug" element={<StoryDetailPage />} />
      <Route path="resources" element={<ResourcesPage />} />
      <Route path="magazine" element={<MagazinePage />} />
      <Route path="shop-m" element={<LocaleRedirect to="/" />} />
      <Route path="my-account" element={FEATURES.accountPage ? <AccountPage /> : <LocaleRedirect to="/" />} />
      <Route path="wholesale" element={<LocaleRedirect to="/organizations" />} />
      <Route path="request-a-quote" element={<LocaleRedirect to="/organizations" />} />
      <Route path="custom" element={<OrganizationsPage variant="custom" />} />
      <Route path="product/schools" element={<LocaleRedirect to={`/shop/product/${SCHOOLS_PRODUCT_ID}`} />} />
      <Route path="organizations" element={<OrganizationsPage />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="map" element={<MapPage />} />
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
            {legacyPages()}
          </Route>
          {newSitePages()}
          {legacyPages()}
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
