'use client';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login-authentication')
        return
      }

      if (profile?.role !== 'TENANT') {
        navigate('/main-dashboard')
        return
      }
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || profile?.role !== 'TENANT') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Bérlő Irányítópult
              </h1>
              <p className="text-muted-foreground">
                Üdvözöljük, {profile?.full_name}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login-authentication')}
                className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Kijelentkezés</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="UserIcon" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Sikeresen létrehozta bérlő fiókját! 🎉
              </h2>
              <p className="text-muted-foreground">
                Bérlőként ingyenesen használhatja a platformot. Kommunikálhat a főbérlőjével, 
                kezelheti dokumentumait és karbantartási kéréseket nyújthat be.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="DocumentTextIcon" size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Dokumentumok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kezelje szerződéseit és dokumentumait
            </p>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Megnyitás
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="WrenchScrewdriverIcon" size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Karbantartás</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Jelentse be karbantartási problémáit
            </p>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Új kérés
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Üzenetek</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Kommunikáljon a főbérlőjével
            </p>
            <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Üzenetek
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Legutóbbi aktivitás
          </h3>
          <div className="text-center py-8">
            <Icon name="InboxIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Még nincs aktivitás. Kezdje el a platform használatát!
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Profil információk
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Teljes név</span>
                <p className="text-muted-foreground">{profile?.full_name}</p>
              </div>
              <button className="text-primary hover:text-primary/80 text-sm">
                Szerkesztés
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Email cím</span>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
              <button className="text-primary hover:text-primary/80 text-sm">
                Szerkesztés
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <span className="text-sm font-medium text-foreground">Telefonszám</span>
                <p className="text-muted-foreground">
                  {profile?.phone || 'Nincs megadva'}
                </p>
              </div>
              <button className="text-primary hover:text-primary/80 text-sm">
                Szerkesztés
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-medium text-foreground">Szerep</span>
                <p className="text-muted-foreground">Bérlő</p>
              </div>
              <span className="text-success text-sm font-medium">Aktív</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}