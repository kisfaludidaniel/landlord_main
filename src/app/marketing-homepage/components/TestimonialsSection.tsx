import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Kovács Péter',
    role: 'Ingatlan tulajdonos',
    company: '8 lakás Budapesten',
    content: 'A Micro-Landlord OS Lite teljesen megváltoztatta az ingatlan kezelési folyamataimat. A bérleti díj beszedés automatizálása óriási időmegtakarítást jelentett.',
    avatar: "https://images.unsplash.com/photo-1579263614019-128d502ef81f",
    rating: 5
  },
  {
    id: '2',
    name: 'Nagy Eszter',
    role: 'Ingatlan befektető',
    company: '12 ingatlan portfólió',
    content: 'Végre egy magyar nyelvű platform ami megérti a helyi igényeket. A számlázási funkció tökéletesen működik a magyar adójognak megfelelően.',
    avatar: "https://images.unsplash.com/photo-1584006927168-d929412759f3",
    rating: 5
  },
  {
    id: '3',
    name: 'Szabó Gábor',
    role: 'Ingatlan kezelő',
    company: 'Családi vállalkozás',
    content: 'A karbantartási kérések kezelése sokkal egyszerűbb lett. A bérlők közvetlenül a rendszeren keresztül jelzik a problémákat, minden dokumentálva van.',
    avatar: "https://images.unsplash.com/photo-1588880461826-1d91740ea8d2",
    rating: 5
  }];


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) =>
    <Icon
      key={index}
      name="StarIcon"
      size={16}
      className={index < rating ? 'text-warning' : 'text-muted'} />

    );
  };

  return (
    <section id="testimonials" className={`py-16 lg:py-24 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Mit mondanak{' '}
            <span className="text-primary">ügyfeleink</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Több mint 500 elégedett tulajdonos használja már a platformunkat napi szinten.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) =>
          <div
            key={testimonial.id}
            className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300">

              {/* Rating */}
              <div className="flex items-center mb-6">
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <blockquote className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <AppImage
                  src={testimonial.avatar}
                  alt={`Professional headshot of ${testimonial.name}, ${testimonial.role}`}
                  className="w-full h-full object-cover" />

                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
            {testimonials.map((testimonial) =>
            <div
              key={testimonial.id}
              className="bg-card border border-border rounded-xl p-6 min-w-[300px] flex-shrink-0">

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground leading-relaxed mb-6 text-sm">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <AppImage
                    src={testimonial.avatar}
                    alt={`Professional headshot of ${testimonial.name}, ${testimonial.role}`}
                    className="w-full h-full object-cover" />

                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Aktív felhasználó</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">2,000+</div>
                <div className="text-sm text-muted-foreground">Kezelt ingatlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">50M+</div>
                <div className="text-sm text-muted-foreground">Ft feldolgozott bevétel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Ügyfél elégedettség</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default TestimonialsSection;