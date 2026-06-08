import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
  { to: "/branding", label: "Branding" },
  { to: "/collections", label: "Collections" },
  { to: "/nft-studio", label: "NFT Studio" },
  { to: "/promotions", label: "Promotions" }
];

export const AppNav = () => (
  <nav className="app-nav">
    {links.map((link) => (
      <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
        {link.label}
      </NavLink>
    ))}
  </nav>
);
