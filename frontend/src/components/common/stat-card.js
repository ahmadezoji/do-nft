import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "./card";
export const StatCard = ({ label, value }) => (_jsxs(Card, { className: "stat-card", children: [_jsx("span", { className: "eyebrow", children: label }), _jsx("strong", { children: value })] }));
