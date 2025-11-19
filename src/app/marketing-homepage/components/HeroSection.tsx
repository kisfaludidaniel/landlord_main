import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  return (
    <section className={`relative bg-gradient-to-br from-blue-50 via-white to-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                <Icon name="SparklesIcon" size={16} className="mr-2" />
                Ingyenes próbaverzió
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                Ingatlan kezelés{' '}
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  egyszerűen
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl font-light">
                Automatizálja bérleti díj beszedését, kezelje bérlőit és növelje bevételeit a Micro-Landlord OS Lite segítségével.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/user-registration"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 text-lg shadow-lg hover:shadow-xl">
                Ingyenes regisztráció
                <Icon name="ArrowRightIcon" size={20} className="ml-2" />
              </Link>
              
              <Link
                href="/login-authentication"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-lg shadow-sm">
                Bejelentkezés
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
                <div className="text-sm text-gray-600 font-medium">Aktív tulajdonos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">2,000+</div>
                <div className="text-sm text-gray-600 font-medium">Kezelt ingatlan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">98%</div>
                <div className="text-sm text-gray-600 font-medium">Elégedettség</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <AppImage
                src="https://images.unsplash.com/photo-1613232218235-06b473107ca9"
                alt="Modern apartment building exterior with glass balconies and contemporary architecture"
                className="w-full h-96 lg:h-[500px] object-cover" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-6 -left-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-xl z-20 hidden lg:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="CheckIcon" size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Bérleti díj beérkezett</div>
                  <div className="text-sm text-gray-500">150,000 Ft</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-xl z-20 hidden lg:block">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="DocumentTextIcon" size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Számla generálva</div>
                  <div className="text-sm text-gray-500">Automatikusan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;