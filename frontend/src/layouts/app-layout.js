import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { AppNav } from "../components/layout/app-nav";
import { useAuth } from "../store/auth-context";
export const AppLayout = () => {
    const { user, logout } = useAuth();
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { children: [_jsx("p", { className: "logo", children: "do-nft" }), _jsx("p", { className: "muted", children: "AI-driven NFT operations" })] }), _jsx(AppNav, {}), _jsxs("div", { className: "sidebar-footer", children: [_jsx("p", { children: user?.profile?.fullName ?? user?.email }), _jsx("button", { type: "button", className: "secondary-button", onClick: logout, children: "Sign out" })] })] }), _jsx("main", { className: "content", children: _jsx(Outlet, {}) })] }));
};
