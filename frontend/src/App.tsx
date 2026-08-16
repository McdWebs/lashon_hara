import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AboutPage } from "./pages/AboutPage";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { AmbassadorsPage } from "./pages/AmbassadorsPage";
import { CommitmentPage } from "./pages/CommitmentPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { JoinPage } from "./pages/JoinPage";
import { MessagePage } from "./pages/MessagePage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { ProductPage } from "./pages/ProductPage";
import { SchoolsPage } from "./pages/SchoolsPage";
import { ShopPage } from "./pages/ShopPage";
import { StoriesPage } from "./pages/StoriesPage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import {
  DonatePage,
  FaqPage,
  MagazinePage,
  NotFoundPage,
  ResourcesPage,
} from "./pages/SimplePages";
import { theme } from "./theme";

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/message" element={<MessagePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about-us" element={<Navigate to="/about" replace />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/our-activity" element={<Navigate to="/activities" replace />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/join-us" element={<Navigate to="/join" replace />} />
                <Route path="/join/commitment" element={<CommitmentPage />} />
                <Route path="/join/ambassadors" element={<AmbassadorsPage />} />
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:slug" element={<StoryDetailPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/magazine" element={<MagazinePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop-m" element={<Navigate to="/shop" replace />} />
                <Route path="/shop/product/:id" element={<ProductPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
