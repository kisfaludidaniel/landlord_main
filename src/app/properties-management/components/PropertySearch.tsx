'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PropertySearchProps {
  onSearch: (query: string) => void;
  onExport: () => void;
  onAddProperty: () => void;
  onAIFeature?: (feature: string) => void;
  onTenantInvite?: () => void;
  canUseAI?: boolean;
}

const PropertySearch = ({ 
  onSearch, 
  onExport, 
  onAddProperty,
  onAIFeature,
  onTenantInvite,
  canUseAI = false
}: PropertySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Icon 
          name="MagnifyingGlassIcon" 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
        />
        <input
          type="text"
          placeholder="Keresés ingatlanok között..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* AI Features Dropdown */}
        {onAIFeature && (
          <div className="relative group">
            <button
              onClick={() => onAIFeature('ai-assistant')}
              disabled={!canUseAI}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                canUseAI
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Icon name="CpuChipIcon" size={16} className="mr-2" />
              AI Asszisztens
            </button>
            {!canUseAI && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Pro vagy Korlátlan csomag szükséges
              </div>
            )}
          </div>
        )}

        <button
          onClick={onExport}
          className="inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors"
        >
          <Icon name="ArrowDownTrayIcon" size={16} className="mr-2" />
          Export
        </button>

        {onTenantInvite && (
          <button
            onClick={onTenantInvite}
            className="inline-flex items-center px-3 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors"
          >
            <Icon name="EnvelopeIcon" size={16} className="mr-2" />
            Meghívás
          </button>
        )}

        <button
          onClick={onAddProperty}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} className="mr-2" />
          Új ingatlan
        </button>
      </div>
    </div>
  );
};

export default PropertySearch;