import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppAlerts } from "../components/common/app-alerts";
import { AppLayout } from "../layouts/app-layout";
import { AuthLayout } from "../layouts/auth-layout";
import { BrandingPage } from "../pages/branding/branding-page";
import { CollectionsPage } from "../pages/collections/collections-page";
import { CollectionDetailPage } from "../pages/collections/collection-detail-page";
import { DashboardPage } from "../pages/dashboard/dashboard-page";
import { LoginPage } from "../pages/auth/login-page";
import { RegisterPage } from "../pages/auth/register-page";
import { NftDetailPage } from "../pages/nfts/nft-detail-page";
import { NftStudioPage } from "../pages/nfts/nft-studio-page";
import { PublishingPage } from "../pages/publishing/publishing-page";
import { PromotionsPage } from "../pages/promotions/promotions-page";
import { SettingsPage } from "../pages/settings/settings-page";
import { useAuth } from "../store/auth-context";
import { useLanguage } from "../store/language-context";

const ProtectedRoutes = () => {
  const { token, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <div className="centered-page">{t("loading")}</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

const PublicOnlyRoutes = () => {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : <AuthLayout />;
};

export const App = () => (
  <BrowserRouter>
    <AppAlerts />
    <Routes>
      <Route element={<PublicOnlyRoutes />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/branding" element={<BrandingPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/nft-studio" element={<NftStudioPage />} />
        <Route path="/nfts/:id" element={<NftDetailPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/publishing" element={<PublishingPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
