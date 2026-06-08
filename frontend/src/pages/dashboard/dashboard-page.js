import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/card";
import { StatCard } from "../../components/common/stat-card";
import { dashboardService } from "../../services/dashboard-service";
export const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    useEffect(() => {
        void dashboardService.summary().then(setSummary);
    }, []);
    return (_jsxs("div", { className: "stack", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Overview" }), _jsx("h1", { children: "Dashboard" })] }), _jsx(Link, { to: "/nft-studio", className: "secondary-button", children: "Open NFT Studio" })] }), _jsxs("div", { className: "grid stats-grid", children: [_jsx(StatCard, { label: "Collections", value: summary?.totals.collections ?? 0 }), _jsx(StatCard, { label: "NFTs", value: summary?.totals.nfts ?? 0 }), _jsx(StatCard, { label: "Draft NFTs", value: summary?.totals.draftNfts ?? 0 }), _jsx(StatCard, { label: "Listed NFTs", value: summary?.totals.listedNfts ?? 0 }), _jsx(StatCard, { label: "Campaigns", value: summary?.totals.campaigns ?? 0 })] }), _jsxs("div", { className: "grid split-grid", children: [_jsxs(Card, { children: [_jsx("h3", { children: "Recent generated images" }), _jsx("div", { className: "stack compact", children: summary?.recentImages.length ? (summary.recentImages.map((item) => (_jsxs(Link, { to: `/nfts/${item.id}`, className: "list-row", children: [_jsx("span", { children: item.name }), _jsx("span", { children: item.status })] }, item.id)))) : (_jsx("p", { className: "muted", children: "No generated images yet." })) })] }), _jsxs(Card, { children: [_jsx("h3", { children: "Integration status" }), _jsx("div", { className: "stack compact", children: summary?.integrations.length ? (summary.integrations.map((item) => (_jsxs("div", { className: "list-row", children: [_jsx("span", { children: item.provider }), _jsx("span", { children: new Date(item.updatedAt).toLocaleDateString() })] }, item.provider)))) : (_jsx("p", { className: "muted", children: "No integrations configured." })) })] })] })] }));
};
