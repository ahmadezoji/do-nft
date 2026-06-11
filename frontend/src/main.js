import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { AlertProvider } from "./store/alert-context";
import { AuthProvider } from "./store/auth-context";
import { LanguageProvider } from "./store/language-context";
import "./styles/global.css";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(AuthProvider, { children: _jsx(LanguageProvider, { children: _jsx(AlertProvider, { children: _jsx(App, {}) }) }) }) }));
