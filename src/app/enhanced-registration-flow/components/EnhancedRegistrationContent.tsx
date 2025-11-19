'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface Plan {
  id: string;
  name: string;
  price_huf: number;
  description: string;
  features: string[];
  property_limit: number | null;
}

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
  companyVatId: string;
  companyAddress: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  language: 'hu' | 'en';
}

interface CompanyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAddCompanyData: () => void;
  language: 'hu' | 'en';
}

const translations = {
  hu: {
    title: 'Fiók létrehozása',
    subtitle: 'Csatlakozz a Landlord közösséghez és kezdd el ingatlanaid professzionális kezelését',
    selectedPlan: 'Választott csomag',
    personalInfo: 'Személyes adatok',
    fullName: 'Teljes név',
    email: 'E-mail cím',
    password: 'Jelszó',
    confirmPassword: 'Jelszó megerősítése',
    phone: 'Telefonszám',
    companyData: 'Cégadatok (opcionális)',
    companyDataOptional: 'A cégadatok megadása opcionális, de ajánlott a professzionális funkciókhoz.',
    companyName: 'Cégnév',
    companyVatId: 'Adószám',
    companyAddress: 'Cégcím',
    addCompanyData: 'Cégadatok hozzáadása',
    skipCompanyData: 'Kihagyás egyelőre',
    language: 'Nyelv',
    hungarian: 'Magyar',
    english: 'Angol',
    acceptTerms: 'Elfogadom a felhasználási feltételeket és az adatvédelmi szabályzatot',
    acceptMarketing: 'Szeretnék marketing e-maileket kapni',
    createAccount: 'Fiók létrehozása',
    emailSending: 'E-mail küldése...',
    emailSent: 'Megerősítő e-mail elküldve',
    emailSentDesc: 'Küldtünk egy megerősítő e-mailt a megadott címre. Kattints a linkre a regisztráció befejezéséhez.',
    emailNotReceived: 'Nem kaptad meg az e-mailt?',
    resendEmail: 'Újraküldés',
    checkSpam: 'Ellenőrizd a spam mappát is',
    backToLogin: 'Vissza a bejelentkezéshez',
    passwordMinLength: 'A jelszónak legalább 8 karakternek kell lennie',
    passwordsNotMatch: 'A jelszavak nem egyeznek',
    emailInvalid: 'Érvényes e-mail címet adj meg',
    phoneInvalid: 'Érvényes telefonszámot adj meg',
    fullNameRequired: 'A teljes név megadása kötelező',
    acceptTermsRequired: 'A felhasználási feltételek elfogadása kötelező',
    registrationError: 'Hiba történt a regisztráció során',
    companyBenefitsTitle: 'Cégadatok előnyei',
    companyBenefitsDesc: 'A cégadatok megadásával a következő funkciók válnak elérhetővé:',
    companyBenefit1: '• Céges számlázás és jelentések',
    companyBenefit2: '• ÁFA-számítások és adózási funkciók',
    companyBenefit3: '• Professzionális dokumentumok generálása',
    companyBenefit4: '• Integrált könyvelési lehetőségek',
    withoutCompanyTitle: 'Cégadatok nélkül',
    withoutCompanyDesc: 'Cégadatok nélkül a következő korlátozások érvényesek:',
    withoutCompany1: '• Csak magánszemély számlázás',
    withoutCompany2: '• Korlátozott jelentési lehetőségek',
    withoutCompany3: '• Alapvető dokumentum sablonok',
    continueWithoutCompany: 'Folytatás cégadatok nélkül',
    addCompanyDataLater: 'Cégadatok hozzáadása később',
    modalConfirm: 'Megerősítés',
    loadingPlans: 'Csomagok betöltése...'
  },
  en: {
    title: 'Create Account',
    subtitle: 'Join the Landlord community and start managing your properties professionally',
    selectedPlan: 'Selected Plan',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone Number',
    companyData: 'Company Data (Optional)',
    companyDataOptional: 'Company data is optional but recommended for professional features.',
    companyName: 'Company Name',
    companyVatId: 'VAT ID',
    companyAddress: 'Company Address',
    addCompanyData: 'Add Company Data',
    skipCompanyData: 'Skip for Now',
    language: 'Language',
    hungarian: 'Hungarian',
    english: 'English',
    acceptTerms: 'I accept the terms of service and privacy policy',
    acceptMarketing: 'I would like to receive marketing emails',
    createAccount: 'Create Account',
    emailSending: 'Sending email...',
    emailSent: 'Confirmation Email Sent',
    emailSentDesc: 'We sent a confirmation email to your address. Click the link to complete registration.',
    emailNotReceived: 'Didn\'t receive the email?',
    resendEmail: 'Resend',
    checkSpam: 'Check your spam folder too',
    backToLogin: 'Back to Login',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordsNotMatch: 'Passwords do not match',
    emailInvalid: 'Please enter a valid email address',
    phoneInvalid: 'Please enter a valid phone number',
    fullNameRequired: 'Full name is required',
    acceptTermsRequired: 'You must accept the terms of service',
    registrationError: 'An error occurred during registration',
    companyBenefitsTitle: 'Company Data Benefits',
    companyBenefitsDesc: 'By providing company data, the following features become available:',
    companyBenefit1: '• Corporate invoicing and reports',
    companyBenefit2: '• VAT calculations and tax functions',
    companyBenefit3: '• Professional document generation',
    companyBenefit4: '• Integrated accounting options',
    withoutCompanyTitle: 'Without Company Data',
    withoutCompanyDesc: 'Without company data, the following limitations apply:',
    withoutCompany1: '• Private person invoicing only',
    withoutCompany2: '• Limited reporting options',
    withoutCompany3: '• Basic document templates',
    continueWithoutCompany: 'Continue Without Company Data',
    addCompanyDataLater: 'Add Company Data Later',
    modalConfirm: 'Confirm',
    loadingPlans: 'Loading plans...'
  }
};

