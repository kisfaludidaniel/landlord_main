'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import Icon from '@/components/ui/AppIcon';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'LANDLORD' | 'TENANT';
  phone?: string;
  company_name?: string;
  company_vat_id?: string;
  company_address?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  subscription?: {
    id: string;
    status: string;
    plan_name: string;
    plan_price: number;
    current_period_end: string;
  };
  last_activity?: string;
}

interface UserFilters {
  role: string;
  status: string;
  search: string;
}

const UsersManagement = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    setIsHydrated(true);
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          phone,
          company_name,
          company_vat_id,
          company_address,
          stripe_customer_id,
          created_at,
          updated_at,
          subscriptions(
            id,
            status,
            current_period_end,
            plans(
              name,
              price_huf
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const formattedUsers: UserProfile[] = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role as 'ADMIN' | 'LANDLORD' | 'TENANT',
        phone: user.phone || undefined,
        company_name: user.company_name || undefined,
        company_vat_id: user.company_vat_id || undefined,
        company_address: user.company_address || undefined,
        stripe_customer_id: user.stripe_customer_id || undefined,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        subscription: user.subscriptions?.[0] ? {
          id: user.subscriptions[0].id,
          status: user.subscriptions[0].status,
          plan_name: user.subscriptions[0].plans?.name || 'Unknown',
          plan_price: user.subscriptions[0].plans?.price_huf || 0,
          current_period_end: user.subscriptions[0].current_period_end
        } : undefined,
        last_activity: getRandomLastActivity()
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomLastActivity = () => {
    const activities = [
      '2 órája', '5 órája', '1 napja', '2 napja', '1 hete', '2 hete', '1 hónapja'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role.toUpperCase());
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.subscription?.status === 'active');
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(user => !user.subscription || user.subscription.status !== 'active');
      } else if (filters.status === 'suspended') {
        filtered = filtered.filter(user => user.subscription?.status === 'cancelled');
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.company_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-error/10 text-error';
      case 'LANDLORD':
        return 'bg-primary/10 text-primary';
      case 'TENANT':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      case 'past_due':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'suspend':
          // Update user subscription status
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', userId);
          break;
        case 'activate':
          // Reactivate user subscription
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('user_id', userId);
          break;
        case 'delete':
          // Delete user (soft delete by updating a flag if needed)
          if (confirm('Biztos törölni szeretné ezt a felhasználót?')) {
            await supabase
              .from('user_profiles')
              .delete()
              .eq('id', userId);
          }
          break;
      }
      loadUsers(); // Reload data
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (bulkSelected.length === 0) return;

    try {
      switch (action) {
        case 'suspend':
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .in('user_id', bulkSelected);
          break;
        case 'activate':
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .in('user_id', bulkSelected);
          break;
        case 'role_change':
          // Implement role change logic
          break;
      }
      setBulkSelected([]);
      loadUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const UserDetailsModal = ({ user, onClose }: { user: UserProfile; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Felhasználó részletei</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Teljes név</label>
              <input
                type="text"
                value={user.full_name}
                className="w-full p-3 border border-border rounded-lg bg-background"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full p-3 border border-border rounded-lg bg-background"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Szerepkör</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Telefon</label>
              <input
                type="tel"
                value={user.phone || ''}
                className="w-full p-3 border border-border rounded-lg bg-background"
                readOnly
              />
            </div>
          </div>

          {user.subscription && (
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Előfizetés információk</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Csomag:</span>
                  <p className="font-medium">{user.subscription.plan_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Státusz:</span>
                  <p className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(user.subscription.status)}`}>
                    {user.subscription.status}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ár:</span>
                  <p className="font-medium">{user.subscription.plan_price.toLocaleString()} Ft</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Lejárat:</span>
                  <p className="font-medium">
                    {new Date(user.subscription.current_period_end).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleUserAction(user.id, user.subscription?.status === 'active' ? 'suspend' : 'activate')}
              className="px-4 py-2 bg-warning text-warning-foreground rounded-lg hover:bg-warning/90 transition-colors"
            >
              {user.subscription?.status === 'active' ? 'Felfüggesztés' : 'Aktiválás'}
            </button>
            <button
              onClick={() => handleUserAction(user.id, 'delete')}
              className="px-4 py-2 bg-error text-error-foreground rounded-lg hover:bg-error/90 transition-colors"
            >
              Törlés
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-12 bg-muted rounded w-full"></div>
            <div className="h-96 bg-muted rounded w-full"></div>
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
            Felhasználó kezelés
          </h1>
          <p className="text-muted-foreground">
            Átfogó felhasználó adminisztráció szerepkör-alapú szűréssel és fejlett műveleti lehetőségekkel
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Icon name="MagnifyingGlassIcon" size={20} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Keresés név vagy email alapján..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-lg bg-background min-w-[250px]"
                />
              </div>
              
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="all">Összes szerepkör</option>
                <option value="admin">Admin</option>
                <option value="landlord">Főbérlő</option>
                <option value="tenant">Bérlő</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="all">Összes státusz</option>
                <option value="active">Aktív</option>
                <option value="inactive">Inaktív</option>
                <option value="suspended">Felfüggesztett</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="UserPlusIcon" size={20} />
                Új felhasználó
              </button>
            </div>
          </div>

          {bulkSelected.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {bulkSelected.length} felhasználó kiválasztva
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 text-sm bg-warning text-warning-foreground rounded hover:bg-warning/90"
                >
                  Felfüggesztés
                </button>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm bg-success text-success-foreground rounded hover:bg-success/90"
                >
                  Aktiválás
                </button>
                <button
                  onClick={() => setBulkSelected([])}
                  className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/90"
                >
                  Kijelölés törlése
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelected(filteredUsers.map(u => u.id));
                        } else {
                          setBulkSelected([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Név</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Szerepkör</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Státusz</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Utolsó aktivitás</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Regisztráció</th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelected(prev => [...prev, user.id]);
                          } else {
                            setBulkSelected(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.full_name}</div>
                          {user.company_name && (
                            <div className="text-sm text-muted-foreground">{user.company_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground">{user.email}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.subscription?.status)}`}>
                        {user.subscription?.status === 'active' ? 'Aktív' : 
                         user.subscription?.status === 'cancelled'? 'Felfüggesztett' : user.subscription ?'Inaktív' : 'Nincs előfizetés'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{user.last_activity}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('hu-HU')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Részletek megtekintése"
                        >
                          <Icon name="EyeIcon" size={16} />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, user.subscription?.status === 'active' ? 'suspend' : 'activate')}
                          className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                          title={user.subscription?.status === 'active' ? 'Felfüggesztés' : 'Aktiválás'}
                        >
                          <Icon name={user.subscription?.status === 'active' ? 'PauseIcon' : 'PlayIcon'} size={16} />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Törlés"
                        >
                          <Icon name="TrashIcon" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <Icon name="UsersIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nincs találat a megadott szűrési feltételekkel.</p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <UserDetailsModal 
            user={selectedUser} 
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }} 
          />
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border max-w-md w-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Új felhasználó</h2>
                  <button 
                    onClick={() => setShowAddUserModal(false)} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="XMarkIcon" size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Teljes név</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-border rounded-lg bg-background"
                      placeholder="Teljes név"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-border rounded-lg bg-background"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Szerepkör</label>
                    <select className="w-full p-3 border border-border rounded-lg bg-background">
                      <option value="TENANT">Bérlő</option>
                      <option value="LANDLORD">Főbérlő</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Mégse
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Létrehozás
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;