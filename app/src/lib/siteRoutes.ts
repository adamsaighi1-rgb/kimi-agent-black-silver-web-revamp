export const APP_ROUTES = {
  home: '/',
  sell: '/property-listing',
  agency: '/agency',
  blog: '/blog',
  contact: '/contact',
  propertyBase: '/property',
  propertyDetails: '/property/:propertyId',
} as const;

const INTERNAL_ROUTES = new Set<string>(Object.values(APP_ROUTES));

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/^\/+/, '')
    .replace(/[^a-z]/g, '');

const isBuyToken = (token: string) => token.includes('achat') || token.includes('acheter') || token.includes('buy');
const isRentToken = (token: string) => token.includes('lou') || token.includes('rent') || token.includes('rental');

const routeByToken = (token: string) => {
  if (!token) return null;
  if (token === 'home' || token === 'accueil') return APP_ROUTES.home;
  if (token.includes('vend') || token.includes('sell')) return APP_ROUTES.sell;

  // Legacy Buy/Rent intents now map to Sell-only experience.
  if (isBuyToken(token) || isRentToken(token)) return APP_ROUTES.sell;

  if (token.includes('agence') || token.includes('agency')) return APP_ROUTES.agency;
  if (token.includes('blog')) return APP_ROUTES.blog;
  if (token.includes('contact')) return APP_ROUTES.contact;

  return null;
};

export const isExternalHref = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);

export const isDeprecatedMarketLink = (href: string, label = '') => {
  const hrefToken = normalizeToken(href);
  const labelToken = normalizeToken(label);
  return isBuyToken(hrefToken) || isBuyToken(labelToken) || isRentToken(hrefToken) || isRentToken(labelToken);
};

export const resolveCmsHref = (href: string, label?: string) => {
  const trimmedHref = href.trim();

  if (!trimmedHref) return APP_ROUTES.home;
  if (isExternalHref(trimmedHref)) return trimmedHref;

  if (INTERNAL_ROUTES.has(trimmedHref)) return trimmedHref;

  if (trimmedHref.startsWith('#') || trimmedHref.startsWith('/')) {
    const routeFromHref = routeByToken(normalizeToken(trimmedHref));
    if (routeFromHref) return routeFromHref;
  }

  const routeFromLabel = routeByToken(normalizeToken(label ?? ''));
  if (routeFromLabel) return routeFromLabel;

  return trimmedHref;
};

export const propertyDetailsHref = (propertyId: string) => {
  return `${APP_ROUTES.propertyBase}/${encodeURIComponent(propertyId)}`;
};

export const isPropertyDetailsRoute = (href: string) => href.startsWith(`${APP_ROUTES.propertyBase}/`);

export const isAppRoute = (href: string) => INTERNAL_ROUTES.has(href) || isPropertyDetailsRoute(href);
