import ContextualNavigation from '@/components/common/ContextualNavigation';
import PropertiesInteractive from './components/PropertiesInteractive';

export default function PropertiesManagement() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={true} />
      <PropertiesInteractive />
    </main>
  );
}