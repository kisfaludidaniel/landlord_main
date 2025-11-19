'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t('common.error')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('language') === 'hu' 
              ? 'A keresett oldal nem létezik vagy el lett helyezve.' :'The page you are looking for does not exist or has been moved.'
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketing-homepage"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
          >
            <Icon name="HomeIcon" size={16} />
            {t('language') === 'hu' ? 'Vissza a főoldalra' : 'Back to Home'}
          </Link>
          <Link
            href="/role-selection"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors"
          >
            <Icon name="UserPlusIcon" size={16} />
            {t('auth.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}