import type { Metadata } from 'next';
import OrganizationSetupWizardInteractive from './components/OrganizationSetupWizardInteractive';

export const metadata: Metadata = {
  title: 'Szervezet beállítása - Micro-Landlord OS Lite',
  description: 'Állítsa be szervezetét a Micro-Landlord OS Lite rendszerben. Adja meg szervezeti adatait, ingatlanokat, bérlőket és válassza ki a megfelelő csomagot.',
};

export default function OrganizationSetupWizardPage() {
  return <OrganizationSetupWizardInteractive />;
}