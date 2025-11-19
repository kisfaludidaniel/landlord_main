'use client';

import { HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Link, useSearchParams } from 'react-router-dom';
import { Suspense } from 'react';

// Component that uses useSearchParams wrapped in Suspense
function RoleSelectionContent() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  // Helper function to build registration URLs
  const buildRegistrationUrl = (role: 'LANDLORD' | 'TENANT') => {
    const params = new URLSearchParams();
    params.set('role', role);
    
    if (planId) {
      params.set('planId', planId);
    }
    
    return `/user-registration?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Miért regisztrál a platformra?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Válassza ki a megfelelő szerepet, hogy a regisztráció során csak a releváns funkciókat és csomagokat ajánljuk fel.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Landlord Card */}
          <Link
            to={buildRegistrationUrl('LANDLORD')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Főbérlő vagyok
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Landlord • Ingatlant szeretnék kiadni
              </p>
              
              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Ingatlan portfólió kezelése</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Bérlők kezelése és meghívása</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Számlagenerálás és bérleti díj kezelés</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Pénzügyi jelentések és elemzések</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Karbantartási kérések kezelése</span>
                </div>
              </div>
              
              {/* CTA */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-blue-800 font-medium">
                  Csomag választás szükséges • Cég adatok opcionális
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Tenant Card */}
          <Link
            to={buildRegistrationUrl('TENANT')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors duration-300">
                <HomeIcon className="w-8 h-8 text-green-600 group-hover:text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bérlő vagyok
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Tenant • Ingatlant bérelek, albérletben vagyok
              </p>
              
              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Bérleti díj fizetés kezelése</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Karbantartási kérések beküldése</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Dokumentumok megtekintése</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Kommunikáció főbérlővel</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Fizetési előzmények</span>
                </div>
              </div>
              
              {/* CTA */}
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-green-800 font-medium">
                  Csomag választás nem szükséges • Egyszerű regisztráció
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

        </div>

        {/* Additional Info */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Átfogó ingatlankezelési megoldás
            </h4>
            <p className="text-gray-600">
              A Micro-Landlord OS egy modern, magyar piaci igényekre szabott ingatlankezelési platform. 
              Akár egyetlen lakást kezel, akár nagyobb portfólióval rendelkezik, megtalálja a megfelelő megoldást.
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Már rendelkezik fiókkal?
          </p>
          <Link
            to="/login-authentication"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function RoleSelectionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function RoleSelectionPage() {
  return (
    <Suspense fallback={<RoleSelectionLoading />}>
      <RoleSelectionContent />
    </Suspense>
  );
}