import { Outlet } from "react-router-dom";

import { useLanguage } from "../store/language-context";

export const AuthLayout = () => {
  const { t } = useLanguage();

  return (
    <div className="auth-shell">
      <div className="hero-panel">
        <p className="eyebrow">{t("aiNftSaas")}</p>
        <h1>{t("authHeroTitle")}</h1>
        <p className="muted">{t("authHeroBody")}</p>
      </div>
      <div className="auth-panel">
        <Outlet />
      </div>
    </div>
  );
};
