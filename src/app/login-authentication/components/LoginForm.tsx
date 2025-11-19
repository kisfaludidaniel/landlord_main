'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Icon from '@/components/ui/AppIcon';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm = ({ onSubmit, isLoading = false, error }: LoginFormProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    if (!formData.email) {
      errors.email = 'Az email cím megadása kötelező';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Érvényes email címet adjon meg';
    }

    if (!formData.password) {
      errors.password = 'A jelszó megadása kötelező';
    } else if (formData.password.length < 6) {
      errors.password = 'A jelszó legalább 6 karakter hosszú legyen';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-32"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bejelentkezés
          </h1>
          <p className="text-muted-foreground">
            Jelentkezzen be a fiókjába a folytatáshoz
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-error flex-shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email cím
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 pl-12 bg-input border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  validationErrors.email ? 'border-error' : 'border-border'
                }`}
                placeholder="pelda@email.com"
                disabled={isLoading}
              />
              <Icon 
                name="EnvelopeIcon" 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-error">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Jelszó
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pl-12 pr-12 bg-input border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  validationErrors.password ? 'border-error' : 'border-border'
                }`}
                placeholder="Adja meg jelszavát"
                disabled={isLoading}
              />
              <Icon 
                name="LockClosedIcon" 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-error">{validationErrors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                disabled={isLoading}
              />
              <span className="text-sm text-foreground">Emlékezzen rám</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Elfelejtett jelszó?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>Bejelentkezés...</span>
              </>
            ) : (
              <>
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Bejelentkezés</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">vagy</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          className="w-full bg-card hover:bg-muted border border-border text-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center space-x-3"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Bejelentkezés Google-lal</span>
        </button>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Még nincs fiókja?{' '}
            <Link
              to="/user-registration"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Regisztráljon itt
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;