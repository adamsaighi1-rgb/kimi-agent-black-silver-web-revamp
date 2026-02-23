import { useMemo } from 'react';

import { useSeo } from '@/hooks/useSeo';
import { APP_ROUTES } from '@/lib/siteRoutes';
import { buildLocaleUrl } from '@/lib/seo';
import type { Locale, PageContent } from '@/types/content';

interface SeoControllerProps {
  pathname: string;
  locale: Locale;
  content: PageContent | null;
}

const SEO_COPY: Record<
  Locale,
  Record<
    | 'homeTitle'
    | 'homeDescription'
    | 'listingTitle'
    | 'listingDescription'
    | 'agencyTitle'
    | 'agencyDescription'
    | 'blogTitle'
    | 'blogDescription'
    | 'contactTitle'
    | 'contactDescription'
    | 'defaultTitle'
    | 'defaultDescription',
    string
  >
> = {
  en: {
    homeTitle: 'Off-Plan Properties in Dubai | Robins Properties',
    homeDescription: 'Discover curated off-plan property opportunities in Dubai with localized listings, neighborhood insights, and expert support.',
    listingTitle: 'Property Listing | Off-Plan Projects in Dubai',
    listingDescription: 'Browse the latest off-plan property listings in Dubai with filters for type, bedrooms, area, and price.',
    agencyTitle: 'Agency Team | Robins Properties',
    agencyDescription: 'Meet the Robins Properties team and connect with multilingual advisors specialized in Dubai off-plan real estate.',
    blogTitle: 'Dubai Property Blog | Robins Properties',
    blogDescription: 'Read market updates, off-plan investment tips, and Dubai real estate insights from Robins Properties.',
    contactTitle: 'Contact Robins Properties',
    contactDescription: 'Contact Robins Properties for expert guidance on off-plan property investments in Dubai.',
    defaultTitle: 'Robins Properties | Dubai Real Estate',
    defaultDescription: 'Robins Properties helps international buyers discover off-plan property opportunities in Dubai.',
  },
  fr: {
    homeTitle: 'Biens off-plan a Dubai | Robins Properties',
    homeDescription: 'Decouvrez une selection de biens off-plan a Dubai avec contenus localises, quartiers et accompagnement expert.',
    listingTitle: 'Liste des biens | Projets off-plan a Dubai',
    listingDescription: 'Parcourez les biens off-plan a Dubai avec des filtres par type, chambres, secteur et budget.',
    agencyTitle: 'Equipe agence | Robins Properties',
    agencyDescription: 'Rencontrez l equipe Robins Properties et nos conseillers multilingues specialises a Dubai.',
    blogTitle: 'Blog immobilier Dubai | Robins Properties',
    blogDescription: 'Actualites du marche, conseils d investissement et analyses immobilieres de Dubai.',
    contactTitle: 'Contacter Robins Properties',
    contactDescription: 'Contactez Robins Properties pour votre projet d investissement off-plan a Dubai.',
    defaultTitle: 'Robins Properties | Immobilier a Dubai',
    defaultDescription: 'Robins Properties accompagne les acheteurs internationaux sur l immobilier off-plan a Dubai.',
  },
  ar: {
    homeTitle: '\u0639\u0642\u0627\u0631\u0627\u062a \u0623\u0648\u0641 \u0628\u0644\u0627\u0646 \u0641\u064a \u062f\u0628\u064a | Robins Properties',
    homeDescription: '\u0627\u0643\u062a\u0634\u0641 \u0641\u0631\u0635 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a \u0623\u0648\u0641 \u0628\u0644\u0627\u0646 \u0641\u064a \u062f\u0628\u064a \u0645\u0639 \u0645\u062d\u062a\u0648\u0649 \u0645\u062d\u0644\u064a \u0648\u062f\u0639\u0645 \u0627\u0633\u062a\u0634\u0627\u0631\u064a.',
    listingTitle: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a | \u0645\u0634\u0627\u0631\u064a\u0639 \u0623\u0648\u0641 \u0628\u0644\u0627\u0646 \u0641\u064a \u062f\u0628\u064a',
    listingDescription: '\u062a\u0635\u0641\u062d \u0623\u062d\u062f\u062b \u0642\u0627\u0626\u0645\u0629 \u0639\u0642\u0627\u0631\u0627\u062a \u0623\u0648\u0641 \u0628\u0644\u0627\u0646 \u0641\u064a \u062f\u0628\u064a \u0645\u0639 \u0641\u0644\u0627\u062a\u0631 \u0630\u0643\u064a\u0629 \u0644\u0644\u0628\u062d\u062b.',
    agencyTitle: '\u0641\u0631\u064a\u0642 \u0627\u0644\u0648\u0643\u0627\u0644\u0629 | Robins Properties',
    agencyDescription: '\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0641\u0631\u064a\u0642 Robins Properties \u0627\u0644\u0645\u062a\u062e\u0635\u0635 \u0641\u064a \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a \u0628\u062f\u0628\u064a.',
    blogTitle: '\u0645\u062f\u0648\u0646\u0629 \u0639\u0642\u0627\u0631\u0627\u062a \u062f\u0628\u064a | Robins Properties',
    blogDescription: '\u062a\u0627\u0628\u0639 \u0622\u062e\u0631 \u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u0633\u0648\u0642 \u0648\u0646\u0635\u0627\u0626\u062d \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0641\u064a \u0639\u0642\u0627\u0631\u0627\u062a \u062f\u0628\u064a.',
    contactTitle: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 Robins Properties',
    contactDescription: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0641\u0631\u064a\u0642 Robins Properties \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0639\u0642\u0627\u0631\u064a\u0629 \u0641\u064a \u062f\u0628\u064a.',
    defaultTitle: 'Robins Properties | \u0639\u0642\u0627\u0631\u0627\u062a \u062f\u0628\u064a',
    defaultDescription: '\u062a\u0633\u0627\u0639\u062f Robins Properties \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0639\u0644\u0649 \u0627\u0643\u062a\u0634\u0627\u0641 \u0639\u0642\u0627\u0631\u0627\u062a \u0623\u0648\u0641 \u0628\u0644\u0627\u0646 \u0641\u064a \u062f\u0628\u064a.',
  },
};

