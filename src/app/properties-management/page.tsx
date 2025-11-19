import type { Metadata } from 'next';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import PropertiesInteractive from './components/PropertiesInteractive';

export const metadata: Metadata = {
  title: 'Landlord - Ingatlan Kezelés',
  description: 'Kezelje és kövesse nyomon ingatlanportfólióját a Landlord rendszerrel.',
};

export default function PropertiesManagement() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={true} />
      <PropertiesInteractive />
    </main>
  );
}