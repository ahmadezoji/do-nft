import { jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
const links = [
    { to: "/", label: "Dashboard" },
    { to: "/settings", label: "Settings" },
    { to: "/branding", label: "Branding" },
    { to: "/collections", label: "Collections" },
    { to: "/nft-studio", label: "NFT Studio" },
    { to: "/promotions", label: "Promotions" }
];
export const AppNav = () => (_jsx("nav", { className: "app-nav", children: links.map((link) => (_jsx(NavLink, { to: link.to, className: ({ isActive }) => (isActive ? "active" : ""), children: link.label }, link.to))) }));
