import React, { createContext, useState } from 'react';
import { translations } from './translations';
import type { Language, TranslationKey } from './translations';
import { appConfig } from '../config/appConfig';

type LanguageContextType = {
    language: Language;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(appConfig.app.defaultLanguage as Language);

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'de' ? 'en' : 'de'));
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key];
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};