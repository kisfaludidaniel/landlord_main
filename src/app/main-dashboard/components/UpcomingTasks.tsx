import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'rent' | 'maintenance' | 'appointment' | 'inspection';
  propertyName?: string;
  tenantName?: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
}

const UpcomingTasks = ({ tasks }: UpcomingTasksProps) => {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'rent':
        return 'CurrencyDollarIcon';
      case 'maintenance':
        return 'WrenchScrewdriverIcon';
      case 'appointment':
        return 'CalendarIcon';
      case 'inspection':
        return 'EyeIcon';
      default:
        return 'ClockIcon';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Sürgős';
      case 'medium':
        return 'Közepes';
      case 'low':
        return 'Alacsony';
      default:
        return 'Normál';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Közelgő feladatok</h2>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
            Összes megtekintése
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-4" />
            <p className="text-muted-foreground">Nincsenek függő feladatok</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg border ${getPriorityColor(task.priority)}`}>
                  <Icon name={getTaskIcon(task.type) as any} size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      {task.propertyName && (
                        <span className="flex items-center space-x-1">
                          <Icon name="BuildingOfficeIcon" size={12} />
                          <span>{task.propertyName}</span>
                        </span>
                      )}
                      {task.tenantName && (
                        <span className="flex items-center space-x-1">
                          <Icon name="UserIcon" size={12} />
                          <span>{task.tenantName}</span>
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Icon name="ClockIcon" size={12} />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;