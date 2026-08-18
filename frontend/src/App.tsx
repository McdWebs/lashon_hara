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
import { CartPageEditorial, CheckoutPageEditorial } from "./pages/StoreCommerceEditorial";
import { TermsPage } from "./pages/TermsPage";
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
      <Route
        path="my-account"
        element={FEATURES.accountPage ? <AccountPage /> : <LocaleRedirect to="/" />}
      />
      <Route path="terms" element={<TermsPage />} />
      <Route path="wholesale" element={<OrganizationsPage variant="wholesale" />} />
      <Route path="request-a-quote" element={<OrganizationsPage variant="quote" />} />
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
          <Route element={<AppLayout />}>{sitePages()}</Route>
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
