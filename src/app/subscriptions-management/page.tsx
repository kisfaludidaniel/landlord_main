'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Edit, X, Check, AlertCircle, Calendar, User, Package } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'] & {
  user_profiles: Database['public']['Tables']['user_profiles']['Row']
  plans: Database['public']['Tables']['plans']['Row']
}

type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'

interface SubscriptionEditForm {
  id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_end: string
}

export default function SubscriptionsManagementPage() {
  const supabase = createClient()
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionEditForm | null>(null)
  const [availablePlans, setAvailablePlans] = useState<Database['public']['Tables']['plans']['Row'][]>([])

  // Load data
  useEffect(() => {
    loadSubscriptions()
    loadPlans()
  }, [])

  // Filter subscriptions based on search and status
  useEffect(() => {
    let filtered = subscriptions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plans?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, searchTerm, statusFilter])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            email,
            role
          ),
          plans (
            id,
            name,
            price_huf,
            tier
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        setError(`Hiba az előfizetések betöltésekor: ${error.message}`)
        return
      }
      
      setSubscriptions(data || [])
    } catch (err) {
      setError('Váratlan hiba történt az előfizetések betöltésekor')
    } finally {
      setLoading(false)
    }
  }

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('tier')
      
      if (error) {
        setError(`Hiba a csomagok betöltésekor: ${error.message}`)
        return
      }
      
      setAvailablePlans(data || [])
    } catch (err) {
      setError('Váratlan hiba történt a csomagok betöltésekor')
    }
  }

  const getStatusBadge = (status: SubscriptionStatus) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800', 
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      active: 'Aktív',
      inactive: 'Inaktív',
      cancelled: 'Lemondva',
      past_due: 'Lejárt'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', { 
      style: 'currency', 
      currency: 'HUF' 
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU')
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription({
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      current_period_end: subscription.current_period_end
    })
    setShowEditModal(true)
  }

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: editingSubscription.plan_id,
          status: editingSubscription.status,
          current_period_end: editingSubscription.current_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSubscription.id)
      
      if (error) {
        setError(`Hiba az előfizetés frissítésekor: ${error.message}`)
        return
      }
      
      setShowEditModal(false)
      setEditingSubscription(null)
      loadSubscriptions()
    } catch (err) {
      setError('Váratlan hiba történt a frissítés során')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: SubscriptionStatus) => {
    const newStatus = currentStatus === 'active' ? 'cancelled' : 'active'
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        setError(`Hiba a státusz váltásakor: ${error.message}`)
        return
      }
      
      loadSubscriptions()
    } catch (err) {
      setError('Váratlan hiba történt a státusz váltás során')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Előfizetések kezelése</h1>
              <p className="text-gray-600 mt-2">Felhasználói előfizetések áttekintése és kezelése</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Összes előfizetés</p>
              <p className="text-2xl font-bold text-blue-600">{subscriptions.length}</p>
            </div>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Keresés név vagy email alapján..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Minden státusz</option>
                <option value="active">Aktív</option>
                <option value="past_due">Lejárt</option>
                <option value="cancelled">Lemondva</option>
                <option value="inactive">Inaktív</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Előfizetések ({filteredSubscriptions.length})
            </h2>

            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nincsenek előfizetések</h3>
                <p className="text-gray-500">Jelenleg nincsenek a szűrési feltételeknek megfelelő előfizetések</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Felhasználó</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Csomag</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Státusz</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ár</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Időszak</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Létrehozva</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Következő számla</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{subscription.user_profiles?.full_name}</p>
                              <p className="text-sm text-gray-500">{subscription.user_profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{subscription.plans?.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">
                            {formatPrice(subscription.plans?.price_huf || 0)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            <p>{formatDate(subscription.current_period_start)}</p>
                            <p>- {formatDate(subscription.current_period_end)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(subscription.created_at)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(subscription.current_period_end)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(subscription)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(subscription.id, subscription.status)}
                              className={`p-1 rounded ${
                                subscription.status === 'active' ?'text-red-600 hover:text-red-700' :'text-green-600 hover:text-green-700'
                              }`}
                            >
                              {subscription.status === 'active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Előfizetés szerkesztése</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Csomag
                    </label>
                    <select
                      value={editingSubscription.plan_id}
                      onChange={(e) => setEditingSubscription({
                        ...editingSubscription,
                        plan_id: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availablePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatPrice(plan.price_huf)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Státusz
                    </label>
                    <select
                      value={editingSubscription.status}
                      onChange={(e) => setEditingSubscription({
                        ...editingSubscription,
                        status: e.target.value as SubscriptionStatus
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Aktív</option>
                      <option value="inactive">Inaktív</option>
                      <option value="cancelled">Lemondva</option>
                      <option value="past_due">Lejárt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Időszak vége
                    </label>
                    <input
                      type="datetime-local"
                      value={editingSubscription.current_period_end.slice(0, 16)}
                      onChange={(e) => setEditingSubscription({
                        ...editingSubscription,
                        current_period_end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateSubscription}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Frissítés
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}