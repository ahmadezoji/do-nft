import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { usersService } from "../services/users-service";
import { useAuth } from "./auth-context";
import { translations } from "../i18n/translations";
import type { LanguageCode, TranslationKey } from "../i18n/translations";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): LanguageCode => {
  const stored = localStorage.getItem("do-nft-language");
  return stored === "fa" ? "fa" : "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  useEffect(() => {
    const preferred = user?.settings?.preferredLanguage;

    if (preferred === "fa" || preferred === "en") {
      setLanguageState(preferred);
      localStorage.setItem("do-nft-language", preferred);
    }
  }, [user?.settings?.preferredLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = async (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("do-nft-language", nextLanguage);

    if (user) {
      try {
        await usersService.updateSettings({
          preferredLanguage: nextLanguage
        });
      } catch {
        // Keep local language selection even if persistence fails.
      }
    }
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key],
      isRtl: language === "fa"
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
