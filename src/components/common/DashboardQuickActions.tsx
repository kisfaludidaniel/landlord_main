'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  badge?: string;
}

interface DashboardQuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

const DashboardQuickActions = ({ 
  actions,
  className = '' 
}: DashboardQuickActionsProps) => {
  // Default quick actions for property management
  const defaultActions: QuickAction[] = [
    {
      id: 'add-property',
      title: 'Ingatlan hozzáadása',
      description: 'Új ingatlan regisztrálása a rendszerben',
      icon: 'PlusIcon',
      href: '/properties-management?action=add',
      variant: 'primary'
    },
    {
      id: 'create-invoice',
      title: 'Számla készítése',
      description: 'Bérleti díj számla generálása',
      icon: 'DocumentTextIcon',
      onClick: () => console.log('Create invoice'),
      variant: 'secondary'
    },
    {
      id: 'tenant-management',
      title: 'Bérlők kezelése',
      description: 'Bérlői adatok és szerződések',
      icon: 'UsersIcon',
      href: '/tenants-management',
      variant: 'accent'
    },
    {
      id: 'financial-reports',
      title: 'Pénzügyi jelentések',
      description: 'Bevételek és kiadások áttekintése',
      icon: 'ChartBarIcon',
      href: '/financial-reports',
      variant: 'secondary'
    },
    {
      id: 'maintenance-requests',
      title: 'Karbantartási kérések',
      description: 'Javítási és karbantartási feladatok',
      icon: 'WrenchScrewdriverIcon',
      href: '/maintenance',
      variant: 'accent',
      badge: '3'
    },
    {
      id: 'rent-collection',
      title: 'Bérleti díj beszedés',
      description: 'Fizetések nyomon követése',
      icon: 'CurrencyDollarIcon',
      href: '/rent-collection',
      variant: 'primary'
    }
  ];

  const quickActions = actions || defaultActions;

  const getActionStyles = (variant: string = 'secondary') => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20';
      case 'accent':
        return 'bg-accent hover:bg-accent/90 text-accent-foreground border-accent/20';
      default:
        return 'bg-card hover:bg-muted text-card-foreground border-border';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;
    if (action.onClick) {
      action.onClick();
    }
  };

  const renderAction = (action: QuickAction) => {
    const baseClasses = `
      relative group p-6 rounded-lg border-2 transition-all duration-200 ease-out
      hover:shadow-subtle hover:scale-[1.02] active:scale-[0.98]
      ${getActionStyles(action.variant)}
      ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    const content = (
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon with Badge */}
        <div className="relative">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/10">
            <Icon 
              name={action.icon as any} 
              size={24} 
              className="transition-transform duration-200 group-hover:scale-110" 
            />
          </div>
          {action.badge && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full">
              {action.badge}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight">
          {action.title}
        </h3>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">
          {action.description}
        </p>
      </div>
    );

    if (action.href && !action.disabled) {
      return (
        <Link key={action.id} to={action.href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <div
        key={action.id}
        className={baseClasses}
        onClick={() => handleActionClick(action)}
      >
        {content}
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quickActions.map(renderAction)}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {quickActions.map((action) => (
            <div key={action.id} className="flex-shrink-0 w-40">
              {renderAction(action)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardQuickActions;