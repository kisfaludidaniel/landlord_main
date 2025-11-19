'use client';

import React, { useState, useEffect } from 'react';
import KPICards from './KPICards';
import RecentActivity from './RecentActivity';
import UpcomingTasks from './UpcomingTasks';
import RevenueChart from './RevenueChart';
import DashboardQuickActions from '@/components/common/DashboardQuickActions';

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

interface ActivityItem {
  id: string;
  type: 'payment' | 'maintenance' | 'tenant' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  propertyName?: string;
  tenantName?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'rent' | 'maintenance' | 'appointment' | 'inspection';
  propertyName?: string;
  tenantName?: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
}

const DashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockKPIMetrics: KPIMetric[] = [
    {
      id: 'properties',
      title: 'Összes ingatlan',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: 'BuildingOfficeIcon',
      color: 'primary'
    },
    {
      id: 'tenants',
      title: 'Aktív bérlők',
      value: '28',
      change: '+3',
      changeType: 'increase',
      icon: 'UsersIcon',
      color: 'success'
    },
    {
      id: 'revenue',
      title: 'Havi bevétel',
      value: '2 450 000 Ft',
      change: '+8.2%',
      changeType: 'increase',
      icon: 'CurrencyDollarIcon',
      color: 'success'
    },
    {
      id: 'overdue',
      title: 'Lejárt fizetések',
      value: '3',
      change: '-1',
      changeType: 'decrease',
      icon: 'ExclamationTriangleIcon',
      color: 'warning'
    }
  ];

  const mockRecentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Bérleti díj befizetés',
      description: 'Kovács János befizette a novemberi bérleti díjat',
      timestamp: '2 órája',
      status: 'success',
      propertyName: 'Budapest XIII. ker. Váci út 45.',
      tenantName: 'Kovács János'
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Karbantartási kérés',
      description: 'Csőtörés a fürdőszobában - sürgős javítás szükséges',
      timestamp: '4 órája',
      status: 'error',
      propertyName: 'Debrecen, Piac utca 12.',
      tenantName: 'Nagy Mária'
    },
    {
      id: '3',
      type: 'tenant',
      title: 'Új bérlő regisztráció',
      description: 'Szabó Péter regisztrált a rendszerbe',
      timestamp: '1 napja',
      status: 'info',
      propertyName: 'Szeged, Tisza Lajos krt. 8.'
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Számla generálás',
      description: 'Decemberi bérleti díj számlák elkészültek',
      timestamp: '2 napja',
      status: 'success'
    },
    {
      id: '5',
      type: 'payment',
      title: 'Késedelmes fizetés',
      description: 'Tóth Anna októberi bérleti díja még nem érkezett meg',
      timestamp: '3 napja',
      status: 'warning',
      propertyName: 'Pécs, Rákóczi út 23.',
      tenantName: 'Tóth Anna'
    }
  ];

  const mockUpcomingTasks: Task[] = [
    {
      id: '1',
      title: 'Bérleti díj emlékeztető',
      description: 'Novemberi bérleti díj fizetési határidő közeleg',
      dueDate: 'Ma',
      priority: 'high',
      type: 'rent',
      propertyName: 'Budapest V. ker. Váci utca 10.',
      tenantName: 'Kiss Éva'
    },
    {
      id: '2',
      title: 'Lakás szemle',
      description: 'Új bérlő lakásnézése',
      dueDate: 'Holnap 14:00',
      priority: 'medium',
      type: 'appointment',
      propertyName: 'Győr, Baross utca 5.'
    },
    {
      id: '3',
      title: 'Karbantartás ütemezés',
      description: 'Fűtésrendszer éves karbantartása',
      dueDate: '2024.11.08',
      priority: 'medium',
      type: 'maintenance',
      propertyName: 'Miskolc, Széchenyi utca 15.'
    },
    {
      id: '4',
      title: 'Szerződés megújítás',
      description: 'Bérleti szerződés lejár 30 napon belül',
      dueDate: '2024.11.15',
      priority: 'high',
      type: 'inspection',
      propertyName: 'Kecskemét, Kossuth tér 7.',
      tenantName: 'Varga Tamás'
    }
  ];

  const mockRevenueData: RevenueData[] = [
    { month: 'Jan', revenue: 2200000, expenses: 450000, net: 1750000 },
    { month: 'Feb', revenue: 2350000, expenses: 520000, net: 1830000 },
    { month: 'Már', revenue: 2180000, expenses: 480000, net: 1700000 },
    { month: 'Ápr', revenue: 2420000, expenses: 510000, net: 1910000 },
    { month: 'Máj', revenue: 2380000, expenses: 490000, net: 1890000 },
    { month: 'Jún', revenue: 2450000, expenses: 530000, net: 1920000 },
    { month: 'Júl', revenue: 2400000, expenses: 470000, net: 1930000 },
    { month: 'Aug', revenue: 2380000, expenses: 500000, net: 1880000 },
    { month: 'Szep', revenue: 2420000, expenses: 485000, net: 1935000 },
    { month: 'Okt', revenue: 2450000, expenses: 520000, net: 1930000 }
  ];

  if (!isHydrated) {
    return (
      <div className="space-y-8">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
              <div className="w-20 h-8 bg-muted rounded mb-2"></div>
              <div className="w-32 h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4"></div>
              <div className="w-24 h-4 bg-muted rounded mx-auto mb-2"></div>
              <div className="w-32 h-3 bg-muted rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-lg border border-border p-6 animate-pulse">
              <div className="w-48 h-6 bg-muted rounded mb-6"></div>
              <div className="w-full h-80 bg-muted rounded"></div>
            </div>
          </div>
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-border animate-pulse">
                <div className="p-6 border-b border-border">
                  <div className="w-40 h-6 bg-muted rounded"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-muted rounded"></div>
                        <div className="w-48 h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Metrics */}
      <KPICards metrics={mockKPIMetrics} />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Gyors műveletek</h2>
        <DashboardQuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          <RevenueChart data={mockRevenueData} />
          <RecentActivity activities={mockRecentActivities} />
        </div>

        {/* Right Column - Tasks and Notifications */}
        <div className="space-y-8">
          <UpcomingTasks tasks={mockUpcomingTasks} />
        </div>
      </div>
    </div>
  );
};

export default DashboardInteractive;