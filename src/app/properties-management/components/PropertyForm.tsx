'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export type PropertyType = 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb';

interface PropertyFormProps {
  onSubmit: (propertyData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

interface PropertyMetadata {
  // Lakás
  alapterulet?: number;
  szobaszam?: number;
  furdoszoba_szam?: number;
  erkely_terasz?: { van: boolean; meret?: number };
  klima?: boolean;
  parkolas?: 'utca' | 'garazs' | 'beallo';
  emelet?: number;
  lift?: boolean;

  // Ház
  telek?: number;
  hasznos_alapterulet?: number;
  garazs_db?: number;
  futes_tipusa?: string;
  mellelepulet?: boolean;

  // Kereskedelmi
  funkcio?: 'uzlet' | 'vendeglatas' | 'egyeb';
  utcafront?: boolean;
  raktar_meret?: number;
  parkolohelyek_db?: number;
  kozművek?: string[];

  // Iroda
  munkaallomások_max?: number;
  targyalok_db?: number;
  kozos_terulet_hozzaferes?: boolean;

  // Raktár
  belmagassag?: number;
  ipari_aram?: boolean;
  rakodokapuk_db?: number;
  futott?: boolean;
  rampa?: boolean;

  // Társasház
  epites_eve?: number;
  liftek_db?: number;

  // Egyéb
  kulcs_jellemzok?: string[];
  leiras?: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    description: initialData?.description || '',
    type: (initialData?.type || 'lakas') as PropertyType,
    meta: initialData?.meta || {} as PropertyMetadata
  });

  const [showCompanyWarning, setShowCompanyWarning] = useState(false);

  const propertyTypes = [
    { value: 'lakas', label: 'Lakás', icon: 'HomeIcon' },
    { value: 'haz', label: 'Ház', icon: 'HomeModernIcon' },
    { value: 'kereskedelmi', label: 'Kereskedelmi', icon: 'BuildingStorefrontIcon' },
    { value: 'iroda', label: 'Iroda', icon: 'BuildingOfficeIcon' },
    { value: 'raktar', label: 'Raktár', icon: 'BuildingOffice2Icon' },
    { value: 'tarsashaz', label: 'Társasház', icon: 'BuildingOfficeIcon' },
    { value: 'egyeb', label: 'Egyéb', icon: 'QuestionMarkCircleIcon' }
  ];

  const handleTypeChange = (newType: PropertyType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      meta: {} // Reset metadata when type changes
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on type
    const isValid = validateFormByType();
    if (!isValid) return;

    onSubmit(formData);
  };

  const validateFormByType = (): boolean => {
    const { type, meta } = formData;
    
    switch (type) {
      case 'lakas':
        return !!(meta.alapterulet && meta.szobaszam);
      case 'haz':
        return !!(meta.telek && meta.hasznos_alapterulet);
      case 'kereskedelmi':
        return !!(meta.alapterulet && meta.funkcio);
      case 'iroda':
        return !!(meta.alapterulet && meta.munkaallomások_max);
      case 'raktar':
        return !!(meta.alapterulet && meta.belmagassag);
      case 'tarsashaz':
        return !!meta.epites_eve;
      case 'egyeb':
        return !!(meta.alapterulet && meta.kulcs_jellemzok?.length);
      default:
        return true;
    }
  };

