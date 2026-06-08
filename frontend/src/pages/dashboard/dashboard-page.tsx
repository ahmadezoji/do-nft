import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/common/card";
import { StatCard } from "../../components/common/stat-card";
import { dashboardService } from "../../services/dashboard-service";
import type { DashboardSummary } from "../../types/api";

export const DashboardPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void dashboardService.summary().then(setSummary);
  }, []);

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
        <Link to="/nft-studio" className="secondary-button">
          Open NFT Studio
        </Link>
      </header>

      <div className="grid stats-grid">
        <StatCard label="Collections" value={summary?.totals.collections ?? 0} />
        <StatCard label="NFTs" value={summary?.totals.nfts ?? 0} />
        <StatCard label="Draft NFTs" value={summary?.totals.draftNfts ?? 0} />
        <StatCard label="Listed NFTs" value={summary?.totals.listedNfts ?? 0} />
        <StatCard label="Campaigns" value={summary?.totals.campaigns ?? 0} />
      </div>

      <div className="grid split-grid">
        <Card>
          <h3>Recent generated images</h3>
          <div className="stack compact">
            {summary?.recentImages.length ? (
              summary.recentImages.map((item) => (
                <Link key={item.id} to={`/nfts/${item.id}`} className="list-row">
                  <span>{item.name}</span>
                  <span>{item.status}</span>
                </Link>
              ))
            ) : (
              <p className="muted">No generated images yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3>Integration status</h3>
          <div className="stack compact">
            {summary?.integrations.length ? (
              summary.integrations.map((item) => (
                <div key={item.provider} className="list-row">
                  <span>{item.provider}</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="muted">No integrations configured.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
