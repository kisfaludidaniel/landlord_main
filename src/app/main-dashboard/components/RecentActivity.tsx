import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ActivityItem {
  id: string;
  type: 'payment' | 'maintenance' | 'tenant' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  propertyName?: string;
  tenantName?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return 'CurrencyDollarIcon';
      case 'maintenance':
        return 'WrenchScrewdriverIcon';
      case 'tenant':
        return 'UserIcon';
      case 'invoice':
        return 'DocumentTextIcon';
      default:
        return 'BellIcon';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Legutóbbi tevékenységek</h2>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
            Összes megtekintése
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Még nincsenek tevékenységek</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg border ${getStatusColor(activity.status)}`}>
                  <Icon name={getActivityIcon(activity.type) as any} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {activity.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  
                  {(activity.propertyName || activity.tenantName) && (
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {activity.propertyName && (
                        <span className="flex items-center space-x-1">
                          <Icon name="BuildingOfficeIcon" size={12} />
                          <span>{activity.propertyName}</span>
                        </span>
                      )}
                      {activity.tenantName && (
                        <span className="flex items-center space-x-1">
                          <Icon name="UserIcon" size={12} />
                          <span>{activity.tenantName}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;