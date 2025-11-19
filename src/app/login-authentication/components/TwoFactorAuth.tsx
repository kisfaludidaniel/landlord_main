'use client';

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface TwoFactorAuthProps {
  onVerify: (code: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  userEmail: string;
}

const TwoFactorAuth = ({ onVerify, onBack, isLoading = false, error, userEmail }: TwoFactorAuthProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHydrated]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      onVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  const handleResendCode = () => {
    setTimeLeft(300);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="flex justify-center space-x-2 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-12 h-12 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
            <Icon name="ShieldCheckIcon" size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Kétfaktoros hitelesítés
          </h1>
          <p className="text-muted-foreground">
            Adja meg a hitelesítő alkalmazásából származó 6 jegyű kódot
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Küldve: {userEmail}
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

        <div className="space-y-6">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-4 text-center">
              Hitelesítő kód
            </label>
            <div className="flex justify-center space-x-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  disabled={isLoading || timeLeft === 0}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              A kód lejár: <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={() => onVerify(code.join(''))}
            disabled={isLoading || code.some(digit => !digit) || timeLeft === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>Ellenőrzés...</span>
              </>
            ) : (
              <>
                <Icon name="CheckIcon" size={20} />
                <span>Kód ellenőrzése</span>
              </>
            )}
          </button>

          {/* Resend Code */}
          {timeLeft === 0 ? (
            <button
              type="button"
              onClick={handleResendCode}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center space-x-2"
            >
              <Icon name="ArrowPathIcon" size={20} />
              <span>Új kód kérése</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Icon name="ClockIcon" size={20} />
              <span>Új kód {formatTime(timeLeft)} múlva kérhető</span>
            </button>
          )}

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-card hover:bg-muted border border-border text-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            <Icon name="ArrowLeftIcon" size={20} />
            <span>Vissza a bejelentkezéshez</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="InformationCircleIcon" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Segítség a kóddal kapcsolatban:</p>
              <ul className="space-y-1 text-xs">
                <li>• Nyissa meg a hitelesítő alkalmazását (Google Authenticator, Authy, stb.)</li>
                <li>• Keresse meg a "Micro-Landlord OS Lite" bejegyzést</li>
                <li>• Adja meg a 6 jegyű kódot</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;