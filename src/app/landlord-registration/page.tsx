'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, HomeIcon, BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { PRICING_PLANS, formatPrice, getPlanById } from '@/config/plans';

// Form validation schema
const landlordSchema = z.object({
  fullName: z.string().min(1, 'Teljes név megadása kötelező').min(2, 'A névnek legalább 2 karakter hosszúnak kell lennie'),
  email: z.string().min(1, 'Email cím megadása kötelező').email('Érvényes email címet adjon meg'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie')
    .regex(/[A-Z]/, 'A jelszónak tartalmaznia kell legalább egy nagybetűt')
    .regex(/[a-z]/, 'A jelszónak tartalmaznia kell legalább egy kisbetűt')
    .regex(/[0-9]/, 'A jelszónak tartalmaznia kell legalább egy számot'),
  confirmPassword: z.string().min(1, 'Jelszó megerősítése kötelező'),
  companyName: z.string().optional(),
  companyVatId: z.string().optional(),
  companyAddress: z.string().optional(),
  skipCompanyInfo: z.boolean().default(false),
  estimatedProperties: z.number().min(1).default(1),
  currentExperience: z.string().default('beginner'),
  selectedPlanId: z.string().default('starter'),
  acceptTerms: z.boolean().refine(val => val === true, 'Az Általános Szerződési Feltételek elfogadása kötelező'),
  acceptPrivacy: z.boolean().refine(val => val === true, 'Az Adatvédelmi Szabályzat elfogadása kötelező'),
  acceptMarketing: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
}).refine((data) => {
  if (!data.skipCompanyInfo) {
    return data.companyName && data.companyVatId && data.companyAddress;
  }
  return true;
}, {
  message: "Cég adatok kitöltése kötelező, ha nem hagyja ki",
  path: ["companyName"],
});

type LandlordFormData = z.infer<typeof landlordSchema>;

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; feedback: string; color: string } => {
  if (!password) return { score: 0, feedback: '', color: 'gray' };
  
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) score += 25;
  else feedback.push('legalább 8 karakter');
  
  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push('nagybetű');
  
  if (/[a-z]/.test(password)) score += 25;
  else feedback.push('kisbetű');
  
  if (/[0-9]/.test(password)) score += 25;
  else feedback.push('szám');
  
  let strengthText = '';
  let color = '';
  
  if (score < 50) {
    strengthText = 'Gyenge';
    color = 'red';
  } else if (score < 75) {
    strengthText = 'Közepes';
    color = 'yellow';
  } else if (score < 100) {
    strengthText = 'Erős';
    color = 'blue';
  } else {
    strengthText = 'Nagyon erős';
    color = 'green';
  }
  
  const feedbackText = feedback.length > 0 ? `Hiányzik: ${feedback.join(', ')}` : 'Megfelelő jelszó';
  
  return { score, feedback: feedbackText, color };
};

function LandlordRegistrationContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0); // Start with role confirmation (step 0)
  const [isLoading, setIsLoading] = useState(false);
  const [showCompanyWarning, setShowCompanyWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<LandlordFormData>({
    resolver: zodResolver(landlordSchema) as Resolver<LandlordFormData>,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companyVatId: '',
      companyAddress: '',
      skipCompanyInfo: false,
      estimatedProperties: 1,
      currentExperience: 'beginner',
      selectedPlanId: 'starter',
      acceptTerms: false,
      acceptPrivacy: false,
      acceptMarketing: false,
    }
  });

  const { watch, setValue, formState: { errors } } = form;
  const watchedPassword = watch('password');
  const passwordStrength = calculatePasswordStrength(watchedPassword);

  // Check for pre-selected plan from URL params or localStorage
  useEffect(() => {
    try {
      const planParam = searchParams.get('plan');
      const storedPlan = localStorage.getItem('selectedPlan');
      
      if (planParam && getPlanById(planParam)) {
        setValue('selectedPlanId', planParam);
        localStorage.setItem('selectedPlan', planParam);
        toast.success('Csomag előválasztva sikeresen');
      } else if (storedPlan && getPlanById(storedPlan)) {
        setValue('selectedPlanId', storedPlan);
      }
    } catch (error) {
      console.error('Error loading plan selection:', error);
      toast.error('Hiba történt a csomag betöltése során');
    }
  }, [searchParams, setValue]);

  const getRecommendedPlan = () => {
    const estimatedProperties = watch('estimatedProperties');
    if (estimatedProperties <= 1) return 'free';
    if (estimatedProperties <= 3) return 'starter';
    if (estimatedProperties <= 10) return 'pro';
    return 'unlimited';
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Role confirmation step - no validation needed
      setCurrentStep(1);
      return;
    }
    
    const fieldsToValidate = getFieldsForStep(currentStep) as Array<keyof LandlordFormData>;
    
    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        if (currentStep === 2 && watch('skipCompanyInfo') && !showCompanyWarning) {
          setShowCompanyWarning(true);
          return;
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
        setShowCompanyWarning(false);
      } else {
        toast.error('Kérem, javítsa ki a hibákat a folytatáshoz');
      }
    });
  };

  const getFieldsForStep = (step: number): Array<keyof LandlordFormData> => {
    switch (step) {
      case 1:
        return ['fullName', 'email', 'password', 'confirmPassword'];
      case 2:
        return watch('skipCompanyInfo') ? [] : ['companyName', 'companyVatId', 'companyAddress'];
      case 3:
        return ['acceptTerms', 'acceptPrivacy'];
      default:
        return [];
    }
  };

  const handleSubmit: SubmitHandler<LandlordFormData> = async (data) => {
    setIsLoading(true);
    
    try {
      // Store final plan selection
      localStorage.setItem('selectedPlan', data.selectedPlanId);
      localStorage.setItem('registrationData', JSON.stringify({
        ...data,
        registrationType: 'landlord'
      }));
      
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Regisztráció sikeres! Átirányítás...');
      
      // Redirect to organization setup with plan info
      navigate(`/organization-setup-wizard?plan=${data.selectedPlanId}&role=landlord`);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Hiba történt a regisztráció során. Kérem, próbálja újra.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = getPlanById(watch('selectedPlanId'));
  const recommendedPlanId = getRecommendedPlan();

  // Step 0: Role Confirmation (Tile Selection)
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Toaster position="top-right" />
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Főbérlő Regisztráció
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ön főbérlőként regisztrál a Micro-Landlord OS platformra. Lépjen tovább az adatok megadásához.
            </p>
          </div>

          {/* Role Confirmation Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
              </div>
              
              {/* Title */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Főbérlő regisztráció
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Landlord • Ingatlant szeretnék kiadni
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Ingatlan portfólió kezelése</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Bérlők kezelése és meghívása</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Számlagenerálás és bérleti díj kezelés</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Pénzügyi jelentések és elemzések</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Karbantartási kérések kezelése</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Info */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 mb-6">
                <p className="text-sm text-blue-800 font-medium text-center">
                  Csomag választás szükséges • Cég adatok opcionális • 3 lépéses regisztráció
                </p>
              </div>

              {/* Alternative Option */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Mégsem főbérlő? Váltson bérlői regisztrációra:
                </p>
                <Link
                  to="/tenant-registration"
                  className="inline-flex items-center px-4 py-2 border border-green-500 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Bérlő regisztráció
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex justify-between items-center">
              <Link
                to="/role-selection"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Vissza a szerepválasztáshoz
              </Link>

              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tovább a regisztrációhoz →
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Már rendelkezik fiókkal?{' '}
              <Link to="/login-authentication" className="text-blue-600 hover:underline">
                Bejelentkezés
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (currentStep === 1) {
                    setCurrentStep(0); // Go back to role confirmation
                  } else {
                    setCurrentStep(prev => prev - 1);
                    setShowCompanyWarning(false);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Főbérlő Regisztráció</h1>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep}/3 lépés
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-2 ${
                  step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                } ${step === 1 ? 'rounded-l' : ''} ${step === 3 ? 'rounded-r' : ''}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Személyes adatok</h2>
                  <p className="text-gray-600">Adja meg alapvető személyes adatait a fiók létrehozásához.</p>
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Teljes név *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      {...form.register('fullName')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Kovács János"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email cím *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...form.register('email')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="janos@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefonszám
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...form.register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+36 30 123 4567"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Jelszó *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        {...form.register('password')}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Legalább 8 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                              style={{ width: `${passwordStrength.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                            {passwordStrength.score < 100 ? 'Gyenge' : 'Erős'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{passwordStrength.feedback}</p>
                      </div>
                    )}
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Jelszó megerősítése *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        {...form.register('confirmPassword')}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ismételje meg a jelszót"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Estimated Properties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Becsült ingatlan mennyiség
                    </label>
                    <select
                      {...form.register('estimatedProperties', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1 ingatlan</option>
                      <option value={2}>2-3 ingatlan</option>
                      <option value={5}>4-10 ingatlan</option>
                      <option value={15}>10+ ingatlan</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jelenlegi tapasztalat
                    </label>
                    <select
                      {...form.register('currentExperience')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">Kezdő</option>
                      <option value="intermediate">Tapasztalt</option>
                      <option value="expert">Professzionális</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Information & Plan Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Company Information */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cég adatok (Opcionális)</h2>
                        <p className="text-gray-600">Ha céges számla generálásra van szüksége, adja meg cég adatait.</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register('skipCompanyInfo')}
                          className="sr-only"
                        />
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${
                          watch('skipCompanyInfo') ? 'bg-gray-400' : 'bg-blue-500'
                        }`}>
                          <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                            watch('skipCompanyInfo') ? 'translate-x-0.5' : 'translate-x-6'
                          }`}></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {watch('skipCompanyInfo') ? 'Kihagyom' : 'Kitöltöm'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {showCompanyWarning && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3" />
                        <div>
                          <p className="text-amber-800 font-medium">Figyelmeztetés</p>
                          <p className="text-amber-700 text-sm">
                            Cég adatok nélkül az automatikus számla generálás nem lesz elérhető. 
                            Ezt később a beállításokban pótolhatja.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!watch('skipCompanyInfo') && (
                    <div className="space-y-6">
                      {/* Company Name */}
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                          Cég neve *
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          {...form.register('companyName')}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.companyName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ingatlan Kft."
                        />
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                        )}
                      </div>

                      {/* Company VAT ID */}
                      <div>
                        <label htmlFor="companyVatId" className="block text-sm font-medium text-gray-700 mb-2">
                          Adószám *
                        </label>
                        <input
                          type="text"
                          id="companyVatId"
                          {...form.register('companyVatId')}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.companyVatId ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="12345678-1-23"
                        />
                        {errors.companyVatId && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyVatId.message}</p>
                        )}
                      </div>

                      {/* Company Address */}
                      <div>
                        <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                          Cég címe *
                        </label>
                        <textarea
                          id="companyAddress"
                          rows={3}
                          {...form.register('companyAddress')}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.companyAddress ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1051 Budapest, Sas utca 12."
                        />
                        {errors.companyAddress && (
                          <p className="mt-1 text-sm text-red-600">{errors.companyAddress.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Csomag választás</h2>
                    <p className="text-gray-600">
                      Válassza ki a megfelelő csomagot a portfóliója mérete alapján.
                    </p>
                    {recommendedPlanId !== watch('selectedPlanId') && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm">
                          <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                          Ajánlott csomag: <strong>{getPlanById(recommendedPlanId)?.name}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PRICING_PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          watch('selectedPlanId') === plan.id
                            ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'
                        } ${
                          recommendedPlanId === plan.id ? 'ring-2 ring-green-200' : ''
                        }`}
                        onClick={() => {
                          setValue('selectedPlanId', plan.id);
                          localStorage.setItem('selectedPlan', plan.id);
                        }}
                      >
                        {recommendedPlanId === plan.id && (
                          <div className="absolute -top-2 -right-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Ajánlott
                            </span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {formatPrice(plan.price)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">/hónap</p>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>
                              {typeof plan.propertyLimit === 'number' 
                                ? `${plan.propertyLimit} ingatlan`
                                : 'Korlátlan ingatlan'
                              }
                            </div>
                            <div>AI: {plan.aiEnabled ? 'Igen' : 'Nem'}</div>
                          </div>
                        </div>

                        {watch('selectedPlanId') === plan.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedPlan && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{selectedPlan.name} csomag funkciói:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {selectedPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Legal & Summary */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Regisztráció összesítése</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Név:</span>
                      <span className="font-medium">{watch('fullName')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{watch('email')}</span>
                    </div>
                    {watch('phone') && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Telefon:</span>
                        <span className="font-medium">{watch('phone')}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Csomag:</span>
                      <span className="font-medium">
                        {selectedPlan?.name} - {formatPrice(selectedPlan?.price || 0)}/hónap
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Cég adatok:</span>
                      <span className="font-medium">
                        {watch('skipCompanyInfo') ? 'Nem adtam meg' : 'Megadva'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal Agreements */}
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Jogi nyilatkozatok</h3>
                  
                  <div className="space-y-4">
                    {/* Terms */}
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        {...form.register('acceptTerms')}
                        className={`mt-0.5 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                          errors.acceptTerms ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-sm text-gray-700">
                        Elfogadom az{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Általános Szerződési Feltételeket
                        </a>
                        {' '}*
                      </span>
                    </label>
                    {errors.acceptTerms && (
                      <p className="ml-7 text-sm text-red-600">{errors.acceptTerms.message}</p>
                    )}

                    {/* Privacy */}
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        {...form.register('acceptPrivacy')}
                        className={`mt-0.5 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                          errors.acceptPrivacy ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-sm text-gray-700">
                        Elfogadom az{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Adatvédelmi Szabályzatot
                        </a>
                        {' '}*
                      </span>
                    </label>
                    {errors.acceptPrivacy && (
                      <p className="ml-7 text-sm text-red-600">{errors.acceptPrivacy.message}</p>
                    )}

                    {/* Marketing */}
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        {...form.register('acceptMarketing')}
                        className="mt-0.5 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Hozzájárulok, hogy marketing célú megkereséseket kapjak
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) {
                    setCurrentStep(0); // Go back to role confirmation
                  } else {
                    setCurrentStep(prev => prev - 1);
                    setShowCompanyWarning(false);
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {currentStep === 1 ? 'Vissza' : 'Előző'}
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tovább
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Regisztráció...
                    </>
                  ) : (
                    'Regisztráció befejezése'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Már rendelkezik fiókkal?{' '}
              <Link to="/login-authentication" className="text-blue-600 hover:underline">
                Bejelentkezés
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandlordRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <LandlordRegistrationContent />
    </Suspense>
  );
}