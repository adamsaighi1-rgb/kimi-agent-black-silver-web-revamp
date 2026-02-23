import type { Locale } from '@/types/content';

type SeoType = 'website' | 'article';

export interface SeoConfig {
  title: string;
  description: string;
  locale: Locale;
  pathname: string;
  image?: string;
  siteName?: string;
  type?: SeoType;
  robots?: string;
  canonical?: string;
  alternates?: Partial<Record<Locale | 'x-default', string>>;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const LOCALE_QUERY_PARAM = 'lang';
const DEFAULT_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
const MANAGED_ATTR = 'data-seo-managed';
const MANAGED_VALUE = 'true';

const explicitSiteUrl = typeof import.meta.env.VITE_SITE_URL === 'string' ? import.meta.env.VITE_SITE_URL : '';

const ensureTrailingSlashRemoved = (value: string) => value.replace(/\/+$/, '');

const currentOrigin = () => {
  if (explicitSiteUrl.trim()) {
    return ensureTrailingSlashRemoved(explicitSiteUrl.trim());
  }

  if (typeof window !== 'undefined') {
    return ensureTrailingSlashRemoved(window.location.origin);
  }

  return '';
};

export const toAbsoluteUrl = (value: string | undefined | null) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const origin = currentOrigin();
  if (!origin) return value;

  return value.startsWith('/') ? `${origin}${value}` : `${origin}/${value}`;
};

export const localeToOgLocale = (locale: Locale) => {
  switch (locale) {
    case 'fr':
      return 'fr_FR';
    case 'ar':
      return 'ar_AE';
    default:
      return 'en_US';
  }
};

export const localeFromSearch = (search: string): Locale | null => {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const value = params.get(LOCALE_QUERY_PARAM);

  if (value === 'en' || value === 'fr' || value === 'ar') {
    return value;
  }

  return null;
};

export const buildLocaleUrl = (pathname: string, locale: Locale, includeDefaultLocaleParam = false) => {
  const origin = currentOrigin();
  const url = new URL(`${origin}${pathname || '/'}`);

  if (locale !== 'en' || includeDefaultLocaleParam) {
    url.searchParams.set(LOCALE_QUERY_PARAM, locale);
  } else {
    url.searchParams.delete(LOCALE_QUERY_PARAM);
  }

  return url.toString();
};

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const removeMeta = (attribute: 'name' | 'property', key: string) => {
  const element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (element) element.remove();
};

const upsertLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const clearManagedAlternates = () => {
  const elements = document.head.querySelectorAll(`link[rel="alternate"][${MANAGED_ATTR}="${MANAGED_VALUE}"]`);
  elements.forEach((element) => element.remove());
};

const upsertStructuredData = (value?: Record<string, unknown> | Array<Record<string, unknown>>) => {
  const existing = document.head.querySelectorAll(`script[type="application/ld+json"][${MANAGED_ATTR}="${MANAGED_VALUE}"]`);
  existing.forEach((script) => script.remove());

  if (!value) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute(MANAGED_ATTR, MANAGED_VALUE);

  const normalized = Array.isArray(value)
    ? {
        '@context': 'https://schema.org',
        '@graph': value.map((entry) => {
          if (entry['@context']) {
            const clone = { ...entry };
            delete clone['@context'];
            return clone;
          }

          return entry;
        }),
      }
    : value;

  script.textContent = JSON.stringify(normalized);
  document.head.appendChild(script);
};

export const applySeo = (config: SeoConfig) => {
  const canonical = config.canonical ?? buildLocaleUrl(config.pathname, config.locale);
  const image = toAbsoluteUrl(config.image);
  const robots = config.robots ?? DEFAULT_ROBOTS;
  const type = config.type ?? 'website';

  document.title = config.title;

  upsertMeta('name', 'description', config.description);
  upsertMeta('name', 'robots', robots);

  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:title', config.title);
  upsertMeta('property', 'og:description', config.description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:locale', localeToOgLocale(config.locale));
  upsertMeta('property', 'og:site_name', config.siteName ?? 'Robins Properties');

  upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  upsertMeta('name', 'twitter:title', config.title);
  upsertMeta('name', 'twitter:description', config.description);

  if (image) {
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:image', image);
  } else {
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');
  }

  upsertLink(`link[rel="canonical"]`, { rel: 'canonical', href: canonical });
  clearManagedAlternates();

  if (config.alternates) {
    Object.entries(config.alternates).forEach(([hreflang, href]) => {
      if (!href) return;
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      link.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
      document.head.appendChild(link);
    });
  }

  upsertStructuredData(config.structuredData);
};
