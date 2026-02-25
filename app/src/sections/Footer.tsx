import { useMemo, useRef } from 'react';
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from '@/context/LocaleContext';
import { formatPriceFromAed } from '@/lib/currency';
import { APP_ROUTES, isAppRoute, isDeprecatedMarketLink, propertyDetailsHref, resolveCmsHref } from '@/lib/siteRoutes';
import { uiCopy } from '@/lib/uiCopy';
import type { PropertyContent, SiteConfigContent } from '@/types/content';

interface FooterProps {
  config: SiteConfigContent;
  footerProperties: PropertyContent[];
}

const socialIconMap = {
  facebook: Facebook,
  whatsapp: MessageCircle,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
} as const;

const FooterLink = ({ href, label }: { href: string; label: string }) => {
  if (isAppRoute(href)) {
    return (
      <Link to={href} className="text-[#888888] hover:text-[#d4a853] transition-colors duration-300 inline-flex items-center gap-2 group">
        <span className="w-0 h-[1px] bg-[#d4a853] transition-all duration-300 group-hover:w-3" />
        {label}
      </Link>
    );
  }

  const isHttpLink = /^https?:/i.test(href);

  return (
    <a
      href={href}
      {...(isHttpLink ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="text-[#888888] hover:text-[#d4a853] transition-colors duration-300 inline-flex items-center gap-2 group"
    >
      <span className="w-0 h-[1px] bg-[#d4a853] transition-all duration-300 group-hover:w-3" />
      {label}
    </a>
  );
};

const Footer = ({ config, footerProperties }: FooterProps) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const copy = uiCopy[locale];

  const featuredProperties = useMemo(() => {
    return [...footerProperties].sort((a, b) => a.order - b.order).slice(0, 2);
  }, [footerProperties]);

  const displayQuickLinks = useMemo(() => {
    return config.quickLinks.filter((link) => !isDeprecatedMarketLink(link.href, link.label));
  }, [config.quickLinks]);

  const resolvedSocialLinks = useMemo(() => {
    return config.socialLinks
      .map((social) => ({
        ...social,
        resolvedHref: resolveCmsHref(social.href, social.label),
      }))
      .filter((social) => Boolean(social.resolvedHref));
  }, [config.socialLinks]);

  const addressLines = config.contactAddress.split('\n');

  return (
    <footer ref={footerRef} id="contact" className="relative bg-[#0a0a0a] pt-20 pb-8">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent" />

      <div className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="fade-up">
            <Link to={APP_ROUTES.home} className="flex items-center gap-1 mb-6">
              <span className="text-2xl font-bold tracking-wider">
                <span className="text-white">{config.brandMain}</span>
                <span className="text-[#d4a853]">{config.brandSuffix}</span>
              </span>
            </Link>
            <p className="text-[#888888] leading-relaxed mb-6">{config.footerDescription}</p>

            <div className="flex gap-3">
              {resolvedSocialLinks.map((social) => {
                const Icon = socialIconMap[social.platform as keyof typeof socialIconMap] ?? MessageCircle;
                const socialKey = `${social.platform}-${social.label}`;

                if (isAppRoute(social.resolvedHref)) {
                  return (
                    <Link
                      key={socialKey}
                      to={social.resolvedHref}
                      className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-[#888888] hover:bg-[#d4a853] hover:border-[#d4a853] hover:text-[#0a0a0a] transition-all duration-300 group"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                    </Link>
                  );
                }

                return (
                  <a
                    key={socialKey}
                    href={social.resolvedHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-[#888888] hover:bg-[#d4a853] hover:border-[#d4a853] hover:text-[#0a0a0a] transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: '100ms' }}>
            <h4 className="text-white font-bold mb-6">{config.quickLinksTitle}</h4>
            <ul className="space-y-3">
              {displayQuickLinks.map((link) => {
                const resolvedHref = resolveCmsHref(link.href, link.label);
                const displayLabel = resolvedHref === APP_ROUTES.sell ? copy.propertyListingLink : link.label;

                return (
                  <li key={`${link.label}-${link.href}`}>
                    <FooterLink href={resolvedHref} label={displayLabel} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="fade-up" style={{ animationDelay: '200ms' }}>
            <h4 className="text-white font-bold mb-6">{config.featuredFooterTitle}</h4>
            <div className="space-y-4">
              {featuredProperties.map((property) => {
                const formattedPrice = formatPriceFromAed({
                  amountAed: property.priceAed,
                  currency,
                  locale,
                  fallback: property.price || copy.onRequest,
                });

                return (
                  <Link key={property.seedKey} to={propertyDetailsHref(property.slug || property.seedKey)} className="flex gap-4 group">
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <h5 className="text-white text-sm font-medium group-hover:text-[#d4a853] transition-colors duration-300 line-clamp-1">{property.title}</h5>
                      <p className="text-[#d4a853] text-sm font-bold mt-1">{formattedPrice}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: '300ms' }}>
            <h4 className="text-white font-bold mb-6">{config.contactTitle}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4a853] flex-shrink-0 mt-0.5" />
                <span className="text-[#888888]">
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
              <li>
                <a href={`tel:${config.phone}`} className="flex items-center gap-3 text-[#888888] hover:text-[#d4a853] transition-colors duration-300">
                  <Phone className="w-5 h-5 text-[#d4a853]" />
                  {config.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${config.contactEmail}`}
                  className="flex items-center gap-3 text-[#888888] hover:text-[#d4a853] transition-colors duration-300"
                >
                  <Mail className="w-5 h-5 text-[#d4a853]" />
                  {config.contactEmail}
                </a>
              </li>
            </ul>

            <Link
              to={APP_ROUTES.contact}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#d4a853] text-[#0a0a0a] font-semibold rounded-sm hover:bg-[#b8923d] transition-all duration-300 group"
            >
              <span>{config.appointmentLabel}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-12 border border-[#333333]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-xl mb-2">{config.newsletterTitle}</h4>
              <p className="text-[#888888]">{config.newsletterText}</p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder={config.newsletterPlaceholder}
                className="px-4 py-3 bg-[#0a0a0a] border border-[#333333] rounded-lg text-white placeholder:text-[#555555] focus:border-[#d4a853] focus:outline-none transition-colors duration-300 w-64"
              />
              <button className="px-6 py-3 bg-[#d4a853] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#b8923d] transition-colors duration-300">
                {config.newsletterButtonLabel}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#333333]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-[#888888] text-sm">{config.rightsText}</p>
            <div className="flex gap-6">
              {config.legalLinks.map((link) => {
                const resolvedHref = resolveCmsHref(link.href, link.label);

                if (isAppRoute(resolvedHref)) {
                  return (
                    <Link
                      key={`${link.label}-${link.href}`}
                      to={resolvedHref}
                      className="text-[#888888] text-sm hover:text-[#d4a853] transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={resolvedHref}
                    className="text-[#888888] text-sm hover:text-[#d4a853] transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#d4a853] text-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg hover:bg-[#b8923d] transition-all duration-300 hover:scale-110 z-50"
        aria-label={config.backToTopLabel}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;



