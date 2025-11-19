'use client';

import React, { useState, useEffect } from 'react';
import PropertySearch from './PropertySearch';
import PropertyFilters from './PropertyFilters';
import PropertyTable from './PropertyTable';
import PropertyCard from './PropertyCard';
import PropertyDetailsModal from './PropertyDetailsModal';
import PropertyForm from './PropertyForm';
import TenantInviteModal from './TenantInviteModal';
import UnitsManagementModal from './UnitsManagementModal';
import UpgradeModal from '@/components/common/UpgradeModal';
import Icon from '@/components/ui/AppIcon';
import {
  getCurrentUserPlan,
  getCurrentPropertyCount,
  canAddProperty,
  canUseAI } from
'@/config/plans';
import {
  exportPropertiesToCSV,
  exportPropertiesToXLSX,
  exportUnitsToCSV,
  exportUnitsToXLSX,
  exportTenantInvitesToCSV,
  exportTenantInvitesToXLSX,
  exportAllDataToXLSX,
  type PropertyExportData,
  type UnitExportData,
  type TenantInviteExportData } from
'./ExportUtils';

interface Property {
  id: string;
  name: string;
  address: string;
  image: string;
  alt: string;
  type: 'lakas' | 'haz' | 'kereskedelmi' | 'iroda' | 'raktar' | 'tarsashaz' | 'egyeb';
  meta: any;
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
  gallery: Array<{url: string;alt: string;}>;
  units: Array<{
    id: string;
    number: string;
    type: string;
    area: number;
    rent: number;
    isOccupied: boolean;
    tenant?: string;
  }>;
  buildings?: Array<{
    id: string;
    name: string;
    address: string;
    units: Array<{
      id: string;
      name: string;
      unit_type: string;
      isOccupied: boolean;
      tenant_name?: string;
    }>;
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

interface FilterOptions {
  location: string;
  propertyType: string;
  occupancyStatus: string;
  revenueMin: string;
  revenueMax: string;
}

const PropertiesInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    propertyType: '',
    occupancyStatus: '',
    revenueMin: '',
    revenueMax: ''
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showTenantInvite, setShowTenantInvite] = useState(false);
  const [showUnitsManagement, setShowUnitsManagement] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    type: 'property-limit' | 'ai-feature';
  }>({
    isOpen: false,
    type: 'property-limit'
  });

  // Plan management
  const [currentPlan] = useState(getCurrentUserPlan());
  const [propertyCount] = useState(getCurrentPropertyCount());

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Enhanced mock properties data with new structure
  const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Belváros Lakópark',
    address: '1051 Budapest, Váci utca 15.',
    image: "https://images.unsplash.com/photo-1680433328065-5a78a82fa5b2",
    alt: 'Modern apartment building with glass facade and balconies in downtown Budapest',
    type: 'lakas',
    meta: {
      alapterulet: 75,
      szobaszam: 3,
      furdoszoba_szam: 1,
      erkely_terasz: { van: true, meret: 8 },
      klima: true,
      parkolas: 'garázs',
      emelet: 2,
      lift: true
    },
    totalUnits: 1,
    occupiedUnits: 1,
    monthlyRevenue: 280000,
    lastUpdated: '2025-11-03',
    occupancyRate: 100,
    description: 'Modern lakás a belváros szívében, kiváló közlekedési kapcsolatokkal.',
    yearBuilt: 2018,
    totalArea: 75,
    parkingSpaces: 1,
    amenities: ['Lift', 'Klíma', 'Garázs', 'Erkély'],
    gallery: [
    { url: "https://images.unsplash.com/photo-1635513672143-08fecb4e38ef", alt: 'Building exterior view' },
    { url: "https://images.unsplash.com/photo-1618259715220-a89a4e4da76b", alt: 'Modern lobby interior' }],

    units: [
    { id: '1-1', number: '1', type: 'lakás', area: 75, rent: 280000, isOccupied: true, tenant: 'Nagy Péter' }],

    documents: [
    { id: 'd1', name: 'Tulajdoni lap', type: 'PDF', uploadDate: '2025-10-15', size: '2.3 MB' }],

    financialSummary: {
      totalRevenue: 280000,
      totalExpenses: 70000,
      netIncome: 210000,
      occupancyTrend: 'Stabil 100% bérleti arány'
    }
  },
  {
    id: '2',
    name: 'Váci Út Társasház',
    address: '1132 Budapest, Váci út 45.',
    image: "https://images.unsplash.com/photo-1646451402366-7ce7af6e6468",
    alt: 'Modern apartment complex with multiple buildings',
    type: 'tarsashaz',
    meta: {
      epites_eve: 2015,
      liftek_db: 2,
      parkolohelyek_db: 18,
      kozos_terulet: 'lobby, fitness, tetőterasz'
    },
    totalUnits: 3,
    occupiedUnits: 2,
    monthlyRevenue: 570000,
    lastUpdated: '2025-11-05',
    occupancyRate: 67,
    description: 'Modern társasház 24 lakással a XIII. kerületben',
    yearBuilt: 2015,
    totalArea: 1200,
    parkingSpaces: 18,
    amenities: ['Lift', 'Fitness terem', 'Tetőterasz', 'Portaszolgálat'],
    gallery: [
    { url: "https://images.unsplash.com/photo-1584562556527-e26266f9ad2e", alt: 'Building complex exterior' },
    { url: "https://images.unsplash.com/photo-1583614992293-a757023493e0", alt: 'Modern lobby' }],

    buildings: [
    {
      id: 'b1',
      name: 'A épület',
      address: '1132 Budapest, Váci út 45/A',
      units: [
      { id: 'u1', name: '101', unit_type: 'lakas', isOccupied: true, tenant_name: 'Kovács Anna' },
      { id: 'u2', name: '102', unit_type: 'lakas', isOccupied: true, tenant_name: 'Szabó Péter' },
      { id: 'u3', name: '103', unit_type: 'lakas', isOccupied: false }]

    }],

    units: [], // Társasház case uses buildings array
    documents: [
    { id: 'd2', name: 'Társasházi alapító okirat', type: 'PDF', uploadDate: '2025-09-20', size: '5.1 MB' }],

    financialSummary: {
      totalRevenue: 570000,
      totalExpenses: 142000,
      netIncome: 428000,
      occupancyTrend: '67% bérleti arány, 1 szabad lakás'
    }
  }];


  const filteredProperties = mockProperties.filter((property) => {
    // Search filter
    const matchesSearch = !searchQuery ||
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.type.toLowerCase().includes(searchQuery.toLowerCase());

    // Location filter
    const matchesLocation = !filters.location ||
    property.address.toLowerCase().includes(filters.location.toLowerCase());

    // Property type filter  
    const matchesType = !filters.propertyType || property.type === filters.propertyType;

    // Occupancy status filter
    const matchesOccupancy = !filters.occupancyStatus ||
    filters.occupancyStatus === 'fully-occupied' && property.occupancyRate >= 95 ||
    filters.occupancyStatus === 'partially-occupied' && property.occupancyRate > 0 && property.occupancyRate < 95 ||
    filters.occupancyStatus === 'vacant' && property.occupancyRate === 0;

    // Revenue range filter
    const matchesRevenueMin = !filters.revenueMin || property.monthlyRevenue >= parseInt(filters.revenueMin);
    const matchesRevenueMax = !filters.revenueMax || property.monthlyRevenue <= parseInt(filters.revenueMax);

    return matchesSearch && matchesLocation && matchesType && matchesOccupancy && matchesRevenueMin && matchesRevenueMax;
  });

  const handleViewDetails = (propertyId: string) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setIsModalOpen(true);
    }
  };

  const handleAddUnit = (propertyId: string) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setShowUnitsManagement(true);
    }
  };

  const handleViewTenants = (propertyId: string) => {
    console.log('View tenants for property:', propertyId);
    // Navigate to tenants page with property filter
  };

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log('Bulk action:', action, selectedIds);
    // Handle bulk operations
  };

  // Enhanced export functions using the new utility
  const handleExport = (format: 'csv' | 'xlsx' = 'csv', dataType: 'properties' | 'units' | 'invites' | 'all' = 'properties') => {
    const propertiesData: PropertyExportData[] = filteredProperties.map((prop) => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      type: prop.type,
      description: prop.description,
      created_at: prop.lastUpdated,
      landlord_id: 'current-user', // Would come from auth context
      meta: prop.meta,
      occupancy_rate: prop.occupancyRate
    }));

    const unitsData: UnitExportData[] = filteredProperties.flatMap((prop) => {
      if (prop.type === 'tarsashaz' && prop.buildings) {
        return prop.buildings.flatMap((building) =>
        building.units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          property_name: prop.name,
          building_name: building.name,
          unit_type: unit.unit_type,
          meta: {/* unit metadata would be here */},
          created_at: prop.lastUpdated,
          is_occupied: unit.isOccupied,
          tenant_name: unit.tenant_name
        }))
        );
      } else {
        return prop.units.map((unit) => ({
          id: unit.id,
          name: unit.number,
          property_name: prop.name,
          unit_type: unit.type,
          meta: { alapterulet: unit.area, berleti_dij: unit.rent },
          created_at: prop.lastUpdated,
          is_occupied: unit.isOccupied,
          tenant_name: unit.tenant
        }));
      }
    });

    // Mock invite data
    const invitesData: TenantInviteExportData[] = [
    {
      id: '1',
      unit_name: '101',
      property_name: 'Váci Út Társasház',
      email: 'tenant1@example.com',
      status: 'pending',
      invited_at: '2025-11-01',
      expires_at: '2025-11-08',
      invited_by_name: 'Kovács János'
    }];


    switch (dataType) {
      case 'properties':
        if (format === 'csv') exportPropertiesToCSV(propertiesData);else
        exportPropertiesToXLSX(propertiesData);
        break;
      case 'units':
        if (format === 'csv') exportUnitsToCSV(unitsData);else
        exportUnitsToXLSX(unitsData);
        break;
      case 'invites':
        if (format === 'csv') exportTenantInvitesToCSV(invitesData);else
        exportTenantInvitesToXLSX(invitesData);
        break;
      case 'all':
        exportAllDataToXLSX({
          properties: propertiesData,
          units: unitsData,
          invites: invitesData
        });
        break;
    }
  };

  const handleAddProperty = () => {
    if (!canAddProperty(currentPlan, propertyCount)) {
      setUpgradeModal({
        isOpen: true,
        type: 'property-limit'
      });
      return;
    }

    setEditingProperty(null);
    setShowPropertyForm(true);
  };

  const handleAIFeature = (feature: string) => {
    if (!canUseAI(currentPlan)) {
      setUpgradeModal({
        isOpen: true,
        type: 'ai-feature'
      });
      return;
    }

    console.log('Using AI feature:', feature);
  };

  const handleEditProperty = (propertyId: string) => {
    const property = mockProperties.find((p) => p.id === propertyId);
    if (property) {
      setEditingProperty(property);
      setShowPropertyForm(true);
      setIsModalOpen(false);
    }
  };

  const handlePropertySubmit = (propertyData: any) => {
    console.log('Property submitted:', propertyData);
    // Here you would save to database via API
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  const handleTenantInvite = (inviteData: {unitIds: string[];emails: string[];}) => {
    console.log('Sending tenant invites:', inviteData);
    // Here you would send invites via API
    setShowTenantInvite(false);
  };

  const handleUnitAction = (action: 'add' | 'update' | 'delete', unitId?: string, unitData?: any) => {
    console.log('Unit action:', action, unitId, unitData);
    // Handle unit CRUD operations
  };

  const closeUpgradeModal = () => {
    setUpgradeModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Property Form */}
      {showPropertyForm &&
      <div className="mb-6">
          <PropertyForm
          onSubmit={handlePropertySubmit}
          onCancel={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          initialData={editingProperty}
          isEdit={!!editingProperty} />

        </div>
      }

      {/* Main view when not adding/editing */}
      {!showPropertyForm &&
      <>
          {/* Search and Actions */}
          <PropertySearch
          onSearch={setSearchQuery}
          onExport={handleExport}
          onAddProperty={handleAddProperty}
          onAIFeature={handleAIFeature}
          onTenantInvite={() => setShowTenantInvite(true)}
          canUseAI={canUseAI(currentPlan)} />


          {/* Filters */}
          <PropertyFilters onFiltersChange={setFilters} />

          {/* View Mode Toggle and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {filteredProperties.length} ingatlan találat
              </span>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Összes bevétel:</span>
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat('hu-HU', {
                  style: 'currency',
                  currency: 'HUF',
                  minimumFractionDigits: 0
                }).format(filteredProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0))}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
              }>

                <Icon name="TableCellsIcon" size={16} />
              </button>
              <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
              viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
              }>

                <Icon name="Squares2X2Icon" size={16} />
              </button>
            </div>
          </div>

          {/* Properties Display */}
          {filteredProperties.length === 0 ?
        <div className="text-center py-12">
              <Icon name="BuildingOfficeIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nincs találat</h3>
              <p className="text-muted-foreground mb-4">
                Próbálja meg módosítani a keresési feltételeket vagy a szűrőket.
              </p>
              <button
            onClick={handleAddProperty}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">

                Első ingatlan hozzáadása
              </button>
            </div> :
        viewMode === 'table' ?
        <PropertyTable
          properties={filteredProperties}
          onViewDetails={handleViewDetails}
          onAddUnit={handleAddUnit}
          onViewTenants={handleViewTenants}
          onBulkAction={handleBulkAction}
          onEditProperty={handleEditProperty} /> :


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) =>
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={handleViewDetails}
            onAddUnit={handleAddUnit}
            onViewTenants={handleViewTenants}
            onEditProperty={handleEditProperty} />

          )}
            </div>
        }
        </>
      }

      {/* Modals */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEditProperty}
        onAddUnit={handleAddUnit} />


      <TenantInviteModal
        isOpen={showTenantInvite}
        onClose={() => setShowTenantInvite(false)}
        onInvite={handleTenantInvite}
        properties={mockProperties} />


      <UnitsManagementModal
        isOpen={showUnitsManagement}
        onClose={() => setShowUnitsManagement(false)}
        property={selectedProperty}
        buildings={selectedProperty?.buildings}
        units={selectedProperty?.type === 'tarsashaz' ?
        selectedProperty.buildings?.flatMap((b) => b.units) || [] :
        selectedProperty?.units?.map((u) => ({
          id: u.id,
          name: u.number,
          unit_type: 'lakas' as const,
          meta: { alapterulet: u.area, berleti_dij: u.rent },
          created_at: selectedProperty.lastUpdated,
          isOccupied: u.isOccupied,
          tenant_name: u.tenant
        })) || []
        }
        onAddUnit={(unitData) => handleUnitAction('add', undefined, unitData)}
        onUpdateUnit={(unitId, unitData) => handleUnitAction('update', unitId, unitData)}
        onDeleteUnit={(unitId) => handleUnitAction('delete', unitId)} />


      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        type={upgradeModal.type}
        currentPlan={currentPlan}
        propertyLimit={typeof currentPlan.propertyLimit === 'number' ? currentPlan.propertyLimit : undefined} />

    </div>);

};

export default PropertiesInteractive;