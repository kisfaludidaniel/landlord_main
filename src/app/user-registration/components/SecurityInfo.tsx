import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SecurityFeature {
  icon: string;
  title: string;
  description: string;
}

const SecurityInfo = () => {
  const securityFeatures: SecurityFeature[] = [
    {
      icon: 'ShieldCheckIcon',
      title: 'Biztonságos adattárolás',
      description: 'Az adatait titkosítva tároljuk és védett szervereken kezeljük'
    },
    {
      icon: 'EnvelopeIcon',
      title: 'Email megerősítés',
      description: 'Regisztráció után email megerősítést küldünk a biztonság érdekében'
    },
    {
      icon: 'LockClosedIcon',
      title: 'GDPR megfelelőség',
      description: 'Teljes mértékben megfelelünk az európai adatvédelmi előírásoknak'
    },
    {
      icon: 'UserGroupIcon',
      title: 'Szerepkör alapú hozzáférés',
      description: 'Minden felhasználó csak a szükséges adatokhoz fér hozzá'
    }
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="bg-muted/30 rounded-lg border border-border p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mx-auto mb-3">
            <Icon name="ShieldCheckIcon" size={24} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Biztonság és adatvédelem
          </h3>
          <p className="text-sm text-muted-foreground">
            Az Ön adatainak védelme a legfontosabb számunkra
          </p>
        </div>

        <div className="space-y-4">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center">
                <Icon name={feature.icon as any} size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="InformationCircleIcon" size={16} />
            <span>
              A regisztráció után email megerősítést fog kapni
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;