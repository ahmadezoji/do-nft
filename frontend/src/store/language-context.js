import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usersService } from "../services/users-service";
import { useAuth } from "./auth-context";
import { translations } from "../i18n/translations";
const LanguageContext = createContext(undefined);
const getInitialLanguage = () => {
    const stored = localStorage.getItem("do-nft-language");
    return stored === "fa" ? "fa" : "en";
};
export const LanguageProvider = ({ children }) => {
    const { user } = useAuth();
    const [language, setLanguageState] = useState(getInitialLanguage);
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
    const setLanguage = async (nextLanguage) => {
        setLanguageState(nextLanguage);
        localStorage.setItem("do-nft-language", nextLanguage);
        if (user) {
            try {
                await usersService.updateSettings({
                    preferredLanguage: nextLanguage
                });
            }
            catch {
                // Keep local language selection even if persistence fails.
            }
        }
    };
    const value = useMemo(() => ({
        language,
        setLanguage,
        t: (key) => translations[language][key],
        isRtl: language === "fa"
    }), [language]);
    return _jsx(LanguageContext.Provider, { value: value, children: children });
};
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
};
