import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { AppNav } from "../components/layout/app-nav";
import { useAuth } from "../store/auth-context";
import { useLanguage } from "../store/language-context";
export const AppLayout = () => {
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { children: [_jsx("p", { className: "logo", children: "do-nft" }), _jsx("p", { className: "muted", children: t("appTagline") })] }), _jsx(AppNav, {}), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("label", { className: "field", children: [_jsx("span", { children: t("language") }), _jsxs("select", { value: language, onChange: (event) => void setLanguage(event.target.value), children: [_jsx("option", { value: "en", children: t("english") }), _jsx("option", { value: "fa", children: t("persian") })] })] }), _jsx("p", { children: user?.profile?.fullName ?? user?.email }), _jsx("button", { type: "button", className: "secondary-button", onClick: logout, children: t("signOut") })] })] }), _jsx("main", { className: "content", children: _jsx(Outlet, {}) })] }));
};
