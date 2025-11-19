'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Save, X, AlertCircle, Package, DollarSign, Settings, Check } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Plan = Database['public']['Tables']['plans']['Row']
type PlanTier = 'free' | 'starter' | 'pro' | 'unlimited'

interface PlanFormData {
  name: string
  code: PlanTier
  price_huf: number
  property_limit: number | null
  ai_enabled: boolean
  description: string
  features: string[]
  is_active: boolean
  tier: number
}

const defaultFeatures = [
  'ingatlan_kezeles',
  'berlok_kezelese', 
  'szamla_generalas',
  'alapveto_riportok',
  'email_ertesitesek',
  'mobil_alkalmazas',
  'adatmentes',
  'ai_asszisztens',
  'fejlett_riportok',
  'api_hozzaferes',
  'prioritas_tamogatas',
  'testreszabott_funkcionalitas'
]

const featureLabels: Record<string, string> = {
  'ingatlan_kezeles': 'Ingatlan kezelés',
  'berlok_kezelese': 'Bérlők kezelése',
  'szamla_generalas': 'Számla generálás',
  'alapveto_riportok': 'Alapvető riportok',
  'email_ertesitesek': 'Email értesítések',
  'mobil_alkalmazas': 'Mobil alkalmazás',
  'adatmentes': 'Adatmentés',
  'ai_asszisztens': 'AI asszisztens',
  'fejlett_riportok': 'Fejlett riportok',
  'api_hozzaferes': 'API hozzáférés',
  'prioritas_tamogatas': 'Prioritás támogatás',
  'testreszabott_funkcionalitas': 'Testreszabott funkcionalitás'
}

export default function PackagesManagementPage() {
  const supabase = createClient()
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    code: 'free',
    price_huf: 0,
    property_limit: 1,
    ai_enabled: false,
    description: '',
    features: ['ingatlan_kezeles', 'berlok_kezelese'],
    is_active: true,
    tier: 0
  })

  // Load plans
  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('tier', { ascending: true })
      
      if (error) {
        setError(`Hiba a csomagok betöltésekor: ${error.message}`)
        return
      }
      
      setPlans(data || [])
    } catch (err) {
      setError('Váratlan hiba történt a csomagok betöltésekor')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', { 
      style: 'currency', 
      currency: 'HUF' 
    }).format(price)
  }

  const getTierLabel = (code: PlanTier) => {
    const labels = {
      free: 'Ingyenes',
      starter: 'Kezdő',
      pro: 'Professzionális',
      unlimited: 'Korlátlan'
    }
    return labels[code]
  }

  const getTierColor = (code: PlanTier) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      unlimited: 'bg-gold-100 text-gold-800'
    }
    return colors[code]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update({
            name: formData.name,
            code: formData.code,
            price_huf: formData.price_huf,
            property_limit: formData.property_limit,
            ai_enabled: formData.ai_enabled,
            description: formData.description,
            features: formData.features,
            is_active: formData.is_active,
            tier: formData.tier
          })
          .eq('id', editingPlan.id)
          
        if (error) {
          setError(`Hiba a csomag frissítésekor: ${error.message}`)
          return
        }
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert({
            name: formData.name,
            code: formData.code,
            price_huf: formData.price_huf,
            property_limit: formData.property_limit,
            ai_enabled: formData.ai_enabled,
            description: formData.description,
            features: formData.features,
            is_active: formData.is_active,
            tier: formData.tier
          })
          
        if (error) {
          setError(`Hiba a csomag létrehozásakor: ${error.message}`)
          return
        }
      }
      
      // Reset form and reload
      resetForm()
      loadPlans()
      
    } catch (err) {
      setError('Váratlan hiba történt')
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      code: plan.code as PlanTier,
      price_huf: plan.price_huf,
      property_limit: plan.property_limit,
      ai_enabled: plan.ai_enabled,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features : [],
      is_active: plan.is_active ?? true,
      tier: plan.tier
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a csomagot?')) return
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)
      
      if (error) {
        setError(`Hiba a csomag törlésekor: ${error.message}`)
        return
      }
      
      loadPlans()
    } catch (err) {
      setError('Váratlan hiba történt a törlés során')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !currentActive })
        .eq('id', id)
      
      if (error) {
        setError(`Hiba a csomag aktiválás/deaktiválás során: ${error.message}`)
        return
      }
      
      loadPlans()
    } catch (err) {
      setError('Váratlan hiba történt az aktiválás/deaktiválás során')
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: 'free',
      price_huf: 0,
      property_limit: 1,
      ai_enabled: false,
      description: '',
      features: ['ingatlan_kezeles', 'berlok_kezelese'],
      is_active: true,
      tier: 0
    })
    setEditingPlan(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Csomagok kezelése</h1>
              <p className="text-gray-600 mt-2">Árképzési csomagok létrehozása és szerkesztése</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Új csomag hozzáadása
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingPlan ? 'Csomag szerkesztése' : 'Új csomag hozzáadása'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Csomag neve *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="pl. Professzionális csomag"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Csomag típusa *
                  </label>
                  <select
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value as PlanTier})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="free">Ingyenes</option>
                    <option value="starter">Kezdő</option>
                    <option value="pro">Professzionális</option>
                    <option value="unlimited">Korlátlan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ár (HUF) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price_huf}
                    onChange={(e) => setFormData({...formData, price_huf: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingatlan korlát
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.property_limit || ''}
                    onChange={(e) => setFormData({...formData, property_limit: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Korlátlan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier szint *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Csomag részletes leírása..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Funkciók
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {defaultFeatures.map(feature => (
                    <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{featureLabels[feature]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ai_enabled}
                    onChange={(e) => setFormData({...formData, ai_enabled: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">AI funkciók engedélyezése</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktív csomag</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingPlan ? 'Frissítés' : 'Létrehozás'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Mégse
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Plans List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Meglévő csomagok ({plans.length})</h2>

            {plans.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nincsenek csomagok</h3>
                <p className="text-gray-500 mb-6">Kezdj el csomagokat hozzáadni az értékesítéshez</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Első csomag hozzáadása
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-6 ${plan.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(plan.code as PlanTier)}`}>
                          {getTierLabel(plan.code as PlanTier)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {plan.is_active && <Check className="w-4 h-4 text-green-500" />}
                        {!plan.is_active && <X className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(plan.price_huf)}
                        </span>
                        <span className="text-sm text-gray-500">/hó</span>
                      </div>
                      
                      {plan.property_limit && (
                        <p className="text-sm text-gray-600">
                          Ingatlan korlát: {plan.property_limit} db
                        </p>
                      )}
                      
                      {plan.ai_enabled && (
                        <p className="text-sm text-green-600 font-medium">
                          ✨ AI funkciók
                        </p>
                      )}
                    </div>

                    {plan.description && (
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    )}

                    {/* Features */}
                    {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Funkciók:</h4>
                        <div className="space-y-1">
                          {plan.features.slice(0, 4).map((feature: string) => (
                            <p key={feature} className="text-xs text-gray-600 flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-500" />
                              {featureLabels[feature] || feature}
                            </p>
                          ))}
                          {plan.features.length > 4 && (
                            <p className="text-xs text-gray-500">
                              +{plan.features.length - 4} további funkció
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan.id, plan.is_active ?? true)}
                          className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        Tier {plan.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}