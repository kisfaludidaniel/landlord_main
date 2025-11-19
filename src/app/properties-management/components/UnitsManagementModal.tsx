'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Property {
  id: string;
  name: string;
  propertyType: string;
  address: string;
}

interface Building {
  id: string;
  name: string;
  address: string;
}

interface Unit {
  id: string;
  name: string;
  unit_type: 'lakas' | 'uzlet' | 'iroda' | 'raktar' | 'egyeb';
  meta: any;
  created_at: string;
  isOccupied?: boolean;
  tenant_name?: string;
}

interface UnitsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  buildings?: Building[];
  units?: Unit[];
  onAddUnit: (unitData: any) => void;
  onUpdateUnit: (unitId: string, unitData: any) => void;
  onDeleteUnit: (unitId: string) => void;
}

interface UnitFormData {
  name: string;
  unit_type: 'lakas' | 'uzlet' | 'iroda' | 'raktar' | 'egyeb';
  building_id?: string;
  meta: {
    alapterulet?: number;
    szobaszam?: number;
    furdoszoba_szam?: number;
    erkely?: boolean;
    berleti_dij?: number;
    [key: string]: any;
  };
}

const UnitsManagementModal: React.FC<UnitsManagementModalProps> = ({
  isOpen,
  onClose,
  property,
  buildings = [],
  units = [],
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit
}) => {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    unit_type: 'lakas',
    meta: {}
  });

  const unitTypes = [
    { value: 'lakas', label: 'Lakás' },
    { value: 'uzlet', label: 'Üzlet' },
    { value: 'iroda', label: 'Iroda' },
    { value: 'raktar', label: 'Raktár' },
    { value: 'egyeb', label: 'Egyéb' }
  ];

  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setEditingUnit(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      unit_type: 'lakas',
      meta: {}
    });
  };

  const handleAddUnit = () => {
    setMode('add');
    resetForm();
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      unit_type: unit.unit_type,
      meta: unit.meta || {}
    });
    setMode('edit');
  };

  const handleDeleteUnit = (unit: Unit) => {
    if (window.confirm(`Biztosan törli a "${unit.name}" egységet?`)) {
      onDeleteUnit(unit.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'add') {
      onAddUnit({
        ...formData,
        property_id: property?.propertyType !== 'tarsashaz' ? property?.id : undefined,
        building_id: property?.propertyType === 'tarsashaz' ? formData.building_id : undefined
      });
    } else if (mode === 'edit' && editingUnit) {
      onUpdateUnit(editingUnit.id, formData);
    }
    
    setMode('list');
    resetForm();
  };

  const handleMetaChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value
      }
    }));
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === 'list' ? 'Egységek kezelése' : mode === 'add' ? 'Új egység hozzáadása' : 'Egység szerkesztése'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {property.name} - {property.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {mode === 'list' && (
            <div className="space-y-4">
              {/* Add unit button */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">
                  Egységek ({units.length})
                </h3>
                <button
                  onClick={handleAddUnit}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Icon name="PlusIcon" size={16} />
                  <span>Új egység</span>
                </button>
              </div>

              {/* Units list */}
              {units.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="HomeIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium text-foreground mb-2">Nincsenek egységek</h4>
                  <p className="text-muted-foreground mb-4">
                    Adja hozzá az első egységet ehhez az ingatlanhoz.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map((unit) => (
                    <div key={unit.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{unit.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {unitTypes.find(t => t.value === unit.unit_type)?.label}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUnit(unit)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Icon name="PencilIcon" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit)}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <Icon name="TrashIcon" size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {unit.meta?.alapterulet && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Alapterület:</span>
                            <span className="text-foreground">{unit.meta.alapterulet} m²</span>
                          </div>
                        )}
                        {unit.meta?.berleti_dij && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bérleti díj:</span>
                            <span className="text-foreground">
                              {new Intl.NumberFormat('hu-HU').format(unit.meta.berleti_dij)} Ft
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Státusz:</span>
                          <span className={`text-sm font-medium ${unit.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                            {unit.isOccupied ? 'Foglalt' : 'Elérhető'}
                          </span>
                        </div>
                        {unit.tenant_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bérlő:</span>
                            <span className="text-foreground">{unit.tenant_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMode('list')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="ArrowLeftIcon" size={20} />
                </button>
                <h3 className="font-medium text-foreground">
                  {mode === 'add' ? 'Új egység adatai' : 'Egység szerkesztése'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Egység neve *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="pl. 101, A/1, Üzlet 1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Típus *
                    </label>
                    <select
                      value={formData.unit_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      required
                    >
                      {unitTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Building selection for társasház */}
                {property.propertyType === 'tarsashaz' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Épület *
                    </label>
                    <select
                      value={formData.building_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, building_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      required
                    >
                      <option value="">Válasszon épületet...</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Unit metadata fields */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Egység részletei</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Alapterület (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.meta.alapterulet || ''}
                        onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Bérleti díj (HUF)
                      </label>
                      <input
                        type="number"
                        value={formData.meta.berleti_dij || ''}
                        onChange={(e) => handleMetaChange('berleti_dij', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                    </div>

                    {formData.unit_type === 'lakas' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Szobaszám
                          </label>
                          <input
                            type="number"
                            value={formData.meta.szobaszam || ''}
                            onChange={(e) => handleMetaChange('szobaszam', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Fürdőszoba szám
                          </label>
                          <input
                            type="number"
                            value={formData.meta.furdoszoba_szam || ''}
                            onChange={(e) => handleMetaChange('furdoszoba_szam', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-md"
                          />
                        </div>

                        <div className="flex items-center space-x-2 md:col-span-2">
                          <input
                            type="checkbox"
                            id="erkely"
                            checked={formData.meta.erkely || false}
                            onChange={(e) => handleMetaChange('erkely', e.target.checked)}
                            className="rounded border-border"
                          />
                          <label htmlFor="erkely" className="text-sm text-foreground">
                            Erkély/terasz
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {mode === 'add' ? 'Hozzáadás' : 'Mentés'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitsManagementModal;