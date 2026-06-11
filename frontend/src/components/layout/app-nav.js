import { jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../store/language-context";
export const AppNav = () => {
    const { t } = useLanguage();
    const links = [
        { to: "/", label: t("dashboard") },
        { to: "/settings", label: t("settings") },
        { to: "/branding", label: t("branding") },
        { to: "/collections", label: t("collections") },
        { to: "/nft-studio", label: t("nftStudio") },
        { to: "/promotions", label: t("promotions") },
        { to: "/publishing", label: t("publishing") }
    ];
    return (_jsx("nav", { className: "app-nav", children: links.map((link) => (_jsx(NavLink, { to: link.to, className: ({ isActive }) => (isActive ? "active" : ""), children: link.label }, link.to))) }));
};