  const renderTypeSpecificFields = () => {
    const { type, meta } = formData;

    switch (type) {
      case 'lakas':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Lakás jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.alapterulet || ''}
                  onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Szobaszám *
                </label>
                <input
                  type="number"
                  value={meta.szobaszam || ''}
                  onChange={(e) => handleMetaChange('szobaszam', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Fürdőszoba szám
                </label>
                <input
                  type="number"
                  value={meta.furdoszoba_szam || ''}
                  onChange={(e) => handleMetaChange('furdoszoba_szam', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Emelet
                </label>
                <input
                  type="number"
                  value={meta.emelet || ''}
                  onChange={(e) => handleMetaChange('emelet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="klima"
                  checked={meta.klima || false}
                  onChange={(e) => handleMetaChange('klima', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="klima" className="text-sm text-foreground">Klíma</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lift"
                  checked={meta.lift || false}
                  onChange={(e) => handleMetaChange('lift', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="lift" className="text-sm text-foreground">Lift</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Parkolás
              </label>
              <select
                value={meta.parkolas || ''}
                onChange={(e) => handleMetaChange('parkolas', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Válasszon...</option>
                <option value="utca">Utca</option>
                <option value="garazs">Garázs</option>
                <option value="beallo">Beálló</option>
              </select>
            </div>
          </div>
        );

      case 'haz':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Ház jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Telek (m²) *
                </label>
                <input
                  type="number"
                  value={meta.telek || ''}
                  onChange={(e) => handleMetaChange('telek', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Hasznos alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.hasznos_alapterulet || ''}
                  onChange={(e) => handleMetaChange('hasznos_alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Szobaszám
                </label>
                <input
                  type="number"
                  value={meta.szobaszam || ''}
                  onChange={(e) => handleMetaChange('szobaszam', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Garázs (db)
                </label>
                <input
                  type="number"
                  value={meta.garazs_db || ''}
                  onChange={(e) => handleMetaChange('garazs_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Fűtés típusa
                </label>
                <input
                  type="text"
                  value={meta.futes_tipusa || ''}
                  onChange={(e) => handleMetaChange('futes_tipusa', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="pl. gáz, villany, távfűtés"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mellelepulet"
                checked={meta.mellelepulet || false}
                onChange={(e) => handleMetaChange('mellelepulet', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="mellelepulet" className="text-sm text-foreground">Melléképület</label>
            </div>
          </div>
        );

      case 'kereskedelmi':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Kereskedelmi jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.alapterulet || ''}
                  onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Funkció *
                </label>
                <select
                  value={meta.funkcio || ''}
                  onChange={(e) => handleMetaChange('funkcio', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="">Válasszon...</option>
                  <option value="uzlet">Üzlet</option>
                  <option value="vendeglatas">Vendéglátás</option>
                  <option value="egyeb">Egyéb</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Raktár (m²)
                </label>
                <input
                  type="number"
                  value={meta.raktar_meret || ''}
                  onChange={(e) => handleMetaChange('raktar_meret', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Parkolóhelyek (db)
                </label>
                <input
                  type="number"
                  value={meta.parkolohelyek_db || ''}
                  onChange={(e) => handleMetaChange('parkolohelyek_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="utcafront"
                checked={meta.utcafront || false}
                onChange={(e) => handleMetaChange('utcafront', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="utcafront" className="text-sm text-foreground">Utcafront</label>
            </div>
          </div>
        );

      case 'iroda':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Iroda jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.alapterulet || ''}
                  onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Munkaállomások max (db) *
                </label>
                <input
                  type="number"
                  value={meta.munkaallomások_max || ''}
                  onChange={(e) => handleMetaChange('munkaallomások_max', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tárgyalók (db)
                </label>
                <input
                  type="number"
                  value={meta.targyalok_db || ''}
                  onChange={(e) => handleMetaChange('targyalok_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Parkolóhelyek (db)
                </label>
                <input
                  type="number"
                  value={meta.parkolohelyek_db || ''}
                  onChange={(e) => handleMetaChange('parkolohelyek_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="kozos_terulet_hozzaferes"
                checked={meta.kozos_terulet_hozzaferes || false}
                onChange={(e) => handleMetaChange('kozos_terulet_hozzaferes', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="kozos_terulet_hozzaferes" className="text-sm text-foreground">Közös terület hozzáférés</label>
            </div>
          </div>
        );

      case 'raktar':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Raktár jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.alapterulet || ''}
                  onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Belmagasság (m) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={meta.belmagassag || ''}
                  onChange={(e) => handleMetaChange('belmagassag', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Rakodókapuk (db)
                </label>
                <input
                  type="number"
                  value={meta.rakodokapuk_db || ''}
                  onChange={(e) => handleMetaChange('rakodokapuk_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ipari_aram"
                  checked={meta.ipari_aram || false}
                  onChange={(e) => handleMetaChange('ipari_aram', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="ipari_aram" className="text-sm text-foreground">Ipari áram</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="futott"
                  checked={meta.futott || false}
                  onChange={(e) => handleMetaChange('futott', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="futott" className="text-sm text-foreground">Fűtött</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rampa"
                  checked={meta.rampa || false}
                  onChange={(e) => handleMetaChange('rampa', e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="rampa" className="text-sm text-foreground">Rámpa</label>
              </div>
            </div>
          </div>
        );

      case 'tarsashaz':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Társasház jellemzők</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Építés éve *
                </label>
                <input
                  type="number"
                  value={meta.epites_eve || ''}
                  onChange={(e) => handleMetaChange('epites_eve', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Liftek (db)
                </label>
                <input
                  type="number"
                  value={meta.liftek_db || ''}
                  onChange={(e) => handleMetaChange('liftek_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Parkolóhelyek (db)
                </label>
                <input
                  type="number"
                  value={meta.parkolohelyek_db || ''}
                  onChange={(e) => handleMetaChange('parkolohelyek_db', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Icon name="InformationCircleIcon" size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Egységek kezelése</h4>
                  <p className="text-sm text-blue-700">
                    A társasház létrehozása után külön oldalon kezelheti az egységeket (lakások).
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'egyeb':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Egyéb ingatlan jellemzők</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Alapterület (m²) *
                </label>
                <input
                  type="number"
                  value={meta.alapterulet || ''}
                  onChange={(e) => handleMetaChange('alapterulet', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Leírás
                </label>
                <textarea
                  value={meta.leiras || ''}
                  onChange={(e) => handleMetaChange('leiras', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={4}
                  placeholder="Részletes leírás az ingatlanról..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Kulcs jellemzők *
                </label>
                <input
                  type="text"
                  value={(meta.kulcs_jellemzok || []).join(', ')}
                  onChange={(e) => handleMetaChange('kulcs_jellemzok', e.target.value.split(', ').filter(item => item.trim()))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="pl. nagy terasz, panoráma, új felújítás"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Vesszővel elválasztva adja meg a jellemzőket
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isEdit ? 'Ingatlan szerkesztése' : 'Új ingatlan hozzáadása'}
        </h2>
        <p className="text-muted-foreground">
          Töltse ki az ingatlan alapadatait és a típus-specifikus mezőket.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Alapadatok */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Alapadatok</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Ingatlan neve *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md"
                required
                placeholder="pl. Belváros Lakás, Újlipót Iroda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cím *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md"
                required
                placeholder="1051 Budapest, Váci utca 15."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Leírás
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={3}
                placeholder="Általános leírás az ingatlanról..."
              />
            </div>
          </div>
        </div>

        {/* Ingatlan típus */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Ingatlan típusa</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value as PropertyType)}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === type.value
                    ? 'border-primary bg-primary/5 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/50'
                }`}
              >
                <Icon name={type.icon} size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Típus-specifikus mezők */}
        {renderTypeSpecificFields()}

        {/* Cégadatok figyelmeztetés */}
        {!showCompanyWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Cégadatok</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Ha nincsenek kitöltve a cégadatok a profilban, automatikus számlagenerálás nem lesz lehetséges.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCompanyWarning(true)}
                  className="text-sm text-yellow-800 underline hover:no-underline"
                >
                  Rendben, értem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Mégse
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {isEdit ? 'Mentés' : 'Hozzáadás'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;