'use client';

import React, { Suspense } from 'react';
import EnhancedRegistrationContent from './components/EnhancedRegistrationContent';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="text-gray-600 text-lg">Betöltés...</span>
      </div>
    </div>
  </div>
);

export default function EnhancedRegistrationFlow() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EnhancedRegistrationContent />
    </Suspense>
  );
}