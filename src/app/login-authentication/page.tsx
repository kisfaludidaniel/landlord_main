import ContextualNavigation from '@/components/common/ContextualNavigation';
import LoginInteractive from './components/LoginInteractive';

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