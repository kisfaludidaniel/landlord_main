import ContextualNavigation from '@/components/common/ContextualNavigation';
import DashboardInteractive from './components/DashboardInteractive';

export default function MainDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={true} />
      <DashboardInteractive />
    </main>
  );
}