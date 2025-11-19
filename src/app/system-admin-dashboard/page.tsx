'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/card';

interface SystemMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  activeProperties: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function SystemAdminDashboard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    activeProperties: 0,
    systemHealth: 'healthy'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading metrics
    const timer = setTimeout(() => {
      setMetrics({
        totalUsers: 1247,
        activeSubscriptions: 892,
        monthlyRevenue: 45600,
        activeProperties: 3421,
        systemHealth: 'healthy'
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const adminActions = [
    {
      title: 'Felhasználók kezelése',
      titleKey: 'nav.users',
      description: 'Felhasználói fiókok és jogosultságok kezelése',
      href: '/users-management',
      icon: 'UserGroupIcon',
      color: 'bg-blue-500'
    },
    {
      title: 'Csomagok kezelése',
      titleKey: 'nav.packages',
      description: 'Előfizetési csomagok létrehozása és szerkesztése',
      href: '/packages-management',
      icon: 'CubeIcon',
      color: 'bg-green-500'
    },
    {
      title: 'Előfizetések',
      titleKey: 'nav.subscriptions',
      description: 'Aktív előfizetések és számlázás kezelése',
      href: '/subscriptions-management',
      icon: 'CreditCardIcon',
      color: 'bg-purple-500'
    },
    {
      title: 'Rendszer beállítások',
      titleKey: 'nav.settings',
      description: 'Globális rendszer konfigurációk',
      href: '/system-settings-configuration',
      icon: 'CogIcon',
      color: 'bg-gray-500'
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('nav.admin')} Műszerfal
          </h1>
          <p className="text-muted-foreground">
            Rendszer áttekintés és adminisztrációs funkciók
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Összes felhasználó
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : metrics.totalUsers.toLocaleString()}
                </p>
              </div>
              <Icon name="UserGroupIcon" size={24} className="text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktív előfizetések
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : metrics.activeSubscriptions.toLocaleString()}
                </p>
              </div>
              <Icon name="CreditCardIcon" size={24} className="text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Havi bevétel
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `${metrics.monthlyRevenue.toLocaleString()} Ft`}
                </p>
              </div>
              <Icon name="CurrencyDollarIcon" size={24} className="text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktív ingatlanok
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : metrics.activeProperties.toLocaleString()}
                </p>
              </div>
              <Icon name="BuildingOfficeIcon" size={24} className="text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Adminisztrációs funkciók
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <Icon name={action.icon as any} size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {t(action.titleKey)}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Health Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Rendszer állapot
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Minden rendszer működik
                </span>
              </div>
            </div>
            <Icon name="CheckCircleIcon" size={24} className="text-green-500" />
          </div>
        </Card>
      </div>
    </main>
  );
}