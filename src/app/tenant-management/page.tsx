'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { AppIcon } from '@/components/ui/AppIcon';

interface Tenant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Unit {
  id: string;
  name: string;
  property_id: string;
  properties?: {
    name: string;
    address: string;
  };
}

interface TenantInvite {
  id: string;
  email: string;
  status: string;
  invited_at: string;
  expires_at: string;
  units?: {
    id: string;
    name: string;
    properties?: {
      name: string;
    };
  };
}

interface TenantWithDetails extends Tenant {
  assigned_units?: Unit[];
  rent_charges?: any[];
  maintenance_requests?: any[];
}

const TenantManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithDetails[]>([]);
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTenantsAndInvites();
  }, []);

  const fetchTenantsAndInvites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tenants
      const { data: tenantsData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'TENANT');

      // Fetch tenant invites
      const { data: invitesData } = await supabase
        .from('tenant_invites')
        .select(`
          *,
          units (
            id,
            name,
            properties (
              name
            )
          )
        `)
        .eq('invited_by', user.id);

      // Fetch units for each tenant
      const tenantsWithUnits = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          // Get units assigned to this tenant through rent_charges
          const { data: rentCharges } = await supabase
            .from('rent_charges')
            .select(`
              units (
                id,
                name,
                property_id,
                properties (
                  name,
                  address
                )
              )
            `)
            .eq('tenant_id', tenant.id);

          // Get recent maintenance requests
          const { data: maintenanceRequests } = await supabase
            .from('maintenance_requests')
            .select('id, title, status, created_at')
            .eq('created_by_tenant_id', tenant.id)
            .order('created_at', { ascending: false })
            .limit(3);

          // Get recent rent charges
          const { data: recentCharges } = await supabase
            .from('rent_charges')
            .select('id, amount, due_date, status')
            .eq('tenant_id', tenant.id)
            .order('due_date', { ascending: false })
            .limit(3);

          const uniqueUnits = rentCharges?.reduce((acc: Unit[], charge: any) => {
            if (charge.units && !acc.find(u => u.id === charge.units.id)) {
              acc.push(charge.units);
            }
            return acc;
          }, []) || [];

          return {
            ...tenant,
            assigned_units: uniqueUnits,
            maintenance_requests: maintenanceRequests || [],
            rent_charges: recentCharges || []
          };
        })
      );

      setTenants(tenantsWithUnits);
      setInvites(invitesData || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_invites')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        })
        .eq('id', inviteId);

      if (error) throw error;

      alert('Meghívás újra elküldve!');
      fetchTenantsAndInvites();
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Hiba a meghívás újraküldése során.');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Biztosan törli a meghívást?')) return;

    try {
      const { error } = await supabase
        .from('tenant_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      alert('Meghívás törölve!');
      fetchTenantsAndInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
      alert('Hiba a meghívás törlése során.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Függőben',
      accepted: 'Elfogadva',
      declined: 'Elutasítva',
      expired: 'Lejárt',
      paid: 'Fizetve',
      overdue: 'Késedelem',
      open: 'Nyitott',
      in_progress: 'Folyamatban',
      completed: 'Befejezve',
      cancelled: 'Megszakítva'
    };
    return statusMap[status] || status;
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'active':
        return tenant.assigned_units && tenant.assigned_units.length > 0;
      case 'inactive':
        return !tenant.assigned_units || tenant.assigned_units.length === 0;
      default:
        return true;
    }
  });

  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Bérlők betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <AppIcon name="ArrowLeftIcon" className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Bérlők kezelése</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Új bérlő meghívása
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                Összes ({tenants.length})
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'active' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aktív ({tenants.filter(t => t.assigned_units && t.assigned_units.length > 0).length})
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'inactive' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inaktív ({tenants.filter(t => !t.assigned_units || t.assigned_units.length === 0).length})
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <AppIcon name="MagnifyingGlassIcon" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Keresés név vagy email alapján..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {paginatedTenants.map(tenant => (
            <div key={tenant.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{tenant.full_name}</h3>
                    <p className="text-gray-600 text-sm">{tenant.email}</p>
                    {tenant.phone && (
                      <p className="text-gray-600 text-sm">{tenant.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <AppIcon name="PencilIcon" className="h-4 w-4" />
                  </button>
                </div>

                {/* Assigned Units */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Hozzárendelt egységek</h4>
                  {tenant.assigned_units && tenant.assigned_units.length > 0 ? (
                    <div className="space-y-1">
                      {tenant.assigned_units.map(unit => (
                        <div key={unit.id} className="text-sm text-gray-600">
                          <span className="font-medium">{unit.name}</span>
                          {unit.properties && (
                            <span className="text-gray-500"> - {unit.properties.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nincs hozzárendelt egység</p>
                  )}
                </div>

                {/* Recent Activities */}
                <div className="space-y-3">
                  {/* Recent Payments */}
                  {tenant.rent_charges && tenant.rent_charges.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Legutóbbi fizetések
                      </h5>
                      {tenant.rent_charges.slice(0, 2).map((charge: any) => (
                        <div key={charge.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(charge.amount)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(charge.status)}`}>
                            {getStatusText(charge.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Maintenance */}
                  {tenant.maintenance_requests && tenant.maintenance_requests.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Karbantartási kérések
                      </h5>
                      {tenant.maintenance_requests.slice(0, 2).map((request: any) => (
                        <div key={request.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">
                            {request.title}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Csatlakozott: {formatDate(tenant.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Előző
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Következő
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredTenants.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredTenants.length}</span>
                  {' '}eredmény
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <AppIcon name="ChevronLeftIcon" className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' :'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <AppIcon name="ChevronRightIcon" className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Függő meghívások</h2>
            <div className="space-y-4">
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-sm text-gray-600">
                          {invite.units?.properties?.name} - {invite.units?.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(invite.status)}`}>
                        {getStatusText(invite.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Meghívva: {formatDate(invite.invited_at)} | 
                      Lejár: {formatDate(invite.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {invite.status === 'pending' && new Date(invite.expires_at) > new Date() && (
                      <button
                        onClick={() => handleResendInvite(invite.id)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Újraküld
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Töröl
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedTenants.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AppIcon name="UserGroupIcon" className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nincs bérlő</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Nincs találat a keresési feltételeknek megfelelően.' : 'Kezdje el bérlők meghívásával.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <AppIcon name="PlusIcon" className="-ml-1 mr-2 h-5 w-5" />
                  Bérlő meghívása
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would be implemented here */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Bérlő szerkesztése</h2>
            <p className="text-gray-600 mb-4">
              {selectedTenant?.full_name} adatainak szerkesztése
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Mégsem
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Bérlő meghívása</h2>
            <p className="text-gray-600 mb-4">
              Új bérlő meghívása az ingatlankezelő rendszerbe
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Mégsem
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Meghívás küldése
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagementPage;