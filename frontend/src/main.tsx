import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app/App";
import { AlertProvider } from "./store/alert-context";
import { AuthProvider } from "./store/auth-context";
import { LanguageProvider } from "./store/language-context";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
