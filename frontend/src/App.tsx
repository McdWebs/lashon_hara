import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { AppLayout } from "./components/AppLayout";
import { LocaleRedirect } from "./components/LocaleRedirect";
import { langFromPath } from "./i18n/locale";
import { SCHOOLS_PRODUCT_ID, FEATURES } from "./lib/site";
import { AboutPage } from "./pages/AboutPage";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { AmbassadorsPage } from "./pages/AmbassadorsPage";
import { CommitmentPage } from "./pages/CommitmentPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { JoinPage } from "./pages/JoinPage";
import { MapPage } from "./pages/MapPage";
import { MessagePage } from "./pages/MessagePage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { ProductPageEditorial } from "./pages/ProductPageEditorial";
import { QuizPage } from "./pages/QuizPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { SchoolsPage } from "./pages/SchoolsPage";
import { StorePageEditorial } from "./pages/StorePageEditorial";
import { StoriesPage } from "./pages/StoriesPage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { DonatePage } from "./pages/DonatePage";
import { FaqPage, MagazinePage, NotFoundPage } from "./pages/SimplePages";
import { AccountPage } from "./pages/CommercePages";
import { CheckoutPageEditorial } from "./pages/CheckoutPageEditorial";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { CartPageEditorial } from "./pages/StoreCommerceEditorial";
import { TermsPage } from "./pages/TermsPage";
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

function sitePages() {
  return (
    <>
      <Route index element={<StorePageEditorial />} />
      <Route path="movement" element={<HomePage />} />
      <Route path="message" element={<MessagePage />} />
      <Route path="message/quiz" element={<QuizPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="about-us" element={<LocaleRedirect to="/about" />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="our-activity" element={<LocaleRedirect to="/activities" />} />
      <Route path="join" element={<JoinPage />} />
      <Route path="join-us" element={<LocaleRedirect to="/join" />} />
      <Route path="join/commitment" element={<CommitmentPage />} />
      <Route path="join/ambassadors" element={<AmbassadorsPage />} />
      <Route path="schools" element={<SchoolsPage />} />
      <Route path="stories" element={<StoriesPage />} />
      <Route path="stories/:slug" element={<StoryDetailPage />} />
      <Route path="resources" element={<ResourcesPage />} />
      <Route path="magazine" element={<MagazinePage />} />
      <Route path="shop" element={<StorePageEditorial />} />
      <Route path="shop-m" element={<LocaleRedirect to="/" />} />
      <Route path="shop/product/:id" element={<ProductPageEditorial />} />
      <Route path="cart" element={<CartPageEditorial />} />
      <Route path="checkout" element={<CheckoutPageEditorial />} />
      <Route path="order-confirmation" element={<OrderConfirmationPage />} />
      <Route
        path="my-account"
        element={FEATURES.accountPage ? <AccountPage /> : <LocaleRedirect to="/" />}
      />
      <Route path="terms" element={<TermsPage />} />
      <Route path="wholesale" element={<LocaleRedirect to="/organizations" />} />
      <Route path="request-a-quote" element={<LocaleRedirect to="/organizations" />} />
      <Route path="custom" element={<OrganizationsPage variant="custom" />} />
      <Route path="product/schools" element={<LocaleRedirect to={`/shop/product/${SCHOOLS_PRODUCT_ID}`} />} />
      <Route path="organizations" element={<OrganizationsPage />} />
      <Route path="donate" element={<DonatePage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="contact-us" element={<LocaleRedirect to="/contact" />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="map" element={<MapPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}

/** The new four-door site (Hebrew). Pages outside its map stay on the old layout for now, so no link breaks. */
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
      <Route path="about" element={<Navigate to="/who-we-are" replace />} />
      <Route path="about-us" element={<Navigate to="/who-we-are" replace />} />
      <Route path="activities" element={<Navigate to="/activity" replace />} />
      <Route path="our-activity" element={<Navigate to="/activity" replace />} />
      <Route path="schools" element={<Navigate to="/activity" replace />} />
      <Route path="donate" element={<Navigate to="/join#donate" replace />} />
      <Route path="contact" element={<Navigate to="/join?panel=contact" replace />} />
      <Route path="contact-us" element={<Navigate to="/join?panel=contact" replace />} />
      <Route path="join-us" element={<Navigate to="/join" replace />} />
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
          <Route path="/en" element={<AppLayout />}>
            {sitePages()}
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
