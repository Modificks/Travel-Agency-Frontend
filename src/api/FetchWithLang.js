import {useCallback} from 'react';
import {useLanguage} from '../context/LanguageContext';

export const useFetchWithLang = () => {
    const {language} = useLanguage();

    return useCallback(async (url, options = {}) => {
        const defaultOptions = {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": language,
                ...options.headers,
            },
        };

        return fetch(url, {...defaultOptions, ...options});
    }, [language]);
};
