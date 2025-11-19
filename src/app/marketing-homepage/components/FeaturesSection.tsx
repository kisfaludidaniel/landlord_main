import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection = ({ className = '' }: FeaturesSectionProps) => {
  const features: Feature[] = [
    {
      id: 'tenant-management',
      title: 'Bérlő kezelés',
      description: 'Központosított bérlői adatbázis szerződésekkel, fizetési előzményekkel és kommunikációs naplóval.',
      icon: 'UsersIcon',
      color: 'primary'
    },
    {
      id: 'automated-invoicing',
      title: 'Automatikus számlázás',
      description: 'Havi bérleti díj számlák automatikus generálása magyar adójogi megfelelőséggel.',
      icon: 'DocumentTextIcon',
      color: 'accent'
    },
    {
      id: 'payment-tracking',
      title: 'Fizetés nyomon követés',
      description: 'Valós idejű fizetési státusz, emlékeztetők és banki átutalások kezelése.',
      icon: 'CurrencyDollarIcon',
      color: 'success'
    },
    {
      id: 'maintenance-requests',
      title: 'Karbantartási kérések',
      description: 'Strukturált hibajegy rendszer prioritásokkal, fájlmellékletekkel és státusz követéssel.',
      icon: 'WrenchScrewdriverIcon',
      color: 'warning'
    },
    {
      id: 'financial-reports',
      title: 'Pénzügyi jelentések',
      description: 'Részletes bevétel-kiadás kimutatások, bérleti díj beszedési statisztikák.',
      icon: 'ChartBarIcon',
      color: 'accent'
    },
    {
      id: 'document-management',
      title: 'Dokumentum kezelés',
      description: 'Biztonságos fájltárolás szerződésekkel, számlákkal és karbantartási dokumentumokkal.',
      icon: 'FolderIcon',
      color: 'primary'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'accent':
        return 'bg-accent/10 text-accent';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Minden amit egy{' '}
            <span className="text-primary">tulajdonosnak</span>{' '}
            kell
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professzionális ingatlan kezelési eszközök egy helyen. Automatizálja folyamatait és növelje hatékonyságát.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getColorClasses(feature.color)}`}>
                  <Icon name={feature.icon as any} size={28} />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Készen áll a kezdésre?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Csatlakozzon több mint 500 elégedett tulajdonoshoz és kezdje el használni a platformot még ma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                Árak megtekintése
                <Icon name="ArrowDownIcon" size={20} className="ml-2" />
              </a>
              <a
                href="#testimonials"
                className="inline-flex items-center justify-center px-8 py-4 bg-card text-card-foreground font-semibold rounded-lg border-2 border-border hover:bg-muted transition-colors duration-200"
              >
                Vélemények olvasása
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;