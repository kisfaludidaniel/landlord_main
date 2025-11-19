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
}

interface PropertyTableProps {
  properties: Property[];
  onViewDetails: (propertyId: string) => void;
  onAddUnit: (propertyId: string) => void;
  onViewTenants: (propertyId: string) => void;
  onBulkAction: (action: string, selectedIds: string[]) => void;
  onEditProperty?: (propertyId: string) => void;
  className?: string;
}

type SortField = 'name' | 'address' | 'totalUnits' | 'occupancyRate' | 'monthlyRevenue' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

const PropertyTable = ({ 
  properties, 
  onViewDetails, 
  onAddUnit, 
  onViewTenants, 
  onBulkAction,
  onEditProperty,
  className = ''
}: PropertyTableProps) => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Lakás',
      house: 'Ház',
      commercial: 'Kereskedelmi',
      office: 'Iroda'
    };
    return types[type] || type;
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-warning';
    return 'text-error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'lastUpdated') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedProperties.length > 0) {
      onBulkAction(action, selectedProperties);
      setSelectedProperties([]);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
    }
    return (
      <Icon 
        name={sortDirection === 'asc' ? "ChevronUpIcon" : "ChevronDownIcon"} 
        size={16} 
        className="text-primary" 
      />
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <div className="px-4 py-3 bg-muted border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedProperties.length} ingatlan kiválasztva
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Exportálás
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 text-sm bg-warning text-warning-foreground rounded-md hover:bg-warning/90 transition-colors"
              >
                Archiválás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProperties.length === properties.length && properties.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                Ingatlan
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('address')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cím</span>
                  <SortIcon field="address" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('totalUnits')}
              >
                <div className="flex items-center space-x-1">
                  <span>Egységek</span>
                  <SortIcon field="totalUnits" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('occupancyRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Bérleti arány</span>
                  <SortIcon field="occupancyRate" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('monthlyRevenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Havi bevétel</span>
                  <SortIcon field="monthlyRevenue" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center space-x-1">
                  <span>Utolsó frissítés</span>
                  <SortIcon field="lastUpdated" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedProperties.map((property) => (
              <tr key={property.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => handleSelectProperty(property.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <AppImage
                        src={property.image}
                        alt={property.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{property.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getPropertyTypeLabel(property.propertyType)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {property.address}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <div className="flex flex-col">
                    <span>{property.occupiedUnits}/{property.totalUnits}</span>
                    <span className="text-xs text-muted-foreground">bérelt/összes</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${getOccupancyColor(property.occupancyRate)}`}>
                    {property.occupancyRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatCurrency(property.monthlyRevenue)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {property.lastUpdated}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewDetails(property.id)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="Részletek megtekintése"
                    >
                      <Icon name="EyeIcon" size={16} />
                    </button>
                    <button
                      onClick={() => onAddUnit(property.id)}
                      className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                      title="Egység hozzáadása"
                    >
                      <Icon name="PlusIcon" size={16} />
                    </button>
                    <button
                      onClick={() => onViewTenants(property.id)}
                      className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-md transition-colors"
                      title="Bérlők megtekintése"
                    >
                      <Icon name="UsersIcon" size={16} />
                    </button>
                    {onEditProperty && (
                      <button
                        onClick={() => onEditProperty(property.id)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title="Ingatlan szerkesztése"
                      >
                        <Icon name="PencilSquareIcon" size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, properties.length)} / {properties.length} ingatlan
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Előző
              </button>
              <span className="text-sm text-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Következő
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyTable;