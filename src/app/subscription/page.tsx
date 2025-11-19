import type { Metadata } from 'next';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import BreadcrumbNavigation from '@/components/common/BreadcrumbNavigation';
import SubscriptionInteractive from './components/SubscriptionInteractive';

export const metadata: Metadata = {
  title: 'Előfizetés - Micro-Landlord OS Lite',
  description: 'Kezelje előfizetését, tekintse meg jelenlegi csomagját és váltson nagyobb csomagra.',
};

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <ContextualNavigation isAuthenticated={true} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <BreadcrumbNavigation className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Előfizetés
          </h1>
          <p className="text-muted-foreground">
            Kezelje előfizetését és tekintse meg elérhető csomagokat.
          </p>
        </div>

        {/* Interactive Content */}
        <SubscriptionInteractive />
      </main>
    </div>
  );
}