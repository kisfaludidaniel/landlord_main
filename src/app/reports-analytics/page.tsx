'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface ReportMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
}

interface SystemActivity {
  id: string;
  type: 'subscription' | 'user' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
}

const ReportsAnalytics = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedChart, setSelectedChart] = useState<string>('revenue');

  const supabase = createSupabaseClient();

  useEffect(() => {
    setIsHydrated(true);
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // Load subscriptions data
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          created_at,
          current_period_end,
          user_profiles!inner(full_name, email),
          plans!inner(name, price_huf)
        `)
        .order('created_at', { ascending: false });

      // Load users data
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, role, created_at')
        .order('created_at', { ascending: false });

      // Load plans data
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true);

      setSubscriptions(subscriptionsData || []);
      setUsers(usersData || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalUsers = users.length;
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.plans?.price_huf || 0), 0);

  const churnRate = totalSubscriptions > 0 
    ? ((subscriptions.filter(s => s.status === 'cancelled').length / totalSubscriptions) * 100).toFixed(1)
    : '0.0';

  const reportMetrics: ReportMetric[] = [
    {
      id: 'total_subscriptions',
      title: 'Összes előfizetés',
      value: totalSubscriptions.toString(),
      change: '+12.5%',
      changeType: 'increase',
      icon: 'CreditCardIcon',
      color: 'primary'
    },
    {
      id: 'active_users',
      title: 'Aktív felhasználók',
      value: activeSubscriptions.toString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: 'UsersIcon',
      color: 'success'
    },
    {
      id: 'mrr',
      title: 'Havi ismétlődő bevétel (MRR)',
      value: `${mrr.toLocaleString()} Ft`,
      change: '+15.3%',
      changeType: 'increase',
      icon: 'CurrencyDollarIcon',
      color: 'success'
    },
    {
      id: 'churn_rate',
      title: 'Lemorzsolódási ráta',
      value: `${churnRate}%`,
      change: '-0.5%',
      changeType: 'decrease',
      icon: 'ArrowTrendingDownIcon',
      color: 'warning'
    }
  ];

  // Generate chart data
  const generateRevenueChartData = () => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        name: date.toLocaleDateString('hu-HU', { month: 'short', year: 'numeric' }),
        value: Math.floor(Math.random() * 100000) + 50000
      };
    });
    return last12Months;
  };

  const generateUserGrowthData = () => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        name: date.toLocaleDateString('hu-HU', { month: 'short' }),
        value: Math.floor(Math.random() * 50) + 10
      };
    });
    return last12Months;
  };

  const generatePlanBreakdownData = () => {
    return plans.map(plan => ({
      name: plan.name,
      value: subscriptions.filter(s => s.plans?.name === plan.name && s.status === 'active').length
    }));
  };

  const generateRecentActivities = (): SystemActivity[] => {
    return [
      {
        id: '1',
        type: 'subscription',
        title: 'Új előfizetés létrejött',
        description: 'Felhasználó aktiválta a Pro csomagot',
        timestamp: '2 órája',
        status: 'success',
        amount: 9990
      },
      {
        id: '2',
        type: 'payment',
        title: 'Fizetés sikertelen',
        description: 'Stripe webhook hiba a számlázás során',
        timestamp: '4 órája',
        status: 'error',
        amount: -4990
      },
      {
        id: '3',
        type: 'subscription',
        title: 'Előfizetés lemondva',
        description: 'Felhasználó lemondta a Starter csomagot',
        timestamp: '6 órája',
        status: 'warning',
        amount: -4990
      },
      {
        id: '4',
        type: 'user',
        title: 'Új felhasználó regisztráció',
        description: 'LANDLORD szerepkörrel regisztrált új felhasználó',
        timestamp: '1 napja',
        status: 'info'
      },
      {
        id: '5',
        type: 'system',
        title: 'Rendszer karbantartás',
        description: 'Automatikus biztonsági mentés befejezve',
        timestamp: '2 napja',
        status: 'success'
      }
    ];
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'CreditCardIcon';
      case 'user':
        return 'UserPlusIcon';
      case 'payment':
        return 'CurrencyDollarIcon';
      case 'system':
        return 'CogIcon';
      default:
        return 'InformationCircleIcon';
    }
  };

  const SimpleChart = ({ data, title }: { data: ChartData[]; title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-muted-foreground text-right">
                {item.name}
              </div>
              <div className="flex-1 bg-muted rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-foreground text-right">
                {typeof item.value === 'number' && item.value > 1000 
                  ? `${item.value.toLocaleString()}` 
                  : item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6">
                  <div className="w-full h-24 bg-muted rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="w-full h-96 bg-muted rounded"></div>
              </div>
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="w-full h-96 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Riportok és Analitika
          </h1>
          <p className="text-muted-foreground">
            Átfogó üzleti intelligencia MRR követéssel, lemorzsolódási elemzéssel és rendszer teljesítmény metrikákkal
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Időszak beállítások</h2>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="7d">Utolsó 7 nap</option>
                <option value="30d">Utolsó 30 nap</option>
                <option value="90d">Utolsó 90 nap</option>
                <option value="12m">Utolsó 12 hónap</option>
                <option value="custom">Egyéni időszak</option>
              </select>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Icon name="DocumentArrowDownIcon" size={20} />
                Riport exportálása
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportMetrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-subtle transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg border ${getColorClasses(metric.color)}`}>
                  <Icon name={metric.icon as any} size={24} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.changeType === 'increase' ? 'text-success' : 
                  metric.changeType === 'decrease'? 'text-error' : 'text-muted-foreground'
                }`}>
                  <Icon 
                    name={metric.changeType === 'increase' ? 'ArrowTrendingUpIcon' : 
                          metric.changeType === 'decrease'? 'ArrowTrendingDownIcon' : 'MinusIcon'} 
                    size={16} 
                  />
                  <span className="font-medium">{metric.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {metric.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Trends Chart */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Bevétel trendek</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedChart('revenue')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedChart === 'revenue' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Bevétel
                </button>
                <button
                  onClick={() => setSelectedChart('users')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedChart === 'users' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Felhasználók
                </button>
              </div>
            </div>
            
            {selectedChart === 'revenue' ? (
              <SimpleChart 
                data={generateRevenueChartData()} 
                title="Havi bevétel alakulása (Ft)"
              />
            ) : (
              <SimpleChart 
                data={generateUserGrowthData()} 
                title="Új felhasználók havonta"
              />
            )}
          </div>

          {/* Plan Breakdown */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Csomagok megoszlása</h2>
            <SimpleChart 
              data={generatePlanBreakdownData()} 
              title="Aktív előfizetések csomagok szerint"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Performance */}
          <div className="lg:col-span-2 bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Rendszer teljesítmény</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">API válaszidő</span>
                    <span className="text-sm font-medium text-foreground">120ms</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Rendszer üzemidő</span>
                    <span className="text-sm font-medium text-foreground">99.98%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Hiba arány</span>
                    <span className="text-sm font-medium text-foreground">0.02%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-error h-2 rounded-full w-1/12"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">DB lekérdezés</span>
                    <span className="text-sm font-medium text-foreground">45ms</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-1/2"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Memória használat</span>
                    <span className="text-sm font-medium text-foreground">67%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">CPU terhelés</span>
                    <span className="text-sm font-medium text-foreground">34%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent System Activities */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Legutóbbi rendszer tevékenységek
            </h2>
            
            <div className="space-y-4">
              {generateRecentActivities().map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className={`p-2 rounded-lg border border-border ${getActivityColor(activity.status)}`}>
                    <Icon name={getActivityIcon(activity.type) as any} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                      {activity.amount && (
                        <span className={`text-xs font-medium ${
                          activity.amount > 0 ? 'text-success' : 'text-error'
                        }`}>
                          {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString()} Ft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                Összes tevékenység megtekintése →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;