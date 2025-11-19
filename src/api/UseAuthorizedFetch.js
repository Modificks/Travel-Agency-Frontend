/* global globalThis */
import { useCallback } from "react";
import { useLanguage } from "../context/LanguageContext";

let refreshPromise = null;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const performRefresh = async (language) => {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": language,
        },
    });

    if (!refreshResponse.ok) {
        globalThis.location.href = "/login";
        throw new Error("Refresh token failed or expired");
    }
    return refreshResponse;
};

export const useAuthorizedFetch = () => {
    const { language } = useLanguage();

    return useCallback(async (url, options = {}) => {
        const fetchOptions = {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": language,
                ...(options.headers),
            },
        };

        let response = await fetch(url, fetchOptions);

        if (response.status === 401) {
            try {
                if (!refreshPromise) {
                    refreshPromise = performRefresh(language);
                }

                await refreshPromise;

            } finally {
                refreshPromise = null;
            }
            response = await fetch(url, fetchOptions);
        }

        return response;
    }, [language]);
};
