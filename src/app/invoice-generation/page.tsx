'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AppIcon } from '@/components/ui/AppIcon';

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
}

interface Unit {
  id: string;
  name: string;
  property_id: string;
}

interface Tenant {
  id: string;
  full_name: string;
  email: string;
}

interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  tenant_id: string;
  property_id: string;
  unit_id: string;
  lines: InvoiceLine[];
  total_amount: number;
  vat_amount: number;
  due_date: string;
  notes: string;
}

const InvoiceGenerationPage: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    tenant_id: '',
    property_id: '',
    unit_id: '',
    lines: [{ description: 'Bérleti díj', quantity: 1, unit_price: 0, total: 0 }],
    total_amount: 0,
    vat_amount: 0,
    due_date: '',
    notes: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setInvoiceData(prev => ({
      ...prev,
      due_date: defaultDueDate.toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    if (invoiceData.property_id) {
      fetchUnitsForProperty(invoiceData.property_id);
    }
  }, [invoiceData.property_id]);

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.lines]);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, name, address, type')
        .eq('landlord_id', user.id)
        .eq('is_active', true);

      // Fetch tenants
      const { data: tenantsData } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'TENANT');

      setProperties(propertiesData || []);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsForProperty = async (propertyId: string) => {
    try {
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, name, property_id')
        .eq('property_id', propertyId);

      setUnits(unitsData || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.lines.reduce((sum, line) => sum + line.total, 0);
    const vatRate = 0.27; // 27% ÁFA
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    setInvoiceData(prev => ({
      ...prev,
      total_amount: total,
      vat_amount: vatAmount
    }));
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const updatedLines = [...invoiceData.lines];
    
    if (field === 'quantity' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      updatedLines[index] = { ...updatedLines[index], [field]: numValue };
      
      // Recalculate total for this line
      updatedLines[index].total = updatedLines[index].quantity * updatedLines[index].unit_price;
    } else {
      updatedLines[index] = { ...updatedLines[index], [field]: value };
    }

    setInvoiceData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setInvoiceData(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    }));
  };

  const removeLine = (index: number) => {
    if (invoiceData.lines.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveInvoice = async (asDraft = true) => {
    if (!invoiceData.tenant_id || !invoiceData.property_id || invoiceData.lines.length === 0) {
      alert('Kérjük, töltse ki a kötelező mezőket!');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          landlord_id: user.id,
          tenant_id: invoiceData.tenant_id,
          property_id: invoiceData.property_id,
          unit_id: invoiceData.unit_id || null,
          lines: invoiceData.lines,
          total_amount: invoiceData.total_amount,
          vat_amount: invoiceData.vat_amount,
          due_date: invoiceData.due_date,
          notes: invoiceData.notes,
          status: asDraft ? 'draft' : 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        type: 'invoice_created',
        ref_id: data.id,
        message: `Számla ${asDraft ? 'piszkozatként mentve' : 'elküldve'}: ${data.invoice_number}`
      });

      alert(`Számla sikeresen ${asDraft ? 'piszkozatként mentve' : 'elküldve'}!`);
      router.push('/main-dashboard');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Hiba történt a számla mentése során.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Adatok betöltése...</p>
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
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <AppIcon name="ArrowLeftIcon" className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Számla készítése</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {previewMode ? 'Szerkesztés' : 'Előnézet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invoice Form */}
          {!previewMode && (
            <div className="space-y-6">
              {/* Partner Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner adatok</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bérlő *
                    </label>
                    <select
                      value={invoiceData.tenant_id}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, tenant_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Válasszon bérlőt</option>
                      {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.full_name} ({tenant.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingatlan *
                    </label>
                    <select
                      value={invoiceData.property_id}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, property_id: e.target.value, unit_id: '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Válasszon ingatlant</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name} - {property.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {units.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Egység (opcionális)
                      </label>
                      <select
                        value={invoiceData.unit_id}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, unit_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Válasszon egységet</option>
                        {units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Lines */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Számla tételek</h2>
                <div className="space-y-4">
                  {invoiceData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Megnevezés
                        </label>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tétel megnevezése"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mennyiség
                        </label>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Egységár
                        </label>
                        <input
                          type="number"
                          value={line.unit_price}
                          onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Összesen
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right font-medium">
                          {formatCurrency(line.total)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeLine(index)}
                          disabled={invoiceData.lines.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <AppIcon name="TrashIcon" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={addLine}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Új tétel hozzáadása
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">További részletek</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fizetési határidő
                    </label>
                    <input
                      type="date"
                      value={invoiceData.due_date}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Megjegyzés
                    </label>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Opcionális megjegyzések..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Preview */}
          <div className={`${previewMode ? 'col-span-full' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm p-8 min-h-[600px]">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">SZÁMLA</h1>
                <p className="text-gray-600">Számla száma: [AUTOMATIKUS]</p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Kiállító:</h3>
                  <p className="text-gray-600">
                    [Főbérlő adatai]<br />
                    [Cím]<br />
                    [Adószám]
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Vevő:</h3>
                  {invoiceData.tenant_id ? (
                    <p className="text-gray-600">
                      {tenants.find(t => t.id === invoiceData.tenant_id)?.full_name}<br />
                      {tenants.find(t => t.id === invoiceData.tenant_id)?.email}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">Válasszon bérlőt</p>
                  )}
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Megnevezés</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Menny.</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Egységár</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Összesen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.lines.map((line, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">
                          {line.description || 'Tétel megnevezése'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {line.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(line.unit_price)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(line.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Nettó összeg:</span>
                    <span>{formatCurrency(invoiceData.total_amount - invoiceData.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>ÁFA (27%):</span>
                    <span>{formatCurrency(invoiceData.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg border-t">
                    <span>Fizetendő összeg:</span>
                    <span>{formatCurrency(invoiceData.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-sm text-gray-600">
                <p>Fizetési határidő: {invoiceData.due_date || 'Nincs megadva'}</p>
                {invoiceData.notes && (
                  <div className="mt-4">
                    <p className="font-medium">Megjegyzés:</p>
                    <p>{invoiceData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mégsem
          </button>
          <button
            onClick={() => handleSaveInvoice(true)}
            disabled={saving}
            className="px-6 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Mentés...' : 'Piszkozat mentése'}
          </button>
          <button
            onClick={() => handleSaveInvoice(false)}
            disabled={saving}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Küldés...' : 'Számla küldése'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerationPage;