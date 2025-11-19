'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
 import Icon from'@/components/ui/AppIcon';

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'LANDLORD' | 'TENANT' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (role: 'LANDLORD' | 'TENANT') => {
    setSelectedRole(role)
  }

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    try {
      // Store role in sessionStorage for the onboarding flow
      sessionStorage.setItem('onboarding_role', selectedRole)
      
      if (selectedRole === 'LANDLORD') {
        router.push('/onboarding/landlord/profile')
      } else {
        router.push('/onboarding/tenant/profile')
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Válassza ki a szerepét
          </h1>
          <p className="text-muted-foreground text-lg">
            Kérjük, válassza ki, hogy főbérlő vagy bérlő szeretne lenni
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Landlord Option */}
          <div
            onClick={() => handleRoleSelect('LANDLORD')}
            className={`
              cursor-pointer border-2 rounded-lg p-8 text-center transition-all duration-200
              ${selectedRole === 'LANDLORD' ?'border-primary bg-primary/5 shadow-lg' :'border-border bg-card hover:border-primary/50 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${selectedRole === 'LANDLORD' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon name="HomeIcon" size={32} />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Főbérlő
                </h3>
                <p className="text-muted-foreground">
                  Ingatlanokat bérbeadó tulajdonos vagy kezelő
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-left w-full">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Ingatlanok kezelése</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Bérlők adminisztrálása</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Pénzügyi jelentések</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Csomagválasztás</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Option */}
          <div
            onClick={() => handleRoleSelect('TENANT')}
            className={`
              cursor-pointer border-2 rounded-lg p-8 text-center transition-all duration-200
              ${selectedRole === 'TENANT' ?'border-primary bg-primary/5 shadow-lg' :'border-border bg-card hover:border-primary/50 hover:shadow-md'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${selectedRole === 'TENANT' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon name="UserIcon" size={32} />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Bérlő
                </h3>
                <p className="text-muted-foreground">
                  Ingatlant bérlő személy
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-left w-full">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Személyes profil</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Dokumentumok kezelése</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Kommunikáció főbérlővel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-primary flex-shrink-0" />
                  <span>Ingyenes használat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`
              px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200
              ${selectedRole
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                <span>Folytatás...</span>
              </div>
            ) : (
              'Folytatás'
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login-authentication')}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Vissza a bejelentkezéshez
          </button>
        </div>
      </div>
    </div>
  )
}