import type { Metadata } from 'next';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Landlord - Főbérlő Műszerfal',
  description: 'Kezelje ingatlanait, bérlőit és pénzügyeit egy helyen a Landlord rendszerrel.',
};

export default function MainDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={true} />
      <DashboardInteractive />
    </main>
  );
}