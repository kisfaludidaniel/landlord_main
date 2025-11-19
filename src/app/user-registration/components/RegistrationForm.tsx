'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Icon from '@/components/ui/AppIcon';
import { authService, type SignUpData, type UserRole } from '@/lib/supabase/auth';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  agreeToTerms?: string;
  agreeToPrivacy?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const RegistrationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Gyenge',
    color: 'bg-red-500'
  });

  useEffect(() => {
    setIsHydrated(true);
    // Get role from URL params and redirect if not found
    const role = searchParams?.get('role') as UserRole;
    if (!role || (role !== 'LANDLORD' && role !== 'TENANT')) {
      router.push('/role-selection');
      return;
    }
    setSelectedRole(role);
  }, [searchParams, router]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strengthMap = {
      0: { label: 'Gyenge', color: 'bg-red-500' },
      1: { label: 'Gyenge', color: 'bg-red-500' },
      2: { label: 'Közepes', color: 'bg-yellow-500' },
      3: { label: 'Jó', color: 'bg-blue-500' },
      4: { label: 'Erős', color: 'bg-green-500' },
      5: { label: 'Nagyon erős', color: 'bg-green-600' }
    };

    return {
      score,
      ...strengthMap[score as keyof typeof strengthMap]
    };
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+36|06)?[1-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('36')) {
      const formatted = cleaned.replace(/^36(\d{2})(\d{3})(\d{4})$/, '+36 $1 $2 $3');
      return formatted;
    }
    if (cleaned.startsWith('06')) {
      const formatted = cleaned.replace(/^06(\d{2})(\d{3})(\d{4})$/, '06 $1 $2 $3');
      return formatted;
    }
    return phone;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'A teljes név megadása kötelező';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'A teljes név legalább 2 karakter hosszú legyen';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Érvényes email címet adjon meg';
    }

    if (!formData.password) {
      newErrors.password = 'A jelszó megadása kötelező';
    } else if (formData.password.length < 8) {
      newErrors.password = 'A jelszó legalább 8 karakter hosszú legyen';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszó megerősítése kötelező';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'A telefonszám megadása kötelező';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Érvényes magyar telefonszámot adjon meg';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Az Általános Szerződési Feltételek elfogadása kötelező';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'Az Adatvédelmi Szabályzat elfogadása kötelező';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (field === 'phoneNumber' && typeof value === 'string') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phoneNumber: formatted }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if test users are allowed
      const allowTestUsers = process.env.NEXT_PUBLIC_ALLOW_TEST_USERS === 'true';
      
      if (!allowTestUsers && formData.email.includes('test')) {
        // throw new Error('Test felhasználók regisztrációja jelenleg nem engedélyezett');
      }

      // Get role from URL params, default to LANDLORD
      const role = (searchParams?.get('role') as UserRole) || 'LANDLORD';
      
      const signUpData: SignUpData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        role: role,
      };

      await authService.signUp(signUpData);
      
      toast.success('Regisztráció sikeres! Kérjük, ellenőrizze email fiókját a megerősítéshez.');
      
      // Redirect based on role
      if (role === 'TENANT') {
        router.push('/tenant/dashboard');
      } else {
        router.push('/organization-setup-wizard');
      }
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Regisztráció sikertelen. Kérjük, próbálja újra.';
      
      if (error?.message?.includes('email')) {
        errorMessage = 'Ez az email cím már regisztrálva van.';
      } else if (error?.message?.includes('password')) {
        errorMessage = 'A jelszó nem megfelelő formátumú.';
      } else if (error?.message?.includes('policy')) {
        errorMessage = 'Hiba történt a profil létrehozásakor. Kérjük, próbálja újra.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !selectedRole) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getFieldValidationClass = (field: keyof FormData) => {
    if (errors[field]) return 'form-input-error';
    if (field === 'email' && formData.email && validateEmail(formData.email)) return 'form-input-success';
    if (field === 'phoneNumber' && formData.phoneNumber && validatePhoneNumber(formData.phoneNumber)) return 'form-input-success';
    if (field === 'fullName' && formData.fullName && formData.fullName.length >= 2) return 'form-input-success';
    if (field === 'password' && formData.password && formData.password.length >= 8) return 'form-input-success';
    if (field === 'confirmPassword' && formData.confirmPassword && formData.password === formData.confirmPassword) return 'form-input-success';
    return 'form-input';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        {/* Role Display Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <span className="text-blue-700 text-sm font-medium">
              {selectedRole === 'LANDLORD' ? '🏢 Főbérlő regisztráció' : '🏠 Bérlő regisztráció'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedRole === 'LANDLORD' ? 'Főbérlő Regisztráció' : 'Bérlő Regisztráció'}
          </h1>
          <p className="text-gray-600">
            {selectedRole === 'LANDLORD' ?'Hozza létre fiókját és kezdje el ingatlanjai kezelését' :'Regisztráljon bérlőként és kezelje bérleti ügyeit egyszerűen'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Teljes név *
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={getFieldValidationClass('fullName')}
                placeholder="Kovács János"
              />
              {!errors.fullName && formData.fullName && formData.fullName.length >= 2 && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {errors.fullName && (
                <XMarkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email cím *
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={getFieldValidationClass('email')}
                placeholder="kovacs.janos@email.com"
              />
              {!errors.email && formData.email && validateEmail(formData.email) && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {errors.email && (
                <XMarkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Jelszó *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`${getFieldValidationClass('password')} pr-20`}
                placeholder="Legalább 8 karakter"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {!errors.password && formData.password && formData.password.length >= 8 && (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                )}
                {errors.password && (
                  <XMarkIcon className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                </button>
              </div>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  <p>A jelszónak tartalmaznia kell:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      Legalább 8 karakter
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      Nagy betű
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                      Kis betű
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                      Szám
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Jelszó megerősítése *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`${getFieldValidationClass('confirmPassword')} pr-20`}
                placeholder="Írja be újra a jelszót"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckIcon className="w-4 h-4 text-green-500" />
                )}
                {errors.confirmPassword && (
                  <XMarkIcon className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Telefonszám *
            </label>
            <div className="relative">
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={getFieldValidationClass('phoneNumber')}
                placeholder="+36 30 123 4567"
              />
              {!errors.phoneNumber && formData.phoneNumber && validatePhoneNumber(formData.phoneNumber) && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {errors.phoneNumber && (
                <XMarkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.phoneNumber && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                Elfogadom az{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Általános Szerződési Feltételeket
                </Link>{' '}
                *
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-600 text-sm flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.agreeToTerms}
              </p>
            )}

            <div className="flex items-start space-x-3">
              <input
                id="agreeToPrivacy"
                type="checkbox"
                checked={formData.agreeToPrivacy}
                onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToPrivacy" className="text-sm text-gray-700">
                Elfogadom az{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Adatvédelmi Szabályzatot
                </Link>{' '}
                *
              </label>
            </div>
            {errors.agreeToPrivacy && (
              <p className="text-red-600 text-sm flex items-center">
                <XMarkIcon className="w-4 h-4 mr-1" />
                {errors.agreeToPrivacy}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Regisztráció...</span>
              </div>
            ) : (
              selectedRole === 'LANDLORD' ? 'Főbérlő fiók létrehozása' : 'Bérlő fiók létrehozása'
            )}
          </button>
        </form>

        {/* Role Change Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Nem megfelelő szerepkör?{' '}
            <Link href="/role-selection" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              Válasszon másik szerepkört
            </Link>
          </p>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Már van fiókja?{' '}
            <Link href="/login-authentication" className="nav-link font-medium">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;