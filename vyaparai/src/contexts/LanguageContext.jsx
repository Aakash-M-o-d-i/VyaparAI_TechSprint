/**
 * Language Context
 * Manages multi-language support and translations
 */
import { createContext, useContext, useState, useEffect } from 'react';
import translations, { speechLanguageCodes, languageNames } from '../locales/translations';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export function useLanguage() {
    return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
    const { userProfile, updateLanguage: updateUserLanguage } = useAuth();
    const [language, setLanguage] = useState(() => {
        // Try to get from localStorage first
        const saved = localStorage.getItem('vyaparai_language');
        return saved || 'en';
    });

    // Sync with user profile language when logged in
    useEffect(() => {
        if (userProfile?.language) {
            setLanguage(userProfile.language);
            localStorage.setItem('vyaparai_language', userProfile.language);
        }
    }, [userProfile]);

    // Get translation for a key
    function t(key) {
        return translations[language]?.[key] || translations.en[key] || key;
    }

    // Change language
    async function changeLanguage(newLang) {
        setLanguage(newLang);
        localStorage.setItem('vyaparai_language', newLang);

        // Update in Firestore if user is logged in
        if (userProfile) {
            try {
                await updateUserLanguage(newLang);
            } catch (error) {
                console.error('Error updating language:', error);
            }
        }
    }

    // Get speech recognition language code
    function getSpeechLanguageCode() {
        return speechLanguageCodes[language] || 'en-IN';
    }

    // Get available languages
    function getAvailableLanguages() {
        return Object.entries(languageNames).map(([code, name]) => ({
            code,
            name
        }));
    }

    const value = {
        language,
        t,
        changeLanguage,
        getSpeechLanguageCode,
        getAvailableLanguages,
        languageNames
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
