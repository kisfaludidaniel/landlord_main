import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterSectionProps {
  className?: string;
}

const FooterSection = ({ className = '' }: FooterSectionProps) => {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = [
    {
      title: 'Platform',
      links: [
        { label: 'Funkciók', href: '#features' },
        { label: 'Árazás', href: '#pricing' },
        { label: 'Vélemények', href: '#testimonials' },
        { label: 'Gyakori kérdések', href: '#faq' }
      ]
    },
    {
      title: 'Támogatás',
      links: [
        { label: 'Súgó központ', href: '/help' },
        { label: 'Kapcsolat', href: '/contact' },
        { label: 'Dokumentáció', href: '/docs' },
        { label: 'Státusz', href: '/status' }
      ]
    },
    {
      title: 'Jogi',
      links: [
        { label: 'Adatvédelmi szabályzat', href: '/privacy' },
        { label: 'Felhasználási feltételek', href: '/terms' },
        { label: 'Cookie szabályzat', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' }
      ]
    },
    {
      title: 'Vállalat',
      links: [
        { label: 'Rólunk', href: '/about' },
        { label: 'Karrier', href: '/careers' },
        { label: 'Sajtó', href: '/press' },
        { label: 'Partnerek', href: '/partners' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'ShareIcon', href: 'https://facebook.com' },
    { name: 'Twitter', icon: 'ShareIcon', href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'ShareIcon', href: 'https://linkedin.com' },
    { name: 'Instagram', icon: 'ShareIcon', href: 'https://instagram.com' }
  ];

  return (
    <footer className={`bg-secondary text-secondary-foreground ${className}`}>
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link to="/marketing-homepage" className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Icon name="HomeIcon" size={20} className="text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">
                Micro-Landlord OS Lite
              </span>
            </Link>
            
            <p className="text-secondary-foreground/80 mb-6 max-w-sm">
              Professzionális ingatlan kezelési platform magyar tulajdonosoknak. 
              Automatizálja folyamatait és növelje bevételeit.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-foreground/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200"
                  aria-label={social.name}
                >
                  <Icon name={social.icon as any} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-secondary-foreground/20 pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="font-semibold mb-4">Iratkozzon fel hírlevelünkre</h3>
            <p className="text-secondary-foreground/80 mb-6 text-sm">
              Legyen naprakész a legújabb funkciókkal és ingatlan kezelési tippekkel.
            </p>
            <div className="flex space-x-4">
              <input
                type="email"
                placeholder="Email cím"
                className="flex-1 px-4 py-3 bg-secondary-foreground/10 border border-secondary-foreground/20 rounded-lg text-secondary-foreground placeholder-secondary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200">
                Feliratkozás
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-secondary-foreground/80 text-sm">
              © {currentYear} Micro-Landlord OS Lite. Minden jog fenntartva.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200"
              >
                Adatvédelem
              </Link>
              <Link
                to="/terms"
                className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200"
              >
                Feltételek
              </Link>
              <Link
                to="/cookies"
                className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors duration-200"
              >
                Sütik
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;