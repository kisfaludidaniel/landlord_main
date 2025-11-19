import type { Metadata } from 'next';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import MarketingHomepageInteractive from './components/MarketingHomepageInteractive';

export const metadata: Metadata = {
  title: 'Landlord - Professzionális Ingatlan Kezelés',
  description: 'Automatizálja bérleti díj beszedését, kezelje bérlőit és növelje bevételeit a Landlord segítségével. Ingyenes próbaverzió elérhető.',
};

export default function MarketingHomepage() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={false} />
      <MarketingHomepageInteractive />
    </main>
  );
}