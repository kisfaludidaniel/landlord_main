'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeftIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';

type RegistrationStep = 'role-selection' | 'tenant-details' | 'verification'

// Form validation schema
const tenantSchema = z.object({
  fullName: z.string().min(1, 'Teljes név megadása kötelező').min(2, 'A névnek legalább 2 karakter hosszúnak kell lennie'),
  email: z.string().min(1, 'Email cím megadása kötelező').email('Érvényes email címet adjon meg'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie')
    .regex(/[A-Z]/, 'A jelszónak tartalmaznia kell legalább egy nagybetűt')
    .regex(/[a-z]/, 'A jelszónak tartalmaznia kell legalább egy kisbetűt')
    .regex(/[0-9]/, 'A jelszónak tartalmaznia kell legalább egy számot'),
  confirmPassword: z.string().min(1, 'Jelszó megerősítése kötelező'),
  invitationCode: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Az Általános Szerződési Feltételek elfogadása kötelező')
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface LandlordInfo {
  name: string
  email: string
  propertyAddress: string
}

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

function TenantRegistrationContent() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('role-selection')
  const [selectedRole, setSelectedRole] = useState<'landlord' | 'tenant' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [invitationValidated, setInvitationValidated] = useState(false)
  const [landlordInfo, setLandlordInfo] = useState<LandlordInfo | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      invitationCode: '',
      acceptTerms: false
    }
  });

  const { watch, setValue, formState: { errors } } = form;
  const watchedPassword = watch('password');
  const passwordStrength = calculatePasswordStrength(watchedPassword);

  // Check for invitation code in URL parameters
  useEffect(() => {
    try {
      const inviteCode = searchParams.get('invite')
      if (inviteCode) {
        setValue('invitationCode', inviteCode);
        setSelectedRole('tenant')
        setCurrentStep('tenant-details')
        validateInvitationCode(inviteCode)
      }
    } catch (error) {
      console.error('Error processing invitation code:', error);
      toast.error('Hiba történt a meghívókód feldolgozása során');
    }
  }, [searchParams, setValue])

  const validateInvitationCode = async (code: string) => {
    if (!code) return

    try {
      setIsLoading(true)
      
      // Check if invitation exists and is valid
      const { data: invite, error } = await supabase
        .from('tenant_invites')
        .select(`
          *,
          invited_by:user_profiles!tenant_invites_invited_by_fkey(full_name, email),
          unit_id:units!tenant_invites_unit_id_fkey(
            name,
            property_id:properties!units_property_id_fkey(
              name,
              address
            )
          )
        `)
        .eq('id', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !invite) {
        toast.error('Érvénytelen vagy lejárt meghívókód')
        return
      }

      // Pre-fill email if available
      if (invite.email) {
        setValue('email', invite.email);
      }

      setLandlordInfo({
        name: invite.invited_by?.full_name || 'Ismeretlen',
        email: invite.invited_by?.email || '',
        propertyAddress: `${invite.unit_id?.property_id?.name || 'Ingatlan'} - ${invite.unit_id?.name || 'Egység'}`
      })

      setInvitationValidated(true)
      toast.success('Meghívókód sikeresen érvényesítve')

    } catch (err: any) {
      console.error('Invitation validation error:', err)
      toast.error('Hiba történt a meghívókód ellenőrzése során')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelection = (role: 'landlord' | 'tenant') => {
    setSelectedRole(role)
    if (role === 'landlord') {
      // Redirect to landlord registration
      router.push('/landlord-registration')
    } else {
      // Continue with tenant registration
      setCurrentStep('tenant-details')
    }
  }

  const handleRegistration = async (data: TenantFormData) => {
    setIsLoading(true);
    
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'TENANT'
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Ez az email cím már regisztrálva van')
        } else {
          toast.error(`Regisztrációs hiba: ${authError.message}`)
        }
        return
      }

      if (!authData.user) {
        toast.error('Ismeretlen hiba történt a regisztráció során')
        return
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone || null,
          role: 'TENANT'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        toast.error('Hiba történt a profil létrehozása során')
        return
      }

      // If there's a valid invitation, accept it
      if (invitationValidated && data.invitationCode) {
        const { error: inviteError } = await supabase
          .from('tenant_invites')
          .update({
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('id', data.invitationCode)

        if (inviteError) {
          console.error('Invitation acceptance error:', inviteError)
        }
      }

      toast.success('Regisztráció sikeres! Ellenőrizze email fiókját.')
      
      // Redirect to verification step
      setCurrentStep('verification')

    } catch (err: any) {
      console.error('Registration error:', err)
      toast.error('Váratlan hiba történt a regisztráció során')
    } finally {
      setIsLoading(false)
    }
  }

  // Role Selection Step
  const renderRoleSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Válassza ki regisztrációs célját
          </h1>
          <p className="text-gray-600">
            Miért szeretne regisztrálni a MicroLandlord platformra?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Landlord Option */}
          <div 
            onClick={() => handleRoleSelection('landlord')}
            className="group cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-8 0H3m2 0h6M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Ingatlant szeretnék kiadni</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Főbérlő vagyok és szeretném kezelni az ingatlanaimat, bérlőimet és pénzügyeimet
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                <span>Főbérlői fiók létrehozása</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tenant Option */}
          <div 
            onClick={() => handleRoleSelection('tenant')}
            className="group cursor-pointer bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Ingatlant bérlek</h3>
              <p className="text-green-100 text-sm leading-relaxed">
                Bérlő vagyok és szeretném kezelni a bérleti kapcsolatomat és fizetéseimet
              </p>
              <div className="mt-4 inline-flex items-center text-sm font-medium">
                <span>Bérlői fiók létrehozása</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Már van fiókja? 
            <button 
              onClick={() => router.push('/login-authentication')}
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              Bejelentkezés
            </button>
          </p>
        </div>
      </div>
    </div>
  )

  // Tenant Details Step
  const renderTenantDetails = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentStep('role-selection')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bérlői regisztráció</h1>
            <p className="text-sm text-gray-600">Hozza létre bérlői fiókját</p>
          </div>
        </div>

        {/* Invitation Info */}
        {invitationValidated && landlordInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 mb-1">
                  Érvényes meghívó
                </h4>
                <p className="text-sm text-green-700">
                  <strong>{landlordInfo.name}</strong> meghívta Önt
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {landlordInfo.propertyAddress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleRegistration)} className="space-y-4">
          {/* Invitation Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meghívókód (opcionális)
            </label>
            <input
              type="text"
              {...form.register('invitationCode')}
              onBlur={(e) => {
                if (e.target.value && e.target.value !== watch('invitationCode')) {
                  validateInvitationCode(e.target.value);
                }
              }}
              placeholder="Adja meg a főbérlő által küldött meghívókódot"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ha van meghívókódja, automatikusan hozzárendelődik az ingatlanhoz
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teljes név <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...form.register('fullName')}
              placeholder="Vezetéknév Keresztnév"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email cím <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...form.register('email')}
              placeholder="email@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefonszám (opcionális)
            </label>
            <input
              type="tel"
              {...form.register('phone')}
              placeholder="+36 30 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jelszó <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...form.register('password')}
                placeholder="Legalább 8 karakter"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jelszó megerősítése <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...form.register('confirmPassword')}
                placeholder="Írja be újra a jelszót"
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                required
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

          {/* Terms */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              {...form.register('acceptTerms')}
              className={`mt-1 mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                errors.acceptTerms ? 'border-red-500' : ''
              }`}
              required
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
              Elfogadom az{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Általános Szerződési Feltételeket
              </a>{' '}
              és az{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Adatvédelmi Szabályzatot
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="ml-7 text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
              'Bérlői fiók létrehozása'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Már van fiókja?{' '}
            <button 
              onClick={() => router.push('/login-authentication')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Bejelentkezés
            </button>
          </p>
        </div>
      </div>
    </div>
  )

  // Verification Step
  const renderVerification = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Regisztráció sikeres!
        </h1>

        <p className="text-gray-600 mb-6">
          Elküldtünk egy megerősítő emailt a következő címre: 
          <br />
          <span className="font-medium text-gray-900">{watch('email')}</span>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Következő lépések:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Ellenőrizze az email postafiókját</li>
            <li>Kattintson a megerősítő linkre</li>
            <li>Jelentkezzen be bérlői fiókjába</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login-authentication')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Bejelentkezés
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Vissza a főoldalra
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Nem kapta meg az emailt? Ellenőrizze a spam mappát, vagy próbálja meg újra 5 perc múlva.
        </p>
      </div>
    </div>
  )

  // Render appropriate step
  switch (currentStep) {
    case 'role-selection':
      return renderRoleSelection()
    case 'tenant-details':
      return renderTenantDetails()
    case 'verification':
      return renderVerification()
    default:
      return renderRoleSelection()
  }
}

export default function TenantRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>}>
      <TenantRegistrationContent />
    </Suspense>
  );
}