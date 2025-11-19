'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  tier: number;
  price_huf: number;
  property_limit: number | null;
  features: string[];
  is_active: boolean;
  ai_enabled: boolean;
  description: string | null;
  created_at: string;
  subscriber_count?: number;
}

interface PackageFormData {
  name: string;
  code: string;
  tier: number;
  price_huf: number;
  property_limit: number | null;
  description: string;
  features: string[];
  is_active: boolean;
  ai_enabled: boolean;
}

interface PackageAnalytics {
  total_revenue: number;
  conversion_rate: number;
  popular_features: string[];
  subscriber_growth: number;
}

const SubscriptionPackageManagement = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);

  const supabase = createSupabaseClient();

  const defaultFormData: PackageFormData = {
    name: '',
    code: '',
    tier: 0,
    price_huf: 0,
    property_limit: null,
    description: '',
    features: [],
    is_active: true,
    ai_enabled: false
  };

  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);

  const availableFeatures = [
    'ingatlan_kezeles',
    'berlok_kezeles',
    'szamla_generator',
    'fizetes_nyomkoveto',
    'karbantartas_kezeles',
    'riport_generator',
    'ai_asszisztens',
    'email_automatizalas',
    'mobil_app',
    'api_hozzaferes',
    'premium_tamogatas'
  ];

  const featureTranslations: Record<string, string> = {
    'ingatlan_kezeles': 'Ingatlan kezelés',
    'berlok_kezeles': 'Bérlők kezelése',
    'szamla_generator': 'Számla generátor',
    'fizetes_nyomkoveto': 'Fizetés nyomkövető',
    'karbantartas_kezeles': 'Karbantartás kezelés',
    'riport_generator': 'Riport generátor',
    'ai_asszisztens': 'AI asszisztens',
    'email_automatizalas': 'Email automatizálás',
    'mobil_app': 'Mobil app',
    'api_hozzaferes': 'API hozzáférés',
    'premium_tamogatas': 'Prémium támogatás'
  };

  useEffect(() => {
    setIsHydrated(true);
    loadPlans();
    loadAnalytics();
  }, []);

  const loadPlans = async () => {
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('tier', { ascending: true });

      if (plansError) throw plansError;

      // Load subscriber counts for each plan
      const plansWithCounts = await Promise.all(
        (plansData || []).map(async (plan: SubscriptionPlan) => {
          const { count } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id)
            .eq('status', 'active');

          return {
            ...plan,
            subscriber_count: count || 0
          };
        })
      );

      setPlans(plansWithCounts);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Calculate analytics from subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans!inner(price_huf, features)
        `)
        .eq('status', 'active');

      if (subscriptions) {
        const totalRevenue = subscriptions.reduce((sum: number, sub: any) =>
          sum + (sub.plans?.price_huf || 0), 0
        );

        const featurePopularity: Record<string, number> = {};
        subscriptions.forEach((sub: any) => {
          if (sub.plans?.features) {
            sub.plans.features.forEach((feature: string) => {
              featurePopularity[feature] = (featurePopularity[feature] || 0) + 1;
            });
          }
        });

        const popularFeatures = Object.entries(featurePopularity)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([feature]) => feature);

        setAnalytics({
          total_revenue: totalRevenue,
          conversion_rate: 12.5, // Mock data
          popular_features: popularFeatures,
          subscriber_growth: 8.3 // Mock data
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('plans')
        .insert([{
          ...formData,
          property_limit: formData.property_limit === 0 ? null : formData.property_limit
        }]);

      if (error) throw error;

      setShowCreateModal(false);
      setFormData(defaultFormData);
      loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Hiba történt a csomag létrehozása során');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPlan) return;

    try {
      const { error } = await supabase
        .from('plans')
        .update({
          ...formData,
          property_limit: formData.property_limit === 0 ? null : formData.property_limit
        })
        .eq('id', editingPlan.id);

      if (error) throw error;

      setEditingPlan(null);
      setFormData(defaultFormData);
      loadPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Hiba történt a csomag frissítése során');
    }
  };

  const handleTogglePlanStatus = async (planId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: newStatus })
        .eq('id', planId);

      if (error) throw error;
      loadPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      tier: plan.tier,
      price_huf: plan.price_huf,
      property_limit: plan.property_limit,
      description: plan.description || '',
      features: plan.features,
      is_active: plan.is_active,
      ai_enabled: plan.ai_enabled
    });
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const getTierBadgeColor = (tier: number) => {
    switch (tier) {
      case 0: return 'bg-muted text-muted-foreground';
      case 1: return 'bg-primary/10 text-primary';
      case 2: return 'bg-success/10 text-success';
      case 3: return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6">
                  <div className="w-full h-32 bg-muted rounded"></div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="w-full h-64 bg-muted rounded"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Előfizetési csomagok kezelése
            </h1>
            <p className="text-muted-foreground">
              Csomagok létrehozása, módosítása és teljesítmény elemzése
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icon name="PlusIcon" size={16} />
            <span>Új csomag</span>
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="CurrencyDollarIcon" size={24} className="text-success" />
                <span className="text-sm text-muted-foreground">Teljes bevétel</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {analytics.total_revenue.toLocaleString()} Ft
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="ChartBarIcon" size={24} className="text-primary" />
                <span className="text-sm text-muted-foreground">Konverziós ráta</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {analytics.conversion_rate}%
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="TrendingUpIcon" size={24} className="text-success" />
                <span className="text-sm text-muted-foreground">Növekedés</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                +{analytics.subscriber_growth}%
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="UsersIcon" size={24} className="text-primary" />
                <span className="text-sm text-muted-foreground">Aktív előfizetők</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {plans.reduce((sum, plan) => sum + (plan.subscriber_count || 0), 0)}
              </div>
            </div>
          </div>
        )}

        {/* Plans Table */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Előfizetési csomagok
              </h2>
              <div className="flex items-center space-x-4">
                <select 
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="all">Összes csomag</option>
                  <option value="active">Aktív csomagok</option>
                  <option value="inactive">Inaktív csomagok</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Csomag</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Szint</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Ár</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Korlátok</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Funkciók</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Előfizetők</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Státusz</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {plans
                  .filter(plan => 
                    selectedPlan === 'all' || 
                    (selectedPlan === 'active' && plan.is_active) ||
                    (selectedPlan === 'inactive' && !plan.is_active)
                  )
                  .map((plan) => (
                  <tr key={plan.id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.code}</div>
                        {plan.description && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {plan.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(plan.tier)}`}>
                        Szint {plan.tier}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">
                        {plan.price_huf.toLocaleString()} Ft
                      </div>
                      <div className="text-xs text-muted-foreground">
                        /hó
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="text-foreground">
                          {plan.property_limit ? `${plan.property_limit} ingatlan` : 'Korlátlan'}
                        </div>
                        {plan.ai_enabled && (
                          <div className="text-xs text-primary">
                            AI engedélyezve
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground">
                        {plan.features.length} funkció
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                            {featureTranslations[feature] || feature}
                          </span>
                        ))}
                        {plan.features.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                            +{plan.features.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">
                        {plan.subscriber_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        előfizető
                      </div>
                    </td>
                    <td className="p-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.is_active}
                          onChange={(e) => handleTogglePlanStatus(plan.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Szerkesztés"
                        >
                          <Icon name="PencilIcon" size={16} />
                        </button>
                        <button
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Előfizetők megtekintése"
                        >
                          <Icon name="EyeIcon" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPlan) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingPlan ? 'Csomag szerkesztése' : 'Új csomag létrehozása'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPlan(null);
                      setFormData(defaultFormData);
                    }}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="XMarkIcon" size={20} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Csomag név
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Csomag kód
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Szint
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ár (HUF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price_huf}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_huf: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ingatlan korlát
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.property_limit || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        property_limit: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      placeholder="Üres = korlátlan"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">Aktív</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.ai_enabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, ai_enabled: e.target.checked }))}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">AI engedélyezve</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Leírás
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Funkciók
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableFeatures.map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="rounded border-border"
                        />
                        <span className="text-foreground">
                          {featureTranslations[feature] || feature}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPlan(null);
                      setFormData(defaultFormData);
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {editingPlan ? 'Módosítás' : 'Létrehozás'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPackageManagement;