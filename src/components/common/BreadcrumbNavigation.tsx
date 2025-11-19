'use client';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const BreadcrumbNavigation = ({ 
  items,
  separator,
  className = '' 
}: BreadcrumbNavigationProps) => {
  const { pathname } = useLocation();

  // Route mapping for Hungarian labels
  const routeLabels: Record<string, string> = {
    '/main-dashboard': 'Főoldal',
    '/properties-management': 'Ingatlanok',
    '/tenants-management': 'Bérlők',
    '/financial-reports': 'Pénzügyi jelentések',
    '/maintenance': 'Karbantartás',
    '/rent-collection': 'Bérleti díj beszedés',
    '/settings': 'Beállítások',
    '/organization-setup-wizard': 'Szervezet beállítása'
  };

  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with dashboard for authenticated routes
    if (pathname !== '/main-dashboard' && !pathname.startsWith('/marketing') && !pathname.startsWith('/login') && !pathname.startsWith('/user-registration')) {
      breadcrumbs.push({
        label: 'Főoldal',
        href: '/main-dashboard'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't render breadcrumbs for certain routes
  const hiddenRoutes = ['/marketing-homepage', '/login-authentication', '/user-registration'];
  if (hiddenRoutes.includes(pathname) || breadcrumbItems.length <= 1) {
    return null;
  }

  const defaultSeparator = (
    <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
  );

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <span className="flex items-center">
                {separator || defaultSeparator}
              </span>
            )}
            
            {item.href && !item.isActive ? (
              <Link
                to={item.href}
                className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-medium ${
                  item.isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;