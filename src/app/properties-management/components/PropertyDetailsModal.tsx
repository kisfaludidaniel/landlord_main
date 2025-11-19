'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Property {
  id: string;
  name: string;
  address: string;
  image: string;
  alt: string;
  propertyType: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  lastUpdated: string;
  occupancyRate: number;
  description: string;
  yearBuilt: number;
  totalArea: number;
  parkingSpaces: number;
  amenities: string[];
  gallery: Array<{ url: string; alt: string }>;
  units: Array<{
    id: string;
    number: string;
    type: string;
    area: number;
    rent: number;
    isOccupied: boolean;
    tenant?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
  }>;
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    occupancyTrend: string;
  };
}

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (propertyId: string) => void;
  onAddUnit: (propertyId: string) => void;
}

const PropertyDetailsModal = ({ 
  property, 
  isOpen, 
  onClose, 
  onEdit, 
  onAddUnit 
}: PropertyDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'financial' | 'documents'>('overview');

  if (!isOpen || !property) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Lakás',
      house: 'Ház',
      commercial: 'Kereskedelmi',
      office: 'Iroda'
    };
    return types[type] || type;
  };

  const tabs = [
    { id: 'overview', label: 'Áttekintés', icon: 'HomeIcon' },
    { id: 'units', label: 'Egységek', icon: 'BuildingOfficeIcon' },
    { id: 'financial', label: 'Pénzügyek', icon: 'ChartBarIcon' },
    { id: 'documents', label: 'Dokumentumok', icon: 'DocumentTextIcon' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-background rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <AppImage
                  src={property.image}
                  alt={property.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{property.name}</h2>
                <p className="text-muted-foreground">{property.address}</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mt-1">
                  {getPropertyTypeLabel(property.propertyType)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(property.id)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Szerkesztés
              </button>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab.icon as any} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{property.totalUnits}</div>
                    <div className="text-sm text-muted-foreground">Összes egység</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{property.occupiedUnits}</div>
                    <div className="text-sm text-muted-foreground">Bérelt egység</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{property.occupancyRate}%</div>
                    <div className="text-sm text-muted-foreground">Bérleti arány</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{property.yearBuilt}</div>
                    <div className="text-sm text-muted-foreground">Építési év</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Leírás</h3>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Ingatlan adatok</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Összes terület:</span>
                        <span className="text-foreground">{property.totalArea} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parkolóhelyek:</span>
                        <span className="text-foreground">{property.parkingSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Havi bevétel:</span>
                        <span className="text-foreground font-medium">{formatCurrency(property.monthlyRevenue)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Szolgáltatások</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Képgaléria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {property.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <AppImage
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'units' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Egységek ({property.units.length})</h3>
                  <button
                    onClick={() => onAddUnit(property.id)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="PlusIcon" size={16} className="inline mr-2" />
                    Új egység
                  </button>
                </div>
                
                <div className="grid gap-3">
                  {property.units.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${unit.isOccupied ? 'bg-success' : 'bg-error'}`} />
                        <div>
                          <div className="font-medium text-foreground">Egység {unit.number}</div>
                          <div className="text-sm text-muted-foreground">
                            {unit.type} • {unit.area} m² • {formatCurrency(unit.rent)}/hó
                          </div>
                          {unit.tenant && (
                            <div className="text-sm text-muted-foreground">Bérlő: {unit.tenant}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          unit.isOccupied 
                            ? 'bg-success/10 text-success' :'bg-error/10 text-error'
                        }`}>
                          {unit.isOccupied ? 'Bérelt' : 'Üres'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">{formatCurrency(property.financialSummary.totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Összes bevétel</div>
                  </div>
                  <div className="text-center p-4 bg-error/10 rounded-lg">
                    <div className="text-2xl font-bold text-error">{formatCurrency(property.financialSummary.totalExpenses)}</div>
                    <div className="text-sm text-muted-foreground">Összes kiadás</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formatCurrency(property.financialSummary.netIncome)}</div>
                    <div className="text-sm text-muted-foreground">Nettó jövedelem</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Bérleti trend</h3>
                  <p className="text-muted-foreground">{property.financialSummary.occupancyTrend}</p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Dokumentumok ({property.documents.length})</h3>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    <Icon name="PlusIcon" size={16} className="inline mr-2" />
                    Feltöltés
                  </button>
                </div>
                
                <div className="space-y-2">
                  {property.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Icon name="DocumentTextIcon" size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • {doc.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                          <Icon name="EyeIcon" size={16} />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-md transition-colors">
                          <Icon name="ArrowDownTrayIcon" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;