'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
      <button
        onClick={() => setLanguage('hu')}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          language === 'hu' ?'bg-primary text-primary-foreground shadow-sm' :'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        aria-label="Magyar nyelv"
      >
        <span className="text-sm">🇭🇺</span>
        <span>HU</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          language === 'en' ?'bg-primary text-primary-foreground shadow-sm' :'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        aria-label="English language"
      >
        <span className="text-sm">🇬🇧</span>
        <span>ENG</span>
      </button>
    </div>
  );
};

export default LanguageSelector;