const CompanyDataModal: React.FC<CompanyDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onAddCompanyData,
  language
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t.modalConfirm}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h4 className="font-semibold text-emerald-700 mb-2">
              {t.companyBenefitsTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {t.companyBenefitsDesc}
            </p>
            <div className="text-sm text-emerald-700 space-y-1">
              <div>{t.companyBenefit1}</div>
              <div>{t.companyBenefit2}</div>
              <div>{t.companyBenefit3}</div>
              <div>{t.companyBenefit4}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-red-700 mb-2">
              {t.withoutCompanyTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {t.withoutCompanyDesc}
            </p>
            <div className="text-sm text-red-700 space-y-1">
              <div>{t.withoutCompany1}</div>
              <div>{t.withoutCompany2}</div>
              <div>{t.withoutCompany3}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t.continueWithoutCompany}
          </button>
          <button
            onClick={onAddCompanyData}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {t.addCompanyDataLater}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedRegistrationContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyVatId: '',
    companyAddress: '',
    acceptTerms: false,
    acceptMarketing: false,
    language: 'hu'
  });

  type RegistrationErrors = Partial<Record<keyof RegistrationData, string>>;
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const t = translations[formData.language];

  // Load selected plan on mount
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      loadPlan(planId);
    }
  }, [searchParams]);

  const loadPlan = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        toast.error('Hiba a csomag betöltése során');
        return;
      }

      setSelectedPlan(data);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Hiba a csomag betöltése során');
    }
  };

  const validateForm = () => {
    const newErrors: RegistrationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.fullNameRequired;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = t.emailInvalid;
    }

    if (formData.password.length < 8) {
      newErrors.password = t.passwordMinLength;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsNotMatch;
    }

    if (formData.phone && !/^(\+36|06)[\d\s-]{8,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.phoneInvalid;
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t.acceptTermsRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If no company data and company fields not shown, show modal
    if (!showCompanyFields && !formData.companyName.trim()) {
      setShowCompanyModal(true);
      return;
    }

    await processRegistration();
  };

  const processRegistration = async () => {
    setIsSubmitting(true);

    try {
      const profileData = {
        fullName: formData.fullName.trim(),
        role: 'LANDLORD' as const,
        phone: formData.phone.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        companyVatId: formData.companyVatId.trim() || undefined,
        companyAddress: formData.companyAddress.trim() || undefined,
      };

      const { data, error } = await signUp(formData.email, formData.password, profileData);

      if (error) {
        if (error.message.includes('email')) {
          setErrors({ email: 'Ez az e-mail cím már használatban van' });
        } else {
          toast.error(error.message || t.registrationError);
        }
        return;
      }

      // If user was created, set email sent state
      if (data?.user && !data?.session) {
        setEmailSent(true);
        toast.success(t.emailSent);
      } else if (data?.session) {
        // Auto-confirmed, redirect to dashboard
        navigate('/main-dashboard');
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t.registrationError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });

      if (error) {
        toast.error('Hiba az e-mail újraküldése során');
      } else {
        toast.success('E-mail újraküldve');
      }
    } catch (error) {
      toast.error('Hiba az e-mail újraküldése során');
    } finally {
      setResending(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t.emailSent}
          </h1>

          <p className="text-gray-600 mb-6">
            {t.emailSentDesc}
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-2">
              {t.emailNotReceived}
            </p>
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {resending ? 'Küldés...' : t.resendEmail}
            </button>
            <p className="text-xs text-blue-600 mt-1">
              {t.checkSpam}
            </p>
          </div>

          <button
            onClick={() => navigate('/login-authentication')}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t.backToLogin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Landlord
            </h1>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4 text-gray-500" />
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value="hu">{translations.hu.hungarian}</option>
              <option value="en">{translations.en.english}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Left Panel - Selected Plan */}
        <div className="lg:w-1/3 bg-white border-r p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t.selectedPlan}
          </h2>

          {selectedPlan ? (
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {selectedPlan.price_huf.toLocaleString('hu-HU')} Ft
                  </div>
                  <div className="text-emerald-100 text-sm">/hó</div>
                </div>
              </div>

              <p className="text-emerald-100 mb-4 text-sm">
                {selectedPlan.description}
              </p>

              <div className="space-y-2">
                {selectedPlan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-200" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan.property_limit && (
                <div className="mt-4 pt-4 border-t border-emerald-400">
                  <div className="text-sm text-emerald-100">
                    Ingatlan limit: <span className="font-semibold">{selectedPlan.property_limit}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-4">
                {t.loadingPlans}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Registration Form */}
        <div className="lg:w-2/3 p-6 lg:p-8">
          <div className="max-w-lg mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t.title}
              </h1>
              <p className="text-gray-600">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t.personalInfo}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Kovács János"
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="kovacs.janos@example.hu"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.password} *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Minimum 8 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.confirmPassword} *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Jelszó ismétlése"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-2 text-gray-500"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="+36 30 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Data - Optional */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t.companyData}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCompanyFields(!showCompanyFields)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {showCompanyFields ? t.skipCompanyData : t.addCompanyData}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-700 text-sm">
                      {t.companyDataOptional}
                    </p>
                  </div>
                </div>

                {showCompanyFields && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.companyName}
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Példa Kft."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.companyVatId}
                      </label>
                      <input
                        type="text"
                        value={formData.companyVatId}
                        onChange={(e) => handleInputChange('companyVatId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="12345678-1-23"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.companyAddress}
                      </label>
                      <input
                        type="text"
                        value={formData.companyAddress}
                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="1051 Budapest, Példa utca 1."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Marketing */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    {t.acceptTerms} *
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-red-600 text-sm">{errors.acceptTerms}</p>
                )}

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="acceptMarketing" className="text-sm text-gray-700">
                    {t.acceptMarketing}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.emailSending : t.createAccount}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Company Data Modal */}
      <CompanyDataModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onConfirm={async () => {
          setShowCompanyModal(false);
          await processRegistration();
        }}
        onAddCompanyData={() => {
          setShowCompanyModal(false);
          setShowCompanyFields(true);
        }}
        language={formData.language}
      />
    </div>
  );
}