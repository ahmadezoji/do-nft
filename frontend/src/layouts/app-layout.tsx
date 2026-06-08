import { Outlet } from "react-router-dom";

import { AppNav } from "../components/layout/app-nav";
import { useAuth } from "../store/auth-context";

export const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="logo">do-nft</p>
          <p className="muted">AI-driven NFT operations</p>
        </div>
        <AppNav />
        <div className="sidebar-footer">
          <p>{user?.profile?.fullName ?? user?.email}</p>
          <button type="button" className="secondary-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
