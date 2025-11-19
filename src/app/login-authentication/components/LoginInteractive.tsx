'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth.types';
import Icon from '@/components/ui/AppIcon';

interface DemoUser {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  description: string;
}

export default function LoginInteractive() {
  const { signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  // Updated demo users array with correct credentials
  const demoUsers: DemoUser[] = [
    { 
      role: 'ADMIN', 
      name: 'Admin', 
      email: 'admin@microlanlord.hu', 
      password: 'admin123',
      description: 'Rendszergazda teljes hozzáféréssel'
    },
    { 
      role: 'LANDLORD', 
      name: 'Főbérlő', 
      email: 'landlord@example.hu', 
      password: 'landlord123',
      description: 'Ingatlankezelő főbérlő Pro csomaggal'
    },
    { 
      role: 'TENANT', 
      name: 'Bérlő', 
      email: 'tenant@example.hu', 
      password: 'tenant123',
      description: 'Bérlő felhasználó ingyenes hozzáféréssel'
    }
  ];

  const handleLogin = async (formData: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Role-based redirect with updated admin route
        const userRole = data.user.user_metadata?.role;
        
        if (userRole === 'ADMIN') {
          navigate('/system-admin-dashboard');
        } else if (userRole === 'LANDLORD') {
          navigate('/main-dashboard');
        } else if (userRole === 'TENANT') {
          navigate('/tenant/dashboard');
        } else {
          // Default redirect
          navigate('/main-dashboard');
        }
      }
    } catch (err) {
      setError('Váratlan hiba történt. Kérjük próbálja újra.');
    } finally {
      setIsLoading(false);
    }
  };

  // Updated handleDemoLogin function to sign in or create account if needed
  const handleDemoLogin = async (role: UserRole) => {
    const user = demoUsers.find(u => u.role === role);
    if (!user) return;

    setDemoLoading(role);
    setError('');

    try {
      // First attempt to sign in
      let { data, error: signInError } = await signIn(user.email, user.password);

      // If sign-in fails (user not found), create the account
      if (signInError && signInError.message?.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await signUp(
          user.email,
          user.password,
          {
            fullName: user.name,
            role: user.role,
            phone: '',
            companyName: role === 'LANDLORD' ? 'Demo Bérltetési Kft.' : undefined,
            companyVatId: role === 'LANDLORD' ? '12345678-1-23' : undefined,
            companyAddress: role === 'LANDLORD' ? 'Budapest, Fő utca 1.' : undefined,
          }
        );

        if (signUpError) {
          setError(`Demo fiók létrehozása sikertelen: ${signUpError.message}`);
          return;
        }

        // After successful signup, sign in again
        const signInRetry = await signIn(user.email, user.password);
        if (signInRetry.error) {
          setError(`Bejelentkezés sikertelen: ${signInRetry.error.message}`);
          return;
        }
        
        data = signInRetry.data;
      } else if (signInError) {
        setError(`Demo bejelentkezés sikertelen: ${signInError.message}`);
        return;
      }

      if (data.user) {
        // Redirect based on role after successful authentication
        if (role === 'ADMIN') {
          navigate('/system-admin-dashboard');
        } else if (role === 'LANDLORD') {
          navigate('/main-dashboard');
        } else if (role === 'TENANT') {
          navigate('/tenant/dashboard');
        }
      }
    } catch (err) {
      setError('Demo bejelentkezés sikertelen. Kérjük próbálja újra.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Login Form */}
        <div className="flex-1">
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Demo Credentials */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border border-border p-6 shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Demo Hozzáférések
            </h2>
            <p className="text-muted-foreground mb-6">
              Kattintson az alábbi demo felhasználók egyikére az azonnali bejelentkezéshez
            </p>

            <div className="space-y-4">
              {demoUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => handleDemoLogin(user.role)}
                  className={`
                    cursor-pointer border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200
                    ${demoLoading === user.role ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">
                      {user.name}
                      {demoLoading === user.role && (
                        <span className="ml-2 text-sm text-muted-foreground">Bejelentkezés...</span>
                      )}
                    </span>
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${user.role === 'ADMIN' ? 'bg-error/20 text-error' : ''}
                      ${user.role === 'LANDLORD' ? 'bg-primary/20 text-primary' : ''}
                      ${user.role === 'TENANT' ? 'bg-success/20 text-success' : ''}
                    `}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {user.description}
                  </p>
                  <div className="bg-muted rounded p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-mono text-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Jelszó:</span>
                      <span className="font-mono text-foreground">{user.password}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="ExclamationTriangleIcon" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning mb-1">
                    Demo Környezet
                  </p>
                  <p className="text-xs text-warning">
                    Ezek teszt felhasználók a platform bemutatásához. 
                    Éles környezetben saját fiókot hozzon létre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}