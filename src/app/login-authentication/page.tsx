import type { Metadata } from 'next';
import ContextualNavigation from '@/components/common/ContextualNavigation';
import LoginInteractive from './components/LoginInteractive';

export const metadata: Metadata = {
  title: 'Bejelentkezés - Micro-Landlord OS Lite',
  description: 'Jelentkezzen be a Micro-Landlord OS Lite fiókjába a tulajdonságok kezeléséhez és bérlői kapcsolatok fenntartásához.',
};

export default function LoginAuthenticationPage() {
  return (
    <div className="min-h-screen bg-background">
      <ContextualNavigation isAuthenticated={false} />
      <main className="flex-1">
        <LoginInteractive />
      </main>
    </div>
  );
}