'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
 import Icon from'@/components/ui/AppIcon';

interface ProfileFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  companyName: string
  companyVatId: string
  companyAddress: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

export default function LandlordProfilePage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    companyVatId: '',
    companyAddress: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  })
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCompanySection, setShowCompanySection] = useState(false)

  useEffect(() => {
    // Check if role is set
    const role = sessionStorage.getItem('onboarding_role')
    if (!role || role !== 'LANDLORD') {
      router.push('/onboarding/role')
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'A teljes név megadása kötelező'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Az email cím megadása kötelező'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Érvényes email címet adjon meg'
    }

    if (!formData.password) {
      newErrors.password = 'A jelszó megadása kötelező'
    } else if (formData.password.length < 8) {
      newErrors.password = 'A jelszó legalább 8 karakter hosszú legyen'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek'
    }

    if (formData.phone && !/^(\+36|06)?[1-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Érvényes magyar telefonszámot adjon meg'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Az Általános Szerződési Feltételek elfogadása kötelező'
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'Az Adatvédelmi Szabályzat elfogadása kötelező'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          role: 'LANDLORD',
          phone: formData.phone || undefined,
          companyName: formData.companyName || undefined,
          companyVatId: formData.companyVatId || undefined,
          companyAddress: formData.companyAddress || undefined,
        }
      )

      if (error) {
        setErrors({ email: error.message })
        return
      }

      if (data.user) {
        // Store profile data for next step
        sessionStorage.setItem('onboarding_profile', JSON.stringify(formData))
        router.push('/onboarding/landlord/plan')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: 'Váratlan hiba történt. Kérjük próbálja újra.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Főbérlő Profil Létrehozása
          </h1>
          <p className="text-muted-foreground">
            Töltse ki adatait a fiók létrehozásához
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Személyes Adatok
              </h3>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Teljes név *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.fullName ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Kovács János"
                />
                {errors.fullName && (
                  <p className="text-error text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email cím *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.email ? 'border-error' : 'border-border'
                  }`}
                  placeholder="kovacs.janos@email.com"
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Jelszó *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                      errors.password ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Legalább 8 karakter"
                  />
                  {errors.password && (
                    <p className="text-error text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Jelszó megerősítése *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                      errors.confirmPassword ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Írja be újra a jelszót"
                  />
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Telefonszám
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.phone ? 'border-error' : 'border-border'
                  }`}
                  placeholder="+36 30 123 4567"
                />
                {errors.phone && (
                  <p className="text-error text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Cégadatok
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCompanySection(!showCompanySection)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  {showCompanySection ? 'Elrejtés' : 'Kitöltés'}
                </button>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Icon name="ExclamationTriangleIcon" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning">
                    <strong>Figyelmeztetés:</strong> Ha kihagyja a cégadatok mezőit, az automatikus számlagenerálás nem lesz lehetséges.
                  </p>
                </div>
              </div>

              {showCompanySection && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                      Cég neve
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors border-border"
                      placeholder="Példa Kft."
                    />
                  </div>

                  <div>
                    <label htmlFor="companyVatId" className="block text-sm font-medium text-foreground mb-2">
                      Adószám
                    </label>
                    <input
                      id="companyVatId"
                      type="text"
                      value={formData.companyVatId}
                      onChange={(e) => handleInputChange('companyVatId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors border-border"
                      placeholder="12345678-1-23"
                    />
                  </div>

                  <div>
                    <label htmlFor="companyAddress" className="block text-sm font-medium text-foreground mb-2">
                      Cég címe
                    </label>
                    <textarea
                      id="companyAddress"
                      rows={3}
                      value={formData.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors border-border resize-none"
                      placeholder="1051 Budapest, Sas utca 12."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-foreground">
                  Elfogadom az <span className="text-primary hover:underline cursor-pointer">Általános Szerződési Feltételeket</span> *
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-error text-sm pl-7">{errors.agreeToTerms}</p>
              )}

              <div className="flex items-start space-x-3">
                <input
                  id="agreeToPrivacy"
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <label htmlFor="agreeToPrivacy" className="text-sm text-foreground">
                  Elfogadom az <span className="text-primary hover:underline cursor-pointer">Adatvédelmi Szabályzatot</span> *
                </label>
              </div>
              {errors.agreeToPrivacy && (
                <p className="text-error text-sm pl-7">{errors.agreeToPrivacy}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/onboarding/role')}
                className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Vissza
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Fiók létrehozása...</span>
                  </div>
                ) : (
                  'Folytatás a csomagválasztáshoz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}