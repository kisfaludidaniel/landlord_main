'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Home, CreditCard, Wrench, FileText, MessageCircle, Download, Calendar, Clock, Euro, User, Phone, Mail, Send, Shield } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface TenantPayment {
  id: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  late_fee: number;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  category: string;
  created_at: string;
  scheduled_date?: string;
  completed_date?: string;
  tenant_rating?: number;
}

interface UnitInfo {
  id: string;
  name: string;
  type: string;
  properties: {
    name: string;
    address: string;
    landlord_id: string;
    user_profiles: Array<{
      full_name: string;
      email: string;
      phone: string | null;
    }>;
  };
}

interface Document {
  id: string;
  name: string;
  file_path: string;
  document_type: string;
  created_at: string;
}

export default function TenantPortalDashboard() {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'general'
  });
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const supabase = createSupabaseClient();

  // Language content
  const content = {
    hu: {
      title: 'Bérlői Portál',
      subtitle: 'Személyre szabott bérlői felület bérleti díj fizetéshez, karbantartási kérésekhez és főbérlő kommunikációhoz',
      tabs: {
        overview: 'Áttekintés',
        payments: 'Fizetések',
        maintenance: 'Karbantartás', 
        documents: 'Dokumentumok',
        messages: 'Üzenetek'
      },
      metrics: {
        currentRent: 'Aktuális bérleti díj',
        nextPayment: 'Következő fizetés',
        maintenanceActive: 'Aktív karbantartások',
        messagesUnread: 'Olvasatlan üzenetek'
      },
      actions: {
        payRent: 'Bérleti díj fizetése',
        requestMaintenance: 'Karbantartási kérés',
        downloadLease: 'Bérleti szerződés letöltése',
        contactLandlord: 'Főbérlő elérése'
      },
      labels: {
        amount: 'Összeg',
        dueDate: 'Esedékesség',
        status: 'Állapot',
        description: 'Leírás',
        title: 'Cím',
        priority: 'Prioritás',
        category: 'Kategória',
        submit: 'Küldés',
        cancel: 'Mégse'
      },
      status: {
        pending: 'Függőben',
        processing: 'Feldolgozás alatt',
        completed: 'Befejezett',
        failed: 'Sikertelen',
        submitted: 'Beküldött',
        acknowledged: 'Tudomásul vett',
        in_progress: 'Folyamatban'
      },
      priority: {
        low: 'Alacsony',
        medium: 'Közepes',
        high: 'Magas',
        urgent: 'Sürgős'
      }
    },
    en: {
      title: 'Tenant Portal',
      subtitle: 'Personalized tenant interface for rent payments, maintenance requests, and landlord communication',
      tabs: {
        overview: 'Overview',
        payments: 'Payments',
        maintenance: 'Maintenance',
        documents: 'Documents', 
        messages: 'Messages'
      },
      metrics: {
        currentRent: 'Current Rent',
        nextPayment: 'Next Payment',
        maintenanceActive: 'Active Maintenance',
        messagesUnread: 'Unread Messages'
      },
      actions: {
        payRent: 'Pay Rent',
        requestMaintenance: 'Request Maintenance', 
        downloadLease: 'Download Lease',
        contactLandlord: 'Contact Landlord'
      },
      labels: {
        amount: 'Amount',
        dueDate: 'Due Date',
        status: 'Status',
        description: 'Description',
        title: 'Title',
        priority: 'Priority',
        category: 'Category',
        submit: 'Submit',
        cancel: 'Cancel'
      },
      status: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
        submitted: 'Submitted',
        acknowledged: 'Acknowledged',
        in_progress: 'In Progress'
      },
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      }
    }
  };

  const currentLang = 'hu'; // This would come from settings
  const t = content[currentLang];

  useEffect(() => {
    if (user && profile?.role === 'TENANT') {
      loadTenantData();
    }
  }, [user, profile]);

  const loadTenantData = async () => {
    try {
      setLoading(true);

      // Load unit information with landlord details
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          name,
          type,
          properties!inner (
            name,
            address,
            landlord_id,
            user_profiles!properties_landlord_id_fkey (
              full_name,
              email,
              phone
            )
          )
        `)
        .eq('tenant_id', user?.id)
        .single();

      if (!unitError && unitData) {
        const propertyRecord = Array.isArray(unitData.properties) ? unitData.properties[0] : unitData.properties;
        setUnitInfo({
          id: unitData.id,
          name: unitData.name,
          type: unitData.type,
          properties: {
            name: propertyRecord?.name || '',
            address: propertyRecord?.address || '',
            landlord_id: propertyRecord?.landlord_id || '',
            user_profiles: propertyRecord?.user_profiles || [],
          },
        });
      }

      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('tenant_payments')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('due_date', { ascending: false })
        .limit(10);

      if (!paymentsError && paymentsData) {
        setPayments(paymentsData);
      }

      // Load maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!maintenanceError && maintenanceData) {
        setMaintenanceRequests(maintenanceData);
      }

      // Load documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (!documentsError && documentsData) {
        setDocuments(documentsData);
      }

    } catch (error: any) {
      console.error('Error loading tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitMaintenanceRequest = async () => {
    if (!user || !unitInfo || !newMaintenanceRequest.title || !newMaintenanceRequest.description) {
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: user.id,
          unit_id: unitInfo.id,
          landlord_id: unitInfo.properties.landlord_id,
          title: newMaintenanceRequest.title,
          description: newMaintenanceRequest.description,
          priority: newMaintenanceRequest.priority,
          category: newMaintenanceRequest.category,
          status: 'submitted'
        });

      if (!error) {
        setNewMaintenanceRequest({
          title: '',
          description: '',
          priority: 'medium',
          category: 'general'
        });
        setShowMaintenanceForm(false);
        loadTenantData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error submitting maintenance request:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'HUF') => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'failed': case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Adatok betöltése...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'TENANT') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Hozzáférés megtagadva</h2>
            <p className="text-gray-600">Ez az oldal csak bérlők számára érhető el.</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingPayment = payments.find(p => p.status === 'pending');
  const activeMaintenanceCount = maintenanceRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
  const landlordProfile = unitInfo?.properties.user_profiles?.[0];

  const tabConfig = [
    { id: 'overview', label: t.tabs.overview, icon: Home },
    { id: 'payments', label: t.tabs.payments, icon: CreditCard },
    { id: 'maintenance', label: t.tabs.maintenance, icon: Wrench },
    { id: 'documents', label: t.tabs.documents, icon: FileText },
    { id: 'messages', label: t.tabs.messages, icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-gray-600 mt-1">{t.subtitle}</p>
              </div>
            </div>
            {unitInfo && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Bérelt ingatlan</p>
                <p className="font-semibold text-gray-900">{unitInfo.properties.name}</p>
                <p className="text-sm text-gray-600">{unitInfo.properties.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Overview Metrics */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.metrics.currentRent}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingPayment ? formatCurrency(upcomingPayment.amount) : '0 Ft'}
                  </p>
                </div>
                <Euro className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.metrics.nextPayment}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingPayment ? formatDate(upcomingPayment.due_date) : 'Nincs'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.metrics.maintenanceActive}</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMaintenanceCount}</p>
                </div>
                <Wrench className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t.metrics.messagesUnread}</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gyors műveletek</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-3">
                <CreditCard className="w-5 h-5" />
                <span>{t.actions.payRent}</span>
              </button>
              <button 
                onClick={() => setShowMaintenanceForm(true)}
                className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-3"
              >
                <Wrench className="w-5 h-5" />
                <span>{t.actions.requestMaintenance}</span>
              </button>
              <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-3">
                <Download className="w-5 h-5" />
                <span>{t.actions.downloadLease}</span>
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-3">
                <MessageCircle className="w-5 h-5" />
                <span>{t.actions.contactLandlord}</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Payments */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Legutóbbi fizetések</h3>
                    <div className="space-y-3">
                      {payments.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-600">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                              {t.status[payment.status as keyof typeof t.status]}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(payment.due_date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Maintenance */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Karbantartási kérések</h3>
                    <div className="space-y-3">
                      {maintenanceRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{request.title}</p>
                            <p className="text-sm text-gray-600">{request.category}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                              {t.status[request.status as keyof typeof t.status]}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(request.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Landlord Contact */}
                {unitInfo && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Főbérlő elérhetőségei</h3>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{landlordProfile?.full_name || '—'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{landlordProfile?.email || '—'}</span>
                      </div>
                      {landlordProfile?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-900">{landlordProfile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Fizetési előzmények</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Bérleti díj fizetése</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.labels.description}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.labels.amount}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.labels.dueDate}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.labels.status}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Műveletek
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(payment.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(payment.due_date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                              {t.status[payment.status as keyof typeof t.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {payment.status === 'pending' && (
                              <button className="text-blue-600 hover:text-blue-900">Fizetés</button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900 ml-3">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Karbantartási kérések</h3>
                  <button 
                    onClick={() => setShowMaintenanceForm(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Új kérés</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                          {t.priority[request.priority as keyof typeof t.priority]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {t.status[request.status as keyof typeof t.status]}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Dokumentumok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(doc.created_at)}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">Nincsenek elérhető dokumentumok</p>
                  )}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Üzenetek a főbérlővel</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Az üzenetküldő funkcionalitás hamarosan elérhető lesz</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Request Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Új karbantartási kérés</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.title}</label>
                <input
                  type="text"
                  value={newMaintenanceRequest.title}
                  onChange={(e) => setNewMaintenanceRequest({...newMaintenanceRequest, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rövid összefoglaló"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.description}</label>
                <textarea
                  rows={3}
                  value={newMaintenanceRequest.description}
                  onChange={(e) => setNewMaintenanceRequest({...newMaintenanceRequest, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Részletes leírás a problémáról"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.priority}</label>
                  <select
                    value={newMaintenanceRequest.priority}
                    onChange={(e) => setNewMaintenanceRequest({...newMaintenanceRequest, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Alacsony</option>
                    <option value="medium">Közepes</option>
                    <option value="high">Magas</option>
                    <option value="urgent">Sürgős</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.category}</label>
                  <select
                    value={newMaintenanceRequest.category}
                    onChange={(e) => setNewMaintenanceRequest({...newMaintenanceRequest, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">Általános</option>
                    <option value="plumbing">Vízszerelés</option>
                    <option value="electrical">Villanyszerelés</option>
                    <option value="heating">Fűtés</option>
                    <option value="cleaning">Takarítás</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t.labels.cancel}
              </button>
              <button
                onClick={submitMaintenanceRequest}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{t.labels.submit}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}