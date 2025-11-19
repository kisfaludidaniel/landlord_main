'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'hu' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    hu: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { hu: 'Főoldal', en: 'Home' },
  'nav.dashboard': { hu: 'Műszerfal', en: 'Dashboard' },
  'nav.properties': { hu: 'Ingatlanok', en: 'Properties' },
  'nav.tenants': { hu: 'Bérlők', en: 'Tenants' },
  'nav.financial': { hu: 'Pénzügyek', en: 'Financial' },
  'nav.reports': { hu: 'Riportok', en: 'Reports' },
  'nav.settings': { hu: 'Beállítások', en: 'Settings' },
  'nav.users': { hu: 'Felhasználók', en: 'Users' },
  'nav.packages': { hu: 'Csomagok', en: 'Packages' },
  'nav.subscriptions': { hu: 'Előfizetések', en: 'Subscriptions' },
  'nav.admin': { hu: 'Admin', en: 'Admin' },
  'nav.tenant_portal': { hu: 'Bérlői Portál', en: 'Tenant Portal' },
  
  // Auth
  'auth.login': { hu: 'Bejelentkezés', en: 'Login' },
  'auth.register': { hu: 'Regisztráció', en: 'Registration' },
  'auth.logout': { hu: 'Kijelentkezés', en: 'Logout' },
  
  // System
  'system.landlord': { hu: 'Landlord', en: 'Landlord' },
  'system.title': { hu: 'Landlord - Professzionális Ingatlan Kezelés', en: 'Landlord - Professional Property Management' },
  
  // Common
  'common.loading': { hu: 'Betöltés...', en: 'Loading...' },
  'common.error': { hu: 'Hiba történt', en: 'An error occurred' },
  'common.save': { hu: 'Mentés', en: 'Save' },
  'common.cancel': { hu: 'Mégse', en: 'Cancel' },
  'common.delete': { hu: 'Törlés', en: 'Delete' },
  'common.edit': { hu: 'Szerkesztés', en: 'Edit' },
  'common.create': { hu: 'Létrehozás', en: 'Create' },
  'common.update': { hu: 'Frissítés', en: 'Update' },
  
  // Language selector
  'language.hungarian': { hu: 'Magyar', en: 'Hungarian' },
  'language.english': { hu: 'Angol', en: 'English' },
  'language.switch_to_hungarian': { hu: 'Váltás magyarra', en: 'Switch to Hungarian' },
  'language.switch_to_english': { hu: 'Váltás angolra', en: 'Switch to English' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hu');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('landlord-language') as Language;
      if (savedLanguage && (savedLanguage === 'hu' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn('Could not load language from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save language to localStorage when changed
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('landlord-language', lang);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
    
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'hu' ? 'hu' : 'en';
    }
  };

  // Translation function
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.hu || key;
  };

  // Don't render children until language is loaded from localStorage
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};