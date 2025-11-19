import ContextualNavigation from '@/components/common/ContextualNavigation';
import MarketingHomepageInteractive from './components/MarketingHomepageInteractive';

export default function MarketingHomepage() {
  return (
    <main className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={false} />
      <MarketingHomepageInteractive />
    </main>
  );
}