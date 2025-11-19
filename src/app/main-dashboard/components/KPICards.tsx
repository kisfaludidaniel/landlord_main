import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

interface KPICardsProps {
  metrics: KPIMetric[];
}

const KPICards = ({ metrics }: KPICardsProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'ArrowTrendingUpIcon';
      case 'decrease':
        return 'ArrowTrendingDownIcon';
      default:
        return 'MinusIcon';
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-card rounded-lg border border-border p-6 hover:shadow-subtle transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg border ${getColorClasses(metric.color)}`}>
              <Icon name={metric.icon as any} size={24} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${getChangeColor(metric.changeType)}`}>
              <Icon name={getChangeIcon(metric.changeType) as any} size={16} />
              <span className="font-medium">{metric.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-muted-foreground">
              {metric.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;