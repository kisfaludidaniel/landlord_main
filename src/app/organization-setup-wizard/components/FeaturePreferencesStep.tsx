'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface FeaturePreferences {
  enableMaintenanceRequests: boolean;
  enableUtilityMeterReadings: boolean;
  enableChatSystem: boolean;
  enableAppointmentScheduling: boolean;
  enableDocumentManagement: boolean;
  enableFinancialReporting: boolean;
  enableAutomatedReminders: boolean;
  enableTwoFactorAuth: boolean;
}

interface FeaturePreferencesStepProps {
  data: FeaturePreferences;
  onDataChange: (data: FeaturePreferences) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FeaturePreferencesStep = ({ data, onDataChange, onNext, onPrevious }: FeaturePreferencesStepProps) => {
  const handleFeatureToggle = (feature: keyof FeaturePreferences) => {
    onDataChange({
      ...data,
      [feature]: !data[feature]
    });
  };

  const features = [
    {
      key: 'enableMaintenanceRequests' as keyof FeaturePreferences,
      title: 'Karbantartási kérések',
      description: 'Bérlők karbantartási kéréseket küldhetnek fényképekkel és leírással',
      icon: 'WrenchScrewdriverIcon',
      category: 'Kommunikáció',
      isPremium: false
    },
    {
      key: 'enableUtilityMeterReadings' as keyof FeaturePreferences,
      title: 'Mérőóra leolvasás',
      description: 'Automatizált mérőóra leolvasás kérések AI-alapú értékfelismeréssel',
      icon: 'BoltIcon',
      category: 'Automatizáció',
      isPremium: true
    },
    {
      key: 'enableChatSystem' as keyof FeaturePreferences,
      title: 'Valós idejű chat',
      description: 'Azonnali üzenetküldés bérlőkkel fájlmegosztással',
      icon: 'ChatBubbleLeftRightIcon',
      category: 'Kommunikáció',
      isPremium: false
    },
    {
      key: 'enableAppointmentScheduling' as keyof FeaturePreferences,
      title: 'Időpontfoglalás',
      description: 'Automatikus időpontfoglalás naptárintegráció és értesítések',
      icon: 'CalendarDaysIcon',
      category: 'Automatizáció',
      isPremium: true
    },
    {
      key: 'enableDocumentManagement' as keyof FeaturePreferences,
      title: 'Dokumentumkezelés',
      description: 'AI-alapú szerződésgenerálás és dokumentumtárolás',
      icon: 'DocumentTextIcon',
      category: 'Dokumentumok',
      isPremium: true
    },
    {
      key: 'enableFinancialReporting' as keyof FeaturePreferences,
      title: 'Pénzügyi jelentések',
      description: 'Részletes bevétel és kiadás jelentések exportálási lehetőséggel',
      icon: 'ChartBarIcon',
      category: 'Pénzügyek',
      isPremium: false
    },
    {
      key: 'enableAutomatedReminders' as keyof FeaturePreferences,
      title: 'Automatikus emlékeztetők',
      description: 'Email és SMS emlékeztetők fizetésekről és határidőkről',
      icon: 'BellIcon',
      category: 'Automatizáció',
      isPremium: true
    },
    {
      key: 'enableTwoFactorAuth' as keyof FeaturePreferences,
      title: 'Kétfaktoros hitelesítés',
      description: 'Extra biztonság TOTP alkalmazásokkal (Google Authenticator)',
      icon: 'ShieldCheckIcon',
      category: 'Biztonság',
      isPremium: false
    }
  ];

  const categories = ['Kommunikáció', 'Automatizáció', 'Dokumentumok', 'Pénzügyek', 'Biztonság'];

  const getEnabledCount = () => {
    return Object.values(data).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Funkciók beállítása
        </h2>
        <p className="text-muted-foreground">
          Válassza ki a szükséges funkciókat szervezete számára
        </p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2">
          <Icon name="CheckCircleIcon" size={16} className="text-success" />
          <span className="text-sm font-medium text-foreground">
            {getEnabledCount()} funkció kiválasztva
          </span>
        </div>
      </div>

      {/* Features by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryFeatures = features.filter(f => f.category === category);
          
          return (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <span>{category}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({categoryFeatures.filter(f => data[f.key]).length}/{categoryFeatures.length})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.key}
                    className={`relative bg-card border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-subtle ${
                      data[feature.key] 
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleFeatureToggle(feature.key)}
                  >
                    {/* Premium Badge */}
                    {feature.isPremium && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
                          <Icon name="StarIcon" size={12} className="mr-1" />
                          Pro
                        </span>
                      </div>
                    )}

                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                        data[feature.key] 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon name={feature.icon as any} size={24} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{feature.title}</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data[feature.key]}
                              onChange={() => handleFeatureToggle(feature.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Features Notice */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="StarIcon" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning mb-1">Pro funkciók</h4>
            <p className="text-sm text-warning/80">
              A Pro csomaggal jelölt funkciók 14 napos ingyenes próbaidőszak után fizetősek. 
              A próbaidőszak alatt minden funkció korlátlanul használható.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="LightBulbIcon" size={20} className="text-accent mt-0.5" />
          <div>
            <h4 className="font-medium text-accent mb-1">Ajánlások</h4>
            <p className="text-sm text-accent/80 mb-2">
              Kezdőknek ajánljuk ezeket a funkciókat:
            </p>
            <ul className="text-sm text-accent/80 space-y-1">
              <li>• Karbantartási kérések (alapvető kommunikáció)</li>
              <li>• Valós idejű chat (gyors kapcsolattartás)</li>
              <li>• Pénzügyi jelentések (bevételek nyomon követése)</li>
              <li>• Kétfaktoros hitelesítés (biztonság)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={16} className="mr-2 inline" />
          Előző lépés
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Következő lépés
          <Icon name="ArrowRightIcon" size={16} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

export default FeaturePreferencesStep;