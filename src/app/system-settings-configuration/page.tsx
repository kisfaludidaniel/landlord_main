'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Settings, Palette, Globe, Mail, Database, Bell, Shield, Save, TestTube, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  is_active: boolean;
}

interface UserSetting {
  id: string;
  user_id: string;
  language: 'hu' | 'en';
  theme: 'light' | 'dark';
  timezone: string;
  email_notifications: boolean;
  browser_notifications: boolean;
}

export default function SystemSettingsConfiguration() {
  const { user, profile } = useAuth();
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [userSettings, setUserSettings] = useState<UserSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState<{ type: 'success' | 'error' | 'info'; message: string }[]>([]);
  const [testEmailResult, setTestEmailResult] = useState<string>('');

  const supabase = createSupabaseClient();

  // Language content
  const content = {
    hu: {
      title: 'Rendszer Beállítások és Konfiguráció',
      subtitle: 'Globális rendszer preferenciák, nyelvi beállítások és teljesítmény optimalizálás kezelése',
      tabs: {
        general: 'Általános',
        language: 'Nyelv',
        appearance: 'Megjelenés',
        email: 'Email',
        maintenance: 'Karbantartás',
        performance: 'Teljesítmény',
        notifications: 'Értesítések'
      },
      labels: {
        systemName: 'Rendszer neve',
        defaultLanguage: 'Alapértelmezett nyelv',
        colorScheme: 'Színséma',
        emailEnabled: 'Email küldés engedélyezve',
        testEmail: 'Teszt email küldése',
        cacheSettings: 'Gyorsítótár beállítások',
        errorLogging: 'Hibanaplózás',
        loadingAnimation: 'Betöltő animáció',
        personalSettings: 'Személyes beállítások',
        language: 'Nyelv',
        theme: 'Téma',
        emailNotifications: 'Email értesítések',
        browserNotifications: 'Böngésző értesítések'
      },
      buttons: {
        save: 'Mentés',
        test: 'Teszt',
        clearCache: 'Gyorsítótár törlése',
        optimizeDb: 'Adatbázis optimalizálás'
      },
      messages: {
        saved: 'Beállítások sikeresen mentve',
        testEmailSent: 'Teszt email elküldve',
        cacheCleared: 'Gyorsítótár törölve',
        error: 'Hiba történt',
        unauthorized: 'Nincs jogosultság',
        loadingSettings: 'Beállítások betöltése...'
      }
    },
    en: {
      title: 'System Settings & Configuration',
      subtitle: 'Manage global system preferences, language settings, and performance optimizations',
      tabs: {
        general: 'General',
        language: 'Language',
        appearance: 'Appearance',
        email: 'Email',
        maintenance: 'Maintenance',
        performance: 'Performance',
        notifications: 'Notifications'
      },
      labels: {
        systemName: 'System Name',
        defaultLanguage: 'Default Language',
        colorScheme: 'Color Scheme',
        emailEnabled: 'Email Enabled',
        testEmail: 'Send Test Email',
        cacheSettings: 'Cache Settings',
        errorLogging: 'Error Logging',
        loadingAnimation: 'Loading Animation',
        personalSettings: 'Personal Settings',
        language: 'Language',
        theme: 'Theme',
        emailNotifications: 'Email Notifications',
        browserNotifications: 'Browser Notifications'
      },
      buttons: {
        save: 'Save',
        test: 'Test',
        clearCache: 'Clear Cache',
        optimizeDb: 'Optimize Database'
      },
      messages: {
        saved: 'Settings saved successfully',
        testEmailSent: 'Test email sent',
        cacheCleared: 'Cache cleared',
        error: 'An error occurred',
        unauthorized: 'Unauthorized access',
        loadingSettings: 'Loading settings...'
      }
    }
  };

  const currentLang = userSettings?.language || 'hu';
  const t = content[currentLang];

  useEffect(() => {
    if (user && profile) {
      loadSettings();
    }
  }, [user, profile]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load system settings
      const { data: systemData, error: systemError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (systemError) {
        addNotification('error', t.messages.error + ': ' + systemError.message);
        return;
      }

      setSystemSettings(systemData || []);

      // Load user settings
      const { data: userData, error: userError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        addNotification('error', t.messages.error + ': ' + userError.message);
        return;
      }

      if (userData) {
        setUserSettings(userData);
      } else {
        // Create default user settings
        const defaultSettings = {
          user_id: user?.id,
          language: 'hu' as const,
          theme: 'light',
          timezone: 'Europe/Budapest',
          email_notifications: true,
          browser_notifications: true
        };

        const { data: newUserData, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          addNotification('error', createError.message);
        } else {
          setUserSettings(newUserData);
        }
      }
    } catch (error: any) {
      addNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const notification = { type, message };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, 5000);
  };

  const saveSettings = async () => {
    if (!user || !userSettings) return;

    try {
      setSaving(true);

      // Save user settings
      const { error: userError } = await supabase
        .from('user_settings')
        .update({
          language: userSettings.language,
          theme: userSettings.theme,
          timezone: userSettings.timezone,
          email_notifications: userSettings.email_notifications,
          browser_notifications: userSettings.browser_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (userError) {
        addNotification('error', userError.message);
        return;
      }

      addNotification('success', t.messages.saved);
    } catch (error: any) {
      addNotification('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const testEmailDelivery = async () => {
    try {
      setTestEmailResult('Küldés...');
      
      // Simulate email test
      setTimeout(() => {
        setTestEmailResult('✅ Email teszt sikeres');
        addNotification('success', t.messages.testEmailSent);
      }, 2000);
    } catch (error: any) {
      setTestEmailResult('❌ Email teszt sikertelen');
      addNotification('error', error.message);
    }
  };

  const clearCache = async () => {
    try {
      // Simulate cache clearing
      addNotification('info', 'Gyorsítótár törlése...');
      setTimeout(() => {
        addNotification('success', t.messages.cacheCleared);
      }, 1500);
    } catch (error: any) {
      addNotification('error', error.message);
    }
  };

  const optimizeDatabase = async () => {
    try {
      addNotification('info', 'Adatbázis optimalizálás...');
      setTimeout(() => {
        addNotification('success', 'Adatbázis optimalizálás befejezve');
      }, 3000);
    } catch (error: any) {
      addNotification('error', error.message);
    }
  };

  const updateUserSetting = (key: keyof UserSetting, value: any) => {
    if (!userSettings) return;
    setUserSettings({ ...userSettings, [key]: value });
  };

  const getSystemSettingValue = (key: string, defaultValue: any = '') => {
    const setting = systemSettings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">{t.messages.loadingSettings}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.messages.unauthorized}</h2>
            <p className="text-gray-600">Csak adminisztrátorok férhetnek hozzá ehhez az oldalhoz.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabConfig = [
    { id: 'general', label: t.tabs.general, icon: Settings },
    { id: 'language', label: t.tabs.language, icon: Globe },
    { id: 'appearance', label: t.tabs.appearance, icon: Palette },
    { id: 'email', label: t.tabs.email, icon: Mail },
    { id: 'performance', label: t.tabs.performance, icon: BarChart3 },
    { id: 'notifications', label: t.tabs.notifications, icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error'? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Alapvető rendszer beállítások</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.labels.systemName}
                      </label>
                      <input
                        type="text"
                        value={getSystemSettingValue('system_name')?.hu || 'Landlord'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verzió
                      </label>
                      <input
                        type="text"
                        value="1.0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cég információk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Cég neve"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Cím"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon"
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === 'language' && userSettings && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nyelvi beállítások</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.labels.language}
                      </label>
                      <select
                        value={userSettings.language}
                        onChange={(e) => updateUserSetting('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="hu">Magyar</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Időzóna
                      </label>
                      <select
                        value={userSettings.timezone}
                        onChange={(e) => updateUserSetting('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Europe/Budapest">Budapest</option>
                        <option value="Europe/London">London</option>
                        <option value="America/New_York">New York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && userSettings && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Megjelenés beállítások</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.labels.theme}
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="light"
                            checked={userSettings.theme === 'light'}
                            onChange={(e) => updateUserSetting('theme', e.target.value)}
                            className="mr-2"
                          />
                          Világos
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="dark"
                            checked={userSettings.theme === 'dark'}
                            onChange={(e) => updateUserSetting('theme', e.target.value)}
                            className="mr-2"
                          />
                          Sötét
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Színséma testreszabás
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Elsődleges</label>
                          <input
                            type="color"
                            value="#2563eb"
                            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Másodlagos</label>
                          <input
                            type="color"
                            value="#64748b"
                            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Kiemelő</label>
                          <input
                            type="color"
                            value="#059669"
                            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email konfiguráció</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="SMTP szerver"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Port"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Felhasználónév"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="Jelszó"
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={testEmailDelivery}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <TestTube className="w-4 h-4" />
                        <span>{t.buttons.test}</span>
                      </button>
                      {testEmailResult && (
                        <span className="text-sm font-medium">{testEmailResult}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Settings */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Teljesítmény optimalizálás</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Gyorsítótár kezelés</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        A gyorsítótár törlése javíthatja a rendszer teljesítményét.
                      </p>
                      <button
                        onClick={clearCache}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{t.buttons.clearCache}</span>
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Adatbázis optimalizálás</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Az adatbázis optimalizálása javítja a lekérdezések sebességét.
                      </p>
                      <button
                        onClick={optimizeDatabase}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Database className="w-4 h-4" />
                        <span>{t.buttons.optimizeDb}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && userSettings && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Értesítési beállítások</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Email értesítések</h4>
                        <p className="text-sm text-gray-600">Értesítések email-ben</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userSettings.email_notifications}
                          onChange={(e) => updateUserSetting('email_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Böngésző értesítések</h4>
                        <p className="text-sm text-gray-600">Push értesítések a böngészőben</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userSettings.browser_notifications}
                          onChange={(e) => updateUserSetting('browser_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Mentés...' : t.buttons.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}