const normalizeSiteName = (content: PageContent | null) => {
  if (!content) return 'Robins Properties';

  const brandMain = content.siteConfig.brandMain?.trim() ?? '';
  const brandSubtext = content.siteConfig.brandSubtext?.trim() ?? '';

  return `${brandMain} ${brandSubtext}`.trim() || 'Robins Properties';
};

const pageTypeByPath = (pathname: string) => {
  if (pathname === APP_ROUTES.home) return 'home' as const;
  if (pathname === APP_ROUTES.sell) return 'listing' as const;
  if (pathname === APP_ROUTES.agency) return 'agency' as const;
  if (pathname === APP_ROUTES.blog) return 'blog' as const;
  if (pathname === APP_ROUTES.contact) return 'contact' as const;
  if (pathname.startsWith(`${APP_ROUTES.propertyBase}/`)) return 'property' as const;
  return 'default' as const;
};

const SeoController = ({ pathname, locale, content }: SeoControllerProps) => {
  const copy = SEO_COPY[locale];

  const seoConfig = useMemo(() => {
    const siteName = normalizeSiteName(content);
    const pageType = pageTypeByPath(pathname);
    const heroImage = content?.homePage.heroBackground || '/hero-bg.jpg';

    const alternateUrls = {
      en: buildLocaleUrl(pathname, 'en'),
      fr: buildLocaleUrl(pathname, 'fr'),
      ar: buildLocaleUrl(pathname, 'ar'),
      'x-default': buildLocaleUrl(pathname, 'en'),
    };

    const pageTitleByType = {
      home: copy.homeTitle,
      listing: copy.listingTitle,
      agency: copy.agencyTitle,
      blog: copy.blogTitle,
      contact: copy.contactTitle,
      property: `${copy.listingTitle} | ${siteName}`,
      default: copy.defaultTitle,
    } as const;

    const pageDescriptionByType = {
      home: copy.homeDescription,
      listing: copy.listingDescription,
      agency: copy.agencyDescription,
      blog: copy.blogDescription,
      contact: copy.contactDescription,
      property: copy.listingDescription,
      default: copy.defaultDescription,
    } as const;

    const pageTitle = pageTitleByType[pageType];
    const pageDescription = pageDescriptionByType[pageType];

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: siteName,
      url: buildLocaleUrl(APP_ROUTES.home, 'en'),
      telephone: content?.siteConfig.phoneDisplay,
      email: content?.siteConfig.contactEmail,
      address: content?.siteConfig.contactAddress
        ? {
            '@type': 'PostalAddress',
            streetAddress: content.siteConfig.contactAddress,
            addressLocality: 'Dubai',
            addressCountry: 'AE',
          }
        : undefined,
      areaServed: 'Dubai',
      availableLanguage: ['en', 'fr', 'ar'],
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: buildLocaleUrl(APP_ROUTES.home, 'en'),
      inLanguage: ['en', 'fr', 'ar'],
    };

    const pageSchema = {
      '@context': 'https://schema.org',
      '@type': pageType === 'blog' ? 'Blog' : pageType === 'listing' ? 'CollectionPage' : 'WebPage',
      name: pageTitle,
      description: pageDescription,
      url: buildLocaleUrl(pathname, locale),
      inLanguage: locale,
      about: 'Off-plan property in Dubai',
    };

    const structuredData = pageType === 'property' ? [organizationSchema] : [organizationSchema, websiteSchema, pageSchema];

    return {
      title: pageTitle,
      description: pageDescription,
      locale,
      pathname,
      image: heroImage,
      siteName,
      canonical: buildLocaleUrl(pathname, locale),
      alternates: alternateUrls,
      structuredData,
    };
  }, [content, copy, locale, pathname]);

  useSeo(seoConfig);

  return null;
};

export default SeoController;

