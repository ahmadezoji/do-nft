import { Outlet } from "react-router-dom";

import { AppNav } from "../components/layout/app-nav";
import { useAuth } from "../store/auth-context";
import { useLanguage } from "../store/language-context";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="logo">do-nft</p>
          <p className="muted">{t("appTagline")}</p>
        </div>
        <AppNav />
        <div className="sidebar-footer">
          <label className="field">
            <span>{t("language")}</span>
            <select value={language} onChange={(event) => void setLanguage(event.target.value as "en" | "fa")}>
              <option value="en">{t("english")}</option>
              <option value="fa">{t("persian")}</option>
            </select>
          </label>
          <p>{user?.profile?.fullName ?? user?.email}</p>
          <button type="button" className="secondary-button" onClick={logout}>
            {t("signOut")}
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
