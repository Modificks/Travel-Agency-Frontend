/* global globalThis */
import React, { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import en from "../locales/en.json";
import uk from "../locales/uk.json";

const translations = { en, uk };
const LanguageContext = createContext(null);

const getInitialLanguage = () => {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
        const stored = globalThis.localStorage.getItem("language");
        if (stored === "en" || stored === "uk") return stored;
    }
    return "en";
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(getInitialLanguage);

    const toggleLanguage = () => {
        setLanguage((prev) => {
            const next = prev === "uk" ? "en" : "uk";
            try {
                globalThis.localStorage.setItem("language", next);
            } catch {}
            return next;
        });
    };

    const t = useMemo(() => {
        return (key, fallback = "") => {
            const parts = key.split(".");
            let obj = translations[language];
            for (const p of parts) {
                if (!obj) return fallback || key;
                obj = obj[p];
            }
            return obj ?? fallback ?? key;
        };
    }, [language]);

    const contextValue = useMemo(() => ({
        language,
        toggleLanguage,
        t
    }), [language, t]);

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useLanguage = () => useContext(LanguageContext);
