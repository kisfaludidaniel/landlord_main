import { Navigate, Route, Routes } from 'react-router-dom';
import MarketingHomepage from '@/app/marketing-homepage/page';
import MainDashboard from '@/app/main-dashboard/page';
import ReportsAnalyticsPage from '@/app/reports-analytics/page';
import SubscriptionPage from '@/app/subscription/page';
import LoginAuthenticationPage from '@/app/login-authentication/page';
import PropertiesManagement from '@/app/properties-management/page';
import LandlordRegistrationPage from '@/app/landlord-registration/page';
import TenantRegistrationPage from '@/app/tenant-registration/page';
import TenantManagementPage from '@/app/tenant-management/page';
import UsersManagementPage from '@/app/users-management/page';
import PackagesManagementPage from '@/app/packages-management/page';
import SubscriptionsManagementPage from '@/app/subscriptions-management/page';
import SubscriptionPackageManagementPage from '@/app/subscription-package-management/page';
import OrganizationSetupWizardPage from '@/app/organization-setup-wizard/page';
import EnhancedRegistrationFlowPage from '@/app/enhanced-registration-flow/page';
import FinancialReportsPage from '@/app/financial-reports/page';
import SystemAdminDashboardPage from '@/app/system-admin-dashboard/page';
import SystemSettingsConfigurationPage from '@/app/system-settings-configuration/page';
import TenantPortalDashboardPage from '@/app/tenant-portal-dashboard/page';
import InvoiceGenerationPage from '@/app/invoice-generation/page';
import TenantDashboardPage from '@/app/tenant/dashboard/page';
import RoleSelectionPage from '@/app/role-selection/page';
import UserRegistrationPage from '@/app/user-registration/page';
import OnboardingRolePage from '@/app/onboarding/role/page';
import OnboardingTenantProfilePage from '@/app/onboarding/tenant/profile/page';
import OnboardingLandlordProfilePage from '@/app/onboarding/landlord/profile/page';
import OnboardingLandlordPlanPage from '@/app/onboarding/landlord/plan/page';
import OnboardingLandlordFinishPage from '@/app/onboarding/landlord/finish/page';
import NotFoundPage from '@/app/not-found';

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/marketing-homepage" replace />} />
    <Route path="/marketing-homepage" element={<MarketingHomepage />} />
    <Route path="/main-dashboard" element={<MainDashboard />} />
    <Route path="/reports-analytics" element={<ReportsAnalyticsPage />} />
    <Route path="/subscription" element={<SubscriptionPage />} />
    <Route path="/login-authentication" element={<LoginAuthenticationPage />} />
    <Route path="/properties-management" element={<PropertiesManagement />} />
    <Route path="/landlord-registration" element={<LandlordRegistrationPage />} />
    <Route path="/tenant-registration" element={<TenantRegistrationPage />} />
    <Route path="/tenant-management" element={<TenantManagementPage />} />
    <Route path="/users-management" element={<UsersManagementPage />} />
    <Route path="/packages-management" element={<PackagesManagementPage />} />
    <Route path="/subscriptions-management" element={<SubscriptionsManagementPage />} />
    <Route path="/subscription-package-management" element={<SubscriptionPackageManagementPage />} />
    <Route path="/organization-setup-wizard" element={<OrganizationSetupWizardPage />} />
    <Route path="/enhanced-registration-flow" element={<EnhancedRegistrationFlowPage />} />
    <Route path="/financial-reports" element={<FinancialReportsPage />} />
    <Route path="/system-admin-dashboard" element={<SystemAdminDashboardPage />} />
    <Route path="/system-settings-configuration" element={<SystemSettingsConfigurationPage />} />
    <Route path="/tenant-portal-dashboard" element={<TenantPortalDashboardPage />} />
    <Route path="/invoice-generation" element={<InvoiceGenerationPage />} />
    <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
    <Route path="/role-selection" element={<RoleSelectionPage />} />
    <Route path="/user-registration" element={<UserRegistrationPage />} />
    <Route path="/onboarding/role" element={<OnboardingRolePage />} />
    <Route path="/onboarding/tenant/profile" element={<OnboardingTenantProfilePage />} />
    <Route path="/onboarding/landlord/profile" element={<OnboardingLandlordProfilePage />} />
    <Route path="/onboarding/landlord/plan" element={<OnboardingLandlordPlanPage />} />
    <Route path="/onboarding/landlord/finish" element={<OnboardingLandlordFinishPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
