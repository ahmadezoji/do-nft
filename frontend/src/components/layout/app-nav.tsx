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
    { to: "/auto-promoter", label: t("autoPromoter") },
    { to: "/publishing", label: t("publishing") }
  ];

  return (
    <nav className="app-nav">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};
