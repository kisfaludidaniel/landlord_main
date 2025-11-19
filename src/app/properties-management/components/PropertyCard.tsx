import React from 'react';

import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

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

interface PropertyCardProps {
  property: Property;
  onViewDetails: (propertyId: string) => void;
  onAddUnit: (propertyId: string) => void;
  onViewTenants: (propertyId: string) => void;
  onEditProperty?: (propertyId: string) => void;
}

const PropertyCard = ({ property, onViewDetails, onAddUnit, onViewTenants, onEditProperty }: PropertyCardProps) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-warning';
    return 'text-error';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <AppImage
          src={property.image}
          alt={property.alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium bg-background/90 text-foreground rounded-full">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium bg-background/90 rounded-full ${getOccupancyColor(property.occupancyRate)}`}>
            {property.occupancyRate}% bérelt
          </span>
        </div>
      </div>

      {/* Property Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.address}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-muted rounded-md">
            <div className="text-lg font-semibold text-foreground">
              {property.totalUnits}
            </div>
            <div className="text-xs text-muted-foreground">Összes egység</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-md">
            <div className="text-lg font-semibold text-foreground">
              {property.occupiedUnits}
            </div>
            <div className="text-xs text-muted-foreground">Bérelt egység</div>
          </div>
        </div>

        {/* Revenue */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(property.monthlyRevenue)}
          </div>
          <div className="text-xs text-muted-foreground">Havi bevétel</div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground mb-4">
          Utolsó frissítés: {property.lastUpdated}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onViewDetails(property.id)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Icon name="EyeIcon" size={16} />
            <span>Részletek</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddUnit(property.id)}
              className="flex items-center justify-center space-x-1 px-2 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-xs font-medium"
            >
              <Icon name="PlusIcon" size={14} />
              <span>Egység</span>
            </button>
            <button
              onClick={() => onViewTenants(property.id)}
              className="flex items-center justify-center space-x-1 px-2 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors text-xs font-medium"
            >
              <Icon name="UsersIcon" size={14} />
              <span>Bérlők</span>
            </button>
          </div>

          {onEditProperty && (
            <button
              onClick={() => onEditProperty(property.id)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-border rounded-md hover:bg-muted transition-colors text-xs font-medium"
            >
              <Icon name="PencilSquareIcon" size={14} />
              <span>Szerkesztés</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;