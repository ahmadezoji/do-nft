import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <div className="auth-shell">
    <div className="hero-panel">
      <p className="eyebrow">AI NFT SaaS</p>
      <h1>Generate, organize, and promote collections without collapsing into one-off tooling.</h1>
      <p className="muted">
        Configure providers, define your brand, draft collections, then move assets through studio and promotion workflows.
      </p>
    </div>
    <div className="auth-panel">
      <Outlet />
    </div>
  </div>
);
