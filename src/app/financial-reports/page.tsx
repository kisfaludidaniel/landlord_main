import ContextualNavigation from '@/components/common/ContextualNavigation';
import BreadcrumbNavigation from '@/components/common/BreadcrumbNavigation';
import FinancialReportsInteractive from './components/FinancialReportsInteractive';

export default function FinancialReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <ContextualNavigation isAuthenticated={true} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BreadcrumbNavigation />
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pénzügyi Jelentések
            </h1>
            <p className="text-muted-foreground">
              Részletes pénzügyi elemzések és jelentések az ingatlanportfólió teljesítményéhez.
              Bevételek, kiadások és nyereség nyomon követése magyar számviteli szabványok szerint.
            </p>
          </div>
        </div>

        {/* Financial Reports Content */}
        <FinancialReportsInteractive />
      </main>
    </div>
  );
}