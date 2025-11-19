'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavigationItem {
  label: string;
  labelKey: string;
  href: string;
  icon?: string;
  isActive?: boolean;
}

interface ContextualNavigationProps {
  isAuthenticated?: boolean;
  isInWizard?: boolean;
  className?: string;
}

const ContextualNavigation = ({ 
  isAuthenticated = false, 
  isInWizard = false,
  className = '' 
}: ContextualNavigationProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  // Public navigation items
  const publicNavItems: NavigationItem[] = [
    {
      label: 'Főoldal',
      labelKey: 'nav.home',
      href: '/marketing-homepage',
      icon: 'HomeIcon'
    }
  ];

  // Authenticated navigation items  
  const authenticatedNavItems: NavigationItem[] = [
    {
      label: 'Műszerfal',
      labelKey: 'nav.dashboard',
      href: '/main-dashboard',
      icon: 'HomeIcon'
    },
    {
      label: 'Ingatlanok',
      labelKey: 'nav.properties',
      href: '/properties-management',
      icon: 'BuildingOfficeIcon'
    },
    {
      label: 'Bérlők',
      labelKey: 'nav.tenants', 
      href: '/tenant-management',
      icon: 'UserGroupIcon'
    },
    {
      label: 'Pénzügyek',
      labelKey: 'nav.financial',
      href: '/financial-reports',
      icon: 'CurrencyDollarIcon'
    },
    {
      label: 'Riportok',
      labelKey: 'nav.reports',
      href: '/reports-analytics',
      icon: 'ChartBarIcon'
    },
    {
      label: 'Bérlői Portál',
      labelKey: 'nav.tenant_portal',
      href: '/tenant-portal-dashboard',
      icon: 'UserIcon'
    }
  ];

  // Admin navigation items
  const adminNavItems: NavigationItem[] = [
    {
      label: 'Admin Műszerfal',
      labelKey: 'nav.admin',
      href: '/system-admin-dashboard',
      icon: 'CogIcon'
    },
    {
      label: 'Felhasználók',
      labelKey: 'nav.users',
      href: '/users-management',
      icon: 'UserGroupIcon'
    },
    {
      label: 'Csomagok',
      labelKey: 'nav.packages',
      href: '/packages-management',
      icon: 'CubeIcon'
    },
    {
      label: 'Előfizetések',
      labelKey: 'nav.subscriptions',
      href: '/subscriptions-management',
      icon: 'CreditCardIcon'
    },
    {
      label: 'Beállítások',
      labelKey: 'nav.settings',
      href: '/system-settings-configuration',
      icon: 'CogIcon'
    }
  ];

  // Determine current context
  const isPublicRoute = pathname === '/marketing-homepage' || pathname === '/';
  const isAuthRoute = ['/user-registration', '/login-authentication', '/role-selection', '/landlord-registration', '/tenant-registration', '/enhanced-registration-flow'].includes(pathname);
  const isWizardRoute = pathname === '/organization-setup-wizard';
  const isAdminRoute = ['/system-admin-dashboard', '/users-management', '/packages-management', '/subscriptions-management', '/system-settings-configuration'].includes(pathname);
  const isOperationalRoute = ['/main-dashboard', '/properties-management', '/tenant-management', '/financial-reports', '/reports-analytics', '/tenant-portal-dashboard'].includes(pathname);

  // Get appropriate navigation items
  const getNavigationItems = () => {
    if (isAdminRoute && isAuthenticated) {
      return adminNavItems.map(item => ({
        ...item,
        isActive: pathname === item.href
      }));
    }
    if (isOperationalRoute && isAuthenticated) {
      return authenticatedNavItems.map(item => ({
        ...item,
        isActive: pathname === item.href
      }));
    }
    if (isPublicRoute) {
      return publicNavItems.map(item => ({
        ...item,
        isActive: pathname === item.href
      }));
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Don't show navigation on registration pages
  if (isAuthRoute || isWizardRoute) {
    return null;
  }

  // Universal navigation header
  return (
    <header className={`sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? "/main-dashboard" : "/marketing-homepage"} className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="HomeIcon" size={20} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">
              {t('system.landlord')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {navigationItems.length > 0 && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    item.isActive
                      ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon && (
                    <Icon 
                      name={item.icon as any} 
                      size={16} 
                      className={item.isActive ? 'text-primary' : 'text-muted-foreground'} 
                    />
                  )}
                  <span>{t(item.labelKey)}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right Section - Language Selector + Auth Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Always visible */}
            <LanguageSelector />

            {/* Auth Actions for Public Routes */}
            {isPublicRoute && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login-authentication"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {t('auth.login')}
                </Link>
                <Link 
                  href="/role-selection"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors duration-200"
                >
                  {t('auth.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {navigationItems.length > 0 && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              >
                <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && navigationItems.length > 0 && (
          <div className="md:hidden border-t border-border">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    item.isActive
                      ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon && (
                    <Icon 
                      name={item.icon as any} 
                      size={20} 
                      className={item.isActive ? 'text-primary' : 'text-muted-foreground'} 
                    />
                  )}
                  <span>{t(item.labelKey)}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default ContextualNavigation;