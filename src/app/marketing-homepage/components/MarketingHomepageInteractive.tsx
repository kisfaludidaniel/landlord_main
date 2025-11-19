'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import PricingPreview from './PricingPreview';
import TestimonialsSection from './TestimonialsSection';
import FooterSection from './FooterSection';

interface MarketingHomepageInteractiveProps {
  className?: string;
}

const MarketingHomepageInteractive = ({ className = '' }: MarketingHomepageInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        {/* Static content that matches server render */}
        <HeroSection />
        <FeaturesSection />
        <PricingPreview />
        <TestimonialsSection />
        <FooterSection />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <HeroSection />
      <FeaturesSection />
      <PricingPreview />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
};

export default MarketingHomepageInteractive;