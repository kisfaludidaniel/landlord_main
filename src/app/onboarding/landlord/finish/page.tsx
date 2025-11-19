'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_PLANS } from '@/config/plans';
import Icon from '@/components/ui/AppIcon';

export default function LandlordFinishPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [createProperty, setCreateProperty] = useState(false)
  const [sendInvites, setSendInvites] = useState(false)
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: '',
    description: ''
  })

  useEffect(() => {
    // Check authentication and load selected plan
    if (!user || profile?.role !== 'LANDLORD') {
      navigate('/onboarding/role')
      return
    }

    const planId = sessionStorage.getItem('onboarding_selected_plan')
    if (planId) {
      const plan = PRICING_PLANS.find((planOption) => planOption.id === planId)
      setSelectedPlan(plan)
    }
  }, [user, profile, navigate])

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      // Clear onboarding data
      sessionStorage.removeItem('onboarding_role')
      sessionStorage.removeItem('onboarding_profile')
      sessionStorage.removeItem('onboarding_selected_plan')

      // Redirect to landlord dashboard
      navigate('/main-dashboard')
    } catch (error) {
      console.error('Finish onboarding error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('hu-HU').format(price)
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="CheckCircleIcon" size={40} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sikeres regisztráció! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Üdvözöljük a MicroLandlord platformon!
          </p>
        </div>

        {/* Account Summary */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Fiók összesítő
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-2">Profil adatok:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name="UserIcon" size={14} className="text-muted-foreground" />
                  <span>{profile?.full_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="EnvelopeIcon" size={14} className="text-muted-foreground" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="ShieldCheckIcon" size={14} className="text-muted-foreground" />
                  <span className="font-medium text-primary">Főbérlő</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Kiválasztott csomag:</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{selectedPlan.name}</span>
                  <span className="text-primary font-bold">
                    {formatPrice(selectedPlan.price)} Ft/hó
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Setup */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Opcionális beállítások
          </h2>
          <div className="space-y-6">
            {/* Create First Property */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="createProperty"
                  checked={createProperty}
                  onChange={(e) => setCreateProperty(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <div className="flex-1">
                  <label htmlFor="createProperty" className="font-medium text-foreground cursor-pointer">
                    Első ingatlan létrehozása
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Hozza létre első ingatlanát most, vagy megteheti később is
                  </p>
                </div>
              </div>
              
              {createProperty && (
                <div className="pl-7 space-y-3">
                  <input
                    type="text"
                    placeholder="Ingatlan neve (pl. Budapesti lakás)"
                    value={propertyData.name}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border-border"
                  />
                  <input
                    type="text"
                    placeholder="Cím"
                    value={propertyData.address}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border-border"
                  />
                  <textarea
                    placeholder="Rövid leírás (opcionális)"
                    value={propertyData.description}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border-border resize-none"
                  />
                </div>
              )}
            </div>

            {/* Send Invitations */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="sendInvites"
                  checked={sendInvites}
                  onChange={(e) => setSendInvites(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <div className="flex-1">
                  <label htmlFor="sendInvites" className="font-medium text-foreground cursor-pointer">
                    Bérlők meghívása
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Küldjön meghívót bérlőknek a platformra (későbbi funkcionalitás)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Tips */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Következő lépések
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Icon name="HomeIcon" size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Ingatlanok</h3>
              <p className="text-sm text-muted-foreground">
                Adja hozzá ingatlanait és kezdje el a kezelésüket
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Icon name="UsersIcon" size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Bérlők</h3>
              <p className="text-sm text-muted-foreground">
                Hívja meg bérlőit és kezdje el a kommunikációt
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Icon name="ChartBarIcon" size={24} className="text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Riportok</h3>
              <p className="text-sm text-muted-foreground">
                Kövesse nyomon pénzügyeit és teljesítményét
              </p>
            </div>
          </div>
        </div>

        {/* Finish Button */}
        <div className="text-center">
          <button
            onClick={handleFinish}
            disabled={isLoading}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-3 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                <span>Folyamat befejezése...</span>
              </>
            ) : (
              <>
                <span>Ugrás a főoldalra</span>
                <Icon name="ArrowRightIcon" size={20} />
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Kérdései vannak? Látogasson el a{' '}
            <span className="text-primary hover:underline cursor-pointer">
              súgó központunkba
            </span>{' '}
            vagy{' '}
            <span className="text-primary hover:underline cursor-pointer">
              vegye fel velünk a kapcsolatot
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  )
}