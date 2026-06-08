import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import { PromotionsPage } from "../pages/promotions/promotions-page";
import { SettingsPage } from "../pages/settings/settings-page";
import { useAuth } from "../store/auth-context";
const ProtectedRoutes = () => {
    const { token, loading } = useAuth();
    if (loading) {
        return _jsx("div", { className: "centered-page", children: "Loading..." });
    }
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(AppLayout, {});
};
const PublicOnlyRoutes = () => {
    const { token } = useAuth();
    return token ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(AuthLayout, {});
};
export const App = () => (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(PublicOnlyRoutes, {}), children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoutes, {}), children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "/branding", element: _jsx(BrandingPage, {}) }), _jsx(Route, { path: "/collections", element: _jsx(CollectionsPage, {}) }), _jsx(Route, { path: "/collections/:id", element: _jsx(CollectionDetailPage, {}) }), _jsx(Route, { path: "/nft-studio", element: _jsx(NftStudioPage, {}) }), _jsx(Route, { path: "/nfts/:id", element: _jsx(NftDetailPage, {}) }), _jsx(Route, { path: "/promotions", element: _jsx(PromotionsPage, {}) })] })] }) }));
