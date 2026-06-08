import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = "" }) => (_jsx("section", { className: `card ${className}`.trim(), children: children }));
