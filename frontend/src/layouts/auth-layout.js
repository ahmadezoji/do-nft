import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { useLanguage } from "../store/language-context";
export const AuthLayout = () => {
    const { t } = useLanguage();
    return (_jsxs("div", { className: "auth-shell", children: [_jsxs("div", { className: "hero-panel", children: [_jsx("p", { className: "eyebrow", children: t("aiNftSaas") }), _jsx("h1", { children: t("authHeroTitle") }), _jsx("p", { className: "muted", children: t("authHeroBody") })] }), _jsx("div", { className: "auth-panel", children: _jsx(Outlet, {}) })] }));
};
