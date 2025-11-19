'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterOptions {
  location: string;
  propertyType: string;
  occupancyStatus: string;
  revenueMin: string;
  revenueMax: string;
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const PropertyFilters = ({ onFiltersChange, className = '' }: PropertyFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    propertyType: '',
    occupancyStatus: '',
    revenueMin: '',
    revenueMax: ''
  });

  const propertyTypes = [
    { value: '', label: 'Minden típus' },
    { value: 'apartment', label: 'Lakás' },
    { value: 'house', label: 'Ház' },
    { value: 'commercial', label: 'Kereskedelmi' },
    { value: 'office', label: 'Iroda' }
  ];

  const occupancyStatuses = [
    { value: '', label: 'Minden státusz' },
    { value: 'fully-occupied', label: 'Teljesen bérelt' },
    { value: 'partially-occupied', label: 'Részben bérelt' },
    { value: 'vacant', label: 'Üres' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      location: '',
      propertyType: '',
      occupancyStatus: '',
      revenueMin: '',
      revenueMax: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="FunnelIcon" size={20} className="text-muted-foreground" />
          <h3 className="font-medium text-foreground">Szűrők</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              Aktív
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Törlés
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <Icon 
              name={isExpanded ? "ChevronUpIcon" : "ChevronDownIcon"} 
              size={16} 
              className="text-muted-foreground" 
            />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Helyszín
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Város, kerület..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ingatlan típusa
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupancy Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bérleti státusz
              </label>
              <select
                value={filters.occupancyStatus}
                onChange={(e) => handleFilterChange('occupancyStatus', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {occupancyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue Range Filters */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Min. bevétel (Ft)
              </label>
              <input
                type="number"
                value={filters.revenueMin}
                onChange={(e) => handleFilterChange('revenueMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max. bevétel (Ft)
              </label>
              <input
                type="number"
                value={filters.revenueMax}
                onChange={(e) => handleFilterChange('revenueMax', e.target.value)}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;