import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import { PRICING_PLANS, formatPrice, formatPropertyLimit, formatAiStatus } from '@/config/plans';

interface PricingPreviewProps {
  className?: string;
}

const PricingPreview = ({ className = '' }: PricingPreviewProps) => {
  return (
    <section id="pricing" className={`py-16 lg:py-24 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Válassza ki a{' '}
            <span className="text-primary">megfelelő csomagot</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rugalmas árazás minden méretű ingatlan portfólióhoz. Kezdje ingyen, frissítsen amikor szüksége van rá.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.id === 'starter' ?'border-primary shadow-lg scale-105' :'border-border hover:border-primary/50'
              }`}
            >
              {plan.id === 'starter' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Legnépszerűbb
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(plan.price).replace(' Ft', '')}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    Ft/hó
                  </span>
                </div>
              </div>

              {/* Plan Details */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ingatlanok:</span>
                  <span className="font-medium">{formatPropertyLimit(plan.propertyLimit)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AI funkciók:</span>
                  <span className="font-medium">{formatAiStatus(plan.aiEnabled)}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Icon
                      name="CheckIcon"
                      size={20}
                      className="text-success mr-3 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/role-selection?planId=${plan.id}`}
                className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-lg font-semibold transition-colors duration-200 ${
                  plan.id === 'starter' ?'bg-primary text-primary-foreground hover:bg-primary/90' :'bg-card text-card-foreground border-2 border-border hover:bg-muted'
                }`}
              >
                {plan.id === 'free' ? 'Kezdés ingyen' : 'Váltok erre'}
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card border-2 rounded-2xl p-6 min-w-[280px] flex-shrink-0 ${
                  plan.id === 'starter' ?'border-primary shadow-lg' :'border-border'
                }`}
              >
                {plan.id === 'starter' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Legnépszerűbb
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(plan.price).replace(' Ft', '')}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Ft/hó
                    </span>
                  </div>
                </div>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ingatlanok:</span>
                    <span className="font-medium">{formatPropertyLimit(plan.propertyLimit)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI:</span>
                    <span className="font-medium">{formatAiStatus(plan.aiEnabled)}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Icon
                        name="CheckIcon"
                        size={16}
                        className="text-success mr-2 mt-1 flex-shrink-0"
                      />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/role-selection?planId=${plan.id}`}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    plan.id === 'starter' ?'bg-primary text-primary-foreground hover:bg-primary/90' :'bg-card text-card-foreground border-2 border-border hover:bg-muted'
                  }`}
                >
                  {plan.id === 'free' ? 'Kezdés ingyen' : 'Váltok erre'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Kérdései vannak az árazással kapcsolatban?
          </p>
          <Link
            to="/role-selection"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            Vegye fel velünk a kapcsolatot
            <Icon name="ArrowRightIcon" size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;