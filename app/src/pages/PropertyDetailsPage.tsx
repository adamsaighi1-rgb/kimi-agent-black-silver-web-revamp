import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bath, Bed, Calendar, MapPin, Maximize } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useSeo } from '@/hooks/useSeo';
import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from '@/context/LocaleContext';
import { formatPriceFromAed } from '@/lib/currency';
import { buildLocaleUrl, toAbsoluteUrl } from '@/lib/seo';
import { APP_ROUTES, propertyDetailsHref } from '@/lib/siteRoutes';
import { mapFirstPropertyFromResponse } from '@/lib/contentMapper';
import { fetchPropertyByIdentifier, STRAPI_BASE_URL } from '@/lib/strapi';
import type { PropertyContent, SiteConfigContent } from '@/types/content';

interface PropertyDetailsPageProps {
  properties: PropertyContent[];
  config: SiteConfigContent;
}

const copy = {
  en: {
    back: 'Back to listings',
    location: 'Location',
    details: 'Property Details',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    area: 'Area',
    status: 'Status',
    type: 'Type',
    developer: 'Developer',
    completion: 'Completion',
    description: 'Description',
    amenities: 'Amenities',
    map: 'Open in Maps',
    mapSection: 'Map Location',
    mapUnavailable: 'Map coordinates are not available for this property.',
    source: 'View Source',
    contact: 'Contact Agent',
    related: 'Related Properties',
    notFoundTitle: 'Property not found',
    notFoundBody: 'The requested property is not available in this locale.',
    browseAll: 'Browse all properties',
    noDescription: 'Detailed description will be available soon.',
    onRequest: 'On request',
    unknown: 'N/A',
    yes: 'Yes',
    no: 'No',
    projectInsights: 'Project Intelligence',
    projectFacts: 'Project Facts',
    investmentTerms: 'Investment Terms',
    inventoryMix: 'Unit Mix',
    bedroomMix: 'Bedrooms',
    fromSize: 'From Size',
    totalUnits: 'Total Units',
    masterPlan: 'Master Plan',
    reellyNotAvailable: 'Additional project details are not available yet.',
    launchDate: 'Launch Date',
    constructionStart: 'Construction Start',
    readiness: 'Readiness',
    furnishing: 'Furnishing',
    serviceCharge: 'Service Charge',
    totalArea: 'Total Area',
    floors: 'Floors',
    maxFloor: 'Max Floor',
    parkingLots: 'Parking Lots',
    unitTypes: 'Unit Types',
    projectClass: 'Project Class',
    saleStatus: 'Sale Status',
    escrow: 'Escrow Account',
    postHandover: 'Post-Handover Plan',
    brandedProject: 'Branded Project',
    chessboard: 'Chessboard Eligible',
    partnerProject: 'Partner Project',
    deposit: 'Deposit Terms',
    resale: 'Resale Conditions',
    managingCompany: 'Managing Company',
    developerDescription: 'Developer Description',
    broker: 'Broker',
    brokerDescription: 'Broker Description',
    website: 'Website',
    brochures: 'Brochures & Documents',
    download: 'Download',
    paymentPlans: 'Payment Plans',
    units: 'Available Units',
    unitName: 'Unit',
    unitPrice: 'Price',
    unitSize: 'Size',
    unitStatus: 'Status',
    loadingTitle: 'Loading property...',
    loadingBody: 'Please wait while we load full property details.',
    seoFallback: (location: string) => `Off-plan property in ${location}.`,
    studio: 'Studio',
    bedroomShort: 'BR',
    areaUnitSqFt: 'sq.ft.',
    brochureFallback: 'Brochure',
  },
  fr: {
    back: 'Retour aux biens',
    location: 'Emplacement',
    details: 'Details du bien',
    bedrooms: 'Chambres',
    bathrooms: 'Salles de bain',
    area: 'Surface',
    status: 'Statut',
    type: 'Type',
    developer: 'Promoteur',
    completion: 'Livraison',
    description: 'Description',
    amenities: 'Equipements',
    map: 'Ouvrir dans Maps',
    mapSection: 'Localisation',
    mapUnavailable: 'Les coordonnees de cette propriete ne sont pas disponibles.',
    source: 'Voir la source',
    contact: 'Contacter l\'agent',
    related: 'Biens similaires',
    notFoundTitle: 'Bien introuvable',
    notFoundBody: 'Le bien demande n\'est pas disponible dans cette langue.',
    browseAll: 'Voir tous les biens',
    noDescription: 'La description detaillee sera disponible prochainement.',
    onRequest: 'Sur demande',
    unknown: 'N/A',
    yes: 'Oui',
    no: 'Non',
    projectInsights: 'Informations du projet',
    projectFacts: 'Faits du projet',
    investmentTerms: 'Conditions d\'investissement',
    inventoryMix: 'Mix des unites',
    bedroomMix: 'Chambres',
    fromSize: 'Surface a partir de',
    totalUnits: 'Nombre d\'unites',
    masterPlan: 'Plan directeur',
    reellyNotAvailable: 'Details supplementaires indisponibles pour le moment.',
    launchDate: 'Date de lancement',
    constructionStart: 'Debut de construction',
    readiness: 'Progression',
    furnishing: 'Ameublement',
    serviceCharge: 'Frais de service',
    totalArea: 'Surface totale',
    floors: 'Etages',
    maxFloor: 'Etage maximum',
    parkingLots: 'Places de parking',
    unitTypes: 'Types d\'unites',
    projectClass: 'Classe du projet',
    saleStatus: 'Statut de vente',
    escrow: 'Compte sequestre',
    postHandover: 'Plan post-livraison',
    brandedProject: 'Projet de marque',
    chessboard: 'Eligible Chessboard',
    partnerProject: 'Projet partenaire',
    deposit: 'Conditions de depot',
    resale: 'Conditions de revente',
    managingCompany: 'Societe de gestion',
    developerDescription: 'Description du promoteur',
    broker: 'Courtier',
    brokerDescription: 'Description du courtier',
    website: 'Site web',
    brochures: 'Brochures et documents',
    download: 'Telecharger',
    paymentPlans: 'Plans de paiement',
    units: 'Unites disponibles',
    unitName: 'Unite',
    unitPrice: 'Prix',
    unitSize: 'Surface',
    unitStatus: 'Statut',
    loadingTitle: 'Chargement du bien...',
    loadingBody: 'Veuillez patienter pendant le chargement des details complets.',
    seoFallback: (location: string) => `Bien off-plan a ${location}.`,
    studio: 'Studio',
    bedroomShort: 'ch.',
    areaUnitSqFt: 'pi2',
    brochureFallback: 'Brochure',
  },
  ar: {
    back: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    location: '\u0627\u0644\u0645\u0648\u0642\u0639',
    details: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0639\u0642\u0627\u0631',
    bedrooms: '\u063a\u0631\u0641 \u0627\u0644\u0646\u0648\u0645',
    bathrooms: '\u0627\u0644\u062d\u0645\u0627\u0645\u0627\u062a',
    area: '\u0627\u0644\u0645\u0633\u0627\u062d\u0629',
    status: '\u0627\u0644\u062d\u0627\u0644\u0629',
    type: '\u0627\u0644\u0646\u0648\u0639',
    developer: '\u0627\u0644\u0645\u0637\u0648\u0631',
    completion: '\u0627\u0644\u062a\u0633\u0644\u064a\u0645',
    description: '\u0627\u0644\u0648\u0635\u0641',
    amenities: '\u0627\u0644\u0645\u0631\u0627\u0641\u0642',
    map: '\u0641\u062a\u062d \u0641\u064a \u0627\u0644\u062e\u0631\u0627\u0626\u0637',
    mapSection: '\u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u0642\u0627\u0631 \u0639\u0644\u0649 \u0627\u0644\u062e\u0631\u064a\u0637\u0629',
    mapUnavailable: '\u0625\u062d\u062f\u0627\u062b\u064a\u0627\u062a \u0627\u0644\u062e\u0631\u064a\u0637\u0629 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u0627\u0631.',
    source: '\u0639\u0631\u0636 \u0627\u0644\u0645\u0635\u062f\u0631',
    contact: '\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062a\u0634\u0627\u0631',
    related: '\u0639\u0642\u0627\u0631\u0627\u062a \u0645\u0634\u0627\u0628\u0647\u0629',
    notFoundTitle: '\u0627\u0644\u0639\u0642\u0627\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f',
    notFoundBody: '\u0627\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u0641\u064a \u0647\u0630\u0647 \u0627\u0644\u0644\u063a\u0629.',
    browseAll: '\u0639\u0631\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    noDescription: '\u0633\u064a\u062a\u0645 \u0625\u0636\u0627\u0641\u0629 \u0648\u0635\u0641 \u062a\u0641\u0635\u064a\u0644\u064a \u0642\u0631\u064a\u0628\u0627\u064b.',
    onRequest: '\u0639\u0646\u062f \u0627\u0644\u0637\u0644\u0628',
    unknown: '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631',
    yes: '\u0646\u0639\u0645',
    no: '\u0644\u0627',
    projectInsights: '\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0634\u0631\u0648\u0639',
    projectFacts: '\u062d\u0642\u0627\u0626\u0642 \u0627\u0644\u0645\u0634\u0631\u0648\u0639',
    investmentTerms: '\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631',
    inventoryMix: '\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0648\u062d\u062f\u0627\u062a',
    bedroomMix: '\u063a\u0631\u0641 \u0627\u0644\u0646\u0648\u0645',
    fromSize: '\u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0645\u0646',
    totalUnits: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0648\u062d\u062f\u0627\u062a',
    masterPlan: '\u0627\u0644\u0645\u062e\u0637\u0637 \u0627\u0644\u0639\u0627\u0645',
    reellyNotAvailable: '\u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0625\u0636\u0627\u0641\u064a\u0629 \u0644\u0644\u0645\u0634\u0631\u0648\u0639 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629 \u062d\u0627\u0644\u064a\u0627\u064b.',
    launchDate: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0637\u0644\u0627\u0642',
    constructionStart: '\u0628\u062f\u0621 \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
    readiness: '\u0646\u0633\u0628\u0629 \u0627\u0644\u0625\u0646\u062c\u0627\u0632',
    furnishing: '\u0627\u0644\u062a\u0623\u062b\u064a\u062b',
    serviceCharge: '\u0631\u0633\u0648\u0645 \u0627\u0644\u062e\u062f\u0645\u0629',
    totalArea: '\u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629',
    floors: '\u0639\u062f\u062f \u0627\u0644\u0637\u0648\u0627\u0628\u0642',
    maxFloor: '\u0623\u0639\u0644\u0649 \u0637\u0627\u0628\u0642',
    parkingLots: '\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a',
    unitTypes: '\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0648\u062d\u062f\u0627\u062a',
    projectClass: '\u0641\u0626\u0629 \u0627\u0644\u0645\u0634\u0631\u0648\u0639',
    saleStatus: '\u062d\u0627\u0644\u0629 \u0627\u0644\u0628\u064a\u0639',
    escrow: '\u062d\u0633\u0627\u0628 \u0627\u0644\u0636\u0645\u0627\u0646',
    postHandover: '\u062e\u0637\u0629 \u0645\u0627 \u0628\u0639\u062f \u0627\u0644\u062a\u0633\u0644\u064a\u0645',
    brandedProject: '\u0645\u0634\u0631\u0648\u0639 \u0628\u0639\u0644\u0627\u0645\u0629 \u062a\u062c\u0627\u0631\u064a\u0629',
    chessboard: '\u0645\u0624\u0647\u0644 Chessboard',
    partnerProject: '\u0645\u0634\u0631\u0648\u0639 \u0634\u0631\u064a\u0643',
    deposit: '\u0634\u0631\u0648\u0637 \u0627\u0644\u062f\u0641\u0639\u0629 \u0627\u0644\u0623\u0648\u0644\u0649',
    resale: '\u0634\u0631\u0648\u0637 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0628\u064a\u0639',
    managingCompany: '\u0634\u0631\u0643\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629',
    developerDescription: '\u0648\u0635\u0641 \u0627\u0644\u0645\u0637\u0648\u0631',
    broker: '\u0627\u0644\u0648\u0633\u064a\u0637',
    brokerDescription: '\u0648\u0635\u0641 \u0627\u0644\u0648\u0633\u064a\u0637',
    website: '\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    brochures: '\u0627\u0644\u0643\u062a\u064a\u0628\u0627\u062a \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062a',
    download: '\u062a\u0646\u0632\u064a\u0644',
    paymentPlans: '\u062e\u0637\u0637 \u0627\u0644\u062f\u0641\u0639',
    units: '\u0627\u0644\u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629',
    unitName: '\u0627\u0644\u0648\u062d\u062f\u0629',
    unitPrice: '\u0627\u0644\u0633\u0639\u0631',
    unitSize: '\u0627\u0644\u0645\u0633\u0627\u062d\u0629',
    unitStatus: '\u0627\u0644\u062d\u0627\u0644\u0629',
    loadingTitle: '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0639\u0642\u0627\u0631...',
    loadingBody: '\u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631 \u062d\u062a\u0649 \u064a\u062a\u0645 \u062a\u062d\u0645\u064a\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0643\u0627\u0645\u0644\u0629.',
    seoFallback: (location: string) => `\u0639\u0642\u0627\u0631 \u0642\u064a\u062f \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0641\u064a ${location}.`,
    studio: '\u0627\u0633\u062a\u0648\u062f\u064a\u0648',
    bedroomShort: '\u063a\u0631\u0641',
    areaUnitSqFt: '\u0642\u062f\u0645\u00b2',
    brochureFallback: '\u0643\u062a\u064a\u0628',
  },
} as const;

const formatDate = (value: string | null | undefined, locale: 'en' | 'fr' | 'ar') => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const localeMap = {
    en: 'en-US',
    fr: 'fr-FR',
    ar: 'ar-AE',
  } as const;

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const numberOrFallback = (value: number | null | undefined, fallback: string) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return String(value);
};

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
};

const normalizeSiteName = (config: SiteConfigContent) => {
  const brandMain = config.brandMain?.trim() ?? '';
  const brandSubtext = config.brandSubtext?.trim() ?? '';
  return `${brandMain} ${brandSubtext}`.trim() || 'Robins Properties';
};

const parseAreaSqft = (area: string) => {
  const match = area.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
};

const formatNumber = (value: number | null | undefined, locale: 'en' | 'fr' | 'ar') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;

  return new Intl.NumberFormat(
    locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-AE' : 'en-US'
  ).format(Math.round(value));
};


const humanizeValue = (value: string | undefined) => {
  if (!value) return undefined;

  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


const PropertyDetailsPage = ({ properties, config }: PropertyDetailsPageProps) => {
  const { propertyId } = useParams();
  const decodedId = propertyId ? decodeURIComponent(propertyId) : '';
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const t = copy[locale];

  const siteName = normalizeSiteName(config);
  const initialProperty = useMemo(
    () => properties.find((item) => item.seedKey === decodedId || item.slug === decodedId),
    [properties, decodedId]
  );
  const [resolvedProperty, setResolvedProperty] = useState<PropertyContent | null>(initialProperty ?? null);
  const [isPropertyLoading, setIsPropertyLoading] = useState(false);
  const property = resolvedProperty ?? initialProperty ?? null;

  const requestedPath = property
    ? propertyDetailsHref(property.slug || property.seedKey)
    : decodedId
      ? propertyDetailsHref(decodedId)
      : APP_ROUTES.sell;

  const primaryImage = property?.imageLarge || property?.image || '';
  const galleryImages = property?.galleryImages && property.galleryImages.length > 0 ? property.galleryImages : primaryImage ? [primaryImage] : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setResolvedProperty(initialProperty ?? null);
  }, [initialProperty]);

  useEffect(() => {
    if (!decodedId) {
      setResolvedProperty(null);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadPropertyDetails = async () => {
      setIsPropertyLoading(true);

      try {
        const response = await fetchPropertyByIdentifier(locale, decodedId, controller.signal);

        if (!active) return;

        const mapped = mapFirstPropertyFromResponse(response, STRAPI_BASE_URL);
        if (mapped) {
          setResolvedProperty(mapped);
        } else if (!initialProperty) {
          setResolvedProperty(null);
        }
      } catch {
        if (active && !initialProperty) {
          setResolvedProperty(null);
        }
      } finally {
        if (active) {
          setIsPropertyLoading(false);
        }
      }
    };

    void loadPropertyDetails();

    return () => {
      active = false;
      controller.abort();
    };
  }, [decodedId, locale, initialProperty]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property?.seedKey]);

  const activeImage = galleryImages[activeImageIndex] || primaryImage;

  const seoConfig = useMemo(() => {
    const alternates = {
      en: buildLocaleUrl(requestedPath, 'en'),
      fr: buildLocaleUrl(requestedPath, 'fr'),
      ar: buildLocaleUrl(requestedPath, 'ar'),
      'x-default': buildLocaleUrl(requestedPath, 'en'),
    };
    if (!property) {
      return {
        title: `${t.notFoundTitle} | ${siteName}`,
        description: t.notFoundBody,
        locale,
        pathname: requestedPath,
        canonical: buildLocaleUrl(requestedPath, locale),
        siteName,
        alternates,
        robots: 'noindex,follow',
      };
    }

    const seoDescription = truncateText(
      property.description?.trim() || t.seoFallback(property.location),
      170
    );

    const canonical = buildLocaleUrl(requestedPath, locale);
    const hasCoordinates = typeof property.latitude === 'number' && typeof property.longitude === 'number';
    const imageUrl = toAbsoluteUrl(property.imageLarge || property.image);

    const offerSchema: Record<string, unknown> = {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'AED',
    };

    if (typeof property.priceAed === 'number' && Number.isFinite(property.priceAed) && property.priceAed > 0) {
      offerSchema.price = Math.round(property.priceAed);
    }

    const residenceSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Residence',
      name: property.title,
      description: seoDescription,
      url: canonical,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location || 'Dubai',
        addressCountry: 'AE',
      },
      offers: offerSchema,
      inLanguage: locale,
    };

    if (imageUrl) {
      residenceSchema.image = [imageUrl];
    }

    if (property.beds > 0) {
      residenceSchema.numberOfRooms = property.beds;
    }

    const areaSqft = parseAreaSqft(property.area);
    if (areaSqft) {
      residenceSchema.floorSize = {
        '@type': 'QuantitativeValue',
        value: areaSqft,
        unitText: 'sq ft',
      };
    }

    if (hasCoordinates) {
      residenceSchema.geo = {
        '@type': 'GeoCoordinates',
        latitude: property.latitude,
        longitude: property.longitude,
      };
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: siteName,
          item: buildLocaleUrl(APP_ROUTES.home, locale),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t.browseAll,
          item: buildLocaleUrl(APP_ROUTES.sell, locale),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: property.title,
          item: canonical,
        },
      ],
    };

    return {
      title: `${property.title} | ${siteName}`,
      description: seoDescription,
      locale,
      pathname: requestedPath,
      image: property.imageLarge || property.image,
      siteName,
      type: 'article' as const,
      canonical,
      alternates,
      structuredData: [residenceSchema, breadcrumbSchema],
    };
  }, [locale, property, requestedPath, siteName, t.browseAll, t.notFoundBody, t.notFoundTitle]);

  useSeo(seoConfig);

  if (!property && isPropertyLoading) {
    return (
      <section className="pt-32 pb-24 section-padding min-h-[70vh] flex items-center">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t.loadingTitle}</h1>
          <p className="text-[#888888]">{t.loadingBody}</p>
        </div>
      </section>
    );
  }

  if (!property) {
    return (
      <section className="pt-32 pb-24 section-padding min-h-[70vh] flex items-center">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{t.notFoundTitle}</h1>
          <p className="text-[#888888] mb-8">{t.notFoundBody}</p>
          <Link to={APP_ROUTES.sell} className="btn-gold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t.browseAll}</span>
          </Link>
        </div>
      </section>
    );
  }

  const formattedPrice = formatPriceFromAed({
    amountAed: property.priceAed,
    currency,
    locale,
    fallback: property.price || t.onRequest,
  });

  const completionDate = formatDate(property.completionDate, locale);

  const detailsRows = [
    { label: t.bedrooms, value: numberOrFallback(property.beds, t.unknown), icon: Bed },
    { label: t.bathrooms, value: numberOrFallback(property.baths, t.unknown), icon: Bath },
    { label: t.area, value: property.area || t.unknown, icon: Maximize },
    { label: t.status, value: property.statusLabel || t.unknown, icon: Calendar },
  ];

  const reellyDetails = property.reellyDetails;

  const boolLabel = (value: boolean | undefined) => {
    if (value === undefined) return undefined;
    return value ? t.yes : t.no;
  };

  const projectFactRows = [
    { label: t.launchDate, value: formatDate(reellyDetails?.launchDate, locale) },
    { label: t.constructionStart, value: formatDate(reellyDetails?.constructionStartDate, locale) },
    {
      label: t.readiness,
      value:
        typeof reellyDetails?.readinessProgress === 'number' && Number.isFinite(reellyDetails.readinessProgress)
          ? `${Math.round(reellyDetails.readinessProgress)}%`
          : undefined,
    },
    { label: t.furnishing, value: humanizeValue(reellyDetails?.furnishing) },
    { label: t.serviceCharge, value: reellyDetails?.serviceCharge },
    {
      label: t.totalArea,
      value:
        reellyDetails?.totalAreaSqFt != null
          ? `${formatNumber(reellyDetails.totalAreaSqFt, locale)} ${t.areaUnitSqFt}`
          : undefined,
    },
    { label: t.floors, value: formatNumber(reellyDetails?.floors, locale) },
    { label: t.maxFloor, value: formatNumber(reellyDetails?.maxFloor, locale) },
    { label: t.parkingLots, value: formatNumber(reellyDetails?.totalParkingLots, locale) },
    { label: t.unitTypes, value: reellyDetails?.unitTypes },
    { label: t.projectClass, value: humanizeValue(reellyDetails?.projectClass) },
    { label: t.saleStatus, value: humanizeValue(reellyDetails?.saleStatus) },
  ].filter((row) => row.value && row.value.trim().length > 0);

  const investmentRows = [
    { label: t.escrow, value: boolLabel(reellyDetails?.hasEscrow) },
    { label: t.postHandover, value: boolLabel(reellyDetails?.postHandover) },
    { label: t.brandedProject, value: boolLabel(reellyDetails?.isBrandedProject) },
    { label: t.chessboard, value: boolLabel(reellyDetails?.hasChessboard) },
    { label: t.partnerProject, value: boolLabel(reellyDetails?.isPartnerProject) },
    { label: t.deposit, value: reellyDetails?.depositDescription },
    { label: t.resale, value: reellyDetails?.resaleConditions },
    { label: t.managingCompany, value: reellyDetails?.managingCompany },
  ].filter((row) => row.value && row.value.trim().length > 0);
  const brochureFiles = reellyDetails?.brochures ?? [];
  const paymentPlans = reellyDetails?.paymentPlans ?? [];
  const unitRows = reellyDetails?.units ?? [];

  const relatedProperties = properties
    .filter((item) => item.seedKey !== property.seedKey)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  const hasCoordinates = typeof property.latitude === 'number' && typeof property.longitude === 'number';
  const mapsHref = hasCoordinates ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}` : null;
  const mapEmbedSrc = hasCoordinates
    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`
    : null;

  const description = property.description?.trim() || t.noDescription;

  return (
    <section className="pt-28 pb-20 section-padding">
      <Link to={APP_ROUTES.sell} className="inline-flex items-center gap-2 text-[#d4a853] hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>{t.back}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="rounded-2xl overflow-hidden border border-[#333333] bg-[#121212]">
          <img src={activeImage || primaryImage} alt={property.title} className="w-full h-[420px] object-cover" loading="eager" decoding="async" fetchPriority="high" />

          {galleryImages.length > 1 ? (
            <div className="p-4 border-t border-[#2a2a2a] bg-[#0f0f0f]">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={`${property.seedKey}-gallery-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg border transition-colors ${
                      activeImageIndex === index ? 'border-[#d4a853]' : 'border-[#333333] hover:border-[#666666]'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-16 object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = primaryImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-[#121212] border border-[#333333] rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-[#d4a853] text-[#0a0a0a] text-xs font-bold rounded-full">{property.typeLabel}</span>
            <span className="px-3 py-1 bg-[#2d2d2d] text-white text-xs font-medium rounded-full">{property.statusLabel}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{property.title}</h1>

          <div className="flex items-center gap-2 text-[#888888] mb-5">
            <MapPin className="w-4 h-4" />
            <span>{property.location || t.unknown}</span>
          </div>

          <div className="mb-6">
            {property.pricePrefix ? <p className="text-[#888888] text-sm">{property.pricePrefix}</p> : null}
            <p className="text-3xl font-bold text-[#d4a853]">
              {formattedPrice}
              {property.priceSuffix ? <span className="text-base text-[#888888] ml-2">{property.priceSuffix}</span> : null}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {detailsRows.map((item) => (
              <div key={item.label} className="rounded-lg border border-[#333333] bg-[#0f0f0f] px-4 py-3">
                <div className="flex items-center gap-2 text-[#888888] text-xs uppercase tracking-wide mb-1">
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
                <p className="text-white font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm text-[#bbbbbb] mb-6">
            <p>
              <span className="text-[#888888]">{t.type}: </span>
              <span className="text-white">{property.typeLabel || t.unknown}</span>
            </p>
            <p>
              <span className="text-[#888888]">{t.developer}: </span>
              <span className="text-white">{property.developerName || property.agent?.name || t.unknown}</span>
            </p>
            <p>
              <span className="text-[#888888]">{t.completion}: </span>
              <span className="text-white">{completionDate || t.unknown}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={`tel:${config.phone}`} className="btn-gold inline-flex items-center gap-2">
              <span>{t.contact}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border border-[#333333] text-white/80 hover:text-[#d4a853] hover:border-[#d4a853] transition-colors inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {t.map}
              </a>
            ) : null}


          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.description}</h2>
          <p className="text-[#b0b0b0] leading-relaxed whitespace-pre-line">{description}</p>
        </div>

        <div className="rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.amenities}</h2>
          {property.amenityDetails && property.amenityDetails.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenityDetails.map((amenity, index) => {
                const amenityImage = amenity.iconUrl || amenity.iconLocalPath || primaryImage;

                return (
                  <li
                    key={`${amenity.name}-${index}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a]"
                  >
                    <img
                      src={amenityImage}
                      alt={amenity.name}
                      loading="lazy"
                      className="w-9 h-9 rounded-md object-cover border border-[#333333] bg-[#1a1a1a]"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = primaryImage;
                      }}
                    />
                    <span className="text-[#d6d6d6] text-sm">{amenity.name}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[#888888]">{t.unknown}</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.projectInsights}</h2>

          {projectFactRows.length > 0 ? (
            <dl className="space-y-2">
              {projectFactRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 border-b border-[#2a2a2a] pb-2">
                  <dt className="text-[#888888] text-sm">{row.label}</dt>
                  <dd className="text-white text-sm font-medium text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[#888888]">{t.reellyNotAvailable}</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.investmentTerms}</h2>

          {investmentRows.length > 0 ? (
            <dl className="space-y-2">
              {investmentRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 border-b border-[#2a2a2a] pb-2">
                  <dt className="text-[#888888] text-sm">{row.label}</dt>
                  <dd className="text-white text-sm font-medium text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[#888888]">{t.reellyNotAvailable}</p>
          )}
        </div>
      </div>

      <div className="mt-8 defer-render">
        <div className="rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t.masterPlan}</h2>

          {reellyDetails?.generalPlanUrl ? (
            <img
              src={reellyDetails.generalPlanUrl}
              alt={`${property.title} master plan`}
              className="w-full h-[340px] object-cover rounded-xl border border-[#2f2f2f]"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = primaryImage;
              }}
            />
          ) : (
            <p className="text-[#888888] mb-4">{t.reellyNotAvailable}</p>
          )}

          {reellyDetails?.developerDescription || reellyDetails?.developerLogoUrl ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#d4a853] mb-2">{t.developerDescription}</h3>

              {reellyDetails?.developerLogoUrl ? (
                <img
                  src={reellyDetails.developerLogoUrl}
                  alt={`${property.developerName || property.title} logo`}
                  className="w-24 h-24 object-contain rounded-lg border border-[#2f2f2f] bg-[#0f0f0f] p-2 mb-2"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}

              {reellyDetails?.developerDescription ? (
                <p className="text-sm text-[#b5b5b5] leading-relaxed">{reellyDetails.developerDescription}</p>
              ) : null}
            </div>
          ) : null}

          {reellyDetails?.brokerName || reellyDetails?.brokerDescription || reellyDetails?.brokerWebsite || reellyDetails?.brokerLogoUrl ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#d4a853] mb-2">
                {t.broker}: {reellyDetails?.brokerName || t.unknown}
              </h3>

              {reellyDetails?.brokerLogoUrl ? (
                <img
                  src={reellyDetails.brokerLogoUrl}
                  alt={`${reellyDetails?.brokerName || 'Broker'} logo`}
                  className="w-24 h-24 object-contain rounded-lg border border-[#2f2f2f] bg-[#0f0f0f] p-2 mb-2"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}

              {reellyDetails?.brokerDescription ? (
                <p className="text-sm text-[#b5b5b5] leading-relaxed mb-1">{reellyDetails.brokerDescription}</p>
              ) : null}

              {reellyDetails?.brokerWebsite ? (
                <a
                  href={reellyDetails.brokerWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#d4a853] hover:text-white transition-colors"
                >
                  {t.website}
                </a>
              ) : null}
            </div>
          ) : null}

          {brochureFiles.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#d4a853] mb-2">{t.brochures}</h3>
              <div className="space-y-2">
                {brochureFiles.map((file, index) => (
                  <a
                    key={`${file.url}-${index}`}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-[#d4a853] hover:text-white transition-colors"
                  >
                    {t.download}: {file.name || `${t.brochureFallback} ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8 defer-render">
        <h2 className="text-2xl font-bold text-white mb-4">{t.paymentPlans}</h2>
        {paymentPlans.length > 0 ? (
          <div className="space-y-4">
            {paymentPlans.map((plan, index) => (
              <div key={`${plan.name}-${index}`} className="rounded-xl border border-[#2c2c2c] bg-[#0f0f0f] p-4">
                <h3 className="text-lg font-semibold text-[#d4a853] mb-3">{plan.name}</h3>
                <div className="space-y-2">
                  {plan.steps.map((step, stepIndex) => (
                    <div key={`${plan.name}-step-${stepIndex}`} className="border-b border-[#242424] pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-white">{step.name}</p>
                        <p className="text-sm text-[#d4a853]">
                          {typeof step.percentage === 'number' ? `${step.percentage}%` : t.unknown}
                        </p>
                      </div>
                      {step.children.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {step.children.map((child, childIndex) => (
                            <li key={`${plan.name}-step-${stepIndex}-child-${childIndex}`} className="text-xs text-[#9a9a9a]">
                              {child.name}
                              {typeof child.percentage === 'number' ? ` - ${child.percentage}%` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#888888]">{t.reellyNotAvailable}</p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8 defer-render">
        <h2 className="text-2xl font-bold text-white mb-4">{t.units}</h2>
        {unitRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left border-b border-[#333333] text-[#8f8f8f]">
                  <th className="py-2 pr-4 font-medium">{t.unitName}</th>
                  <th className="py-2 pr-4 font-medium">{t.unitPrice}</th>
                  <th className="py-2 pr-4 font-medium">{t.unitSize}</th>
                  <th className="py-2 font-medium">{t.unitStatus}</th>
                </tr>
              </thead>
              <tbody>
                {unitRows.map((unit, index) => (
                  <tr key={`${unit.name}-${index}`} className="border-b border-[#242424] text-[#d5d5d5] align-top">
                    <td className="py-2 pr-4">
                      <div className="flex items-start gap-2">
                        {unit.layoutImages && unit.layoutImages.length > 0 ? (
                          <img
                            src={unit.layoutImages[0]}
                            alt={`${unit.name} layout`}
                            className="w-14 h-14 rounded-md object-cover border border-[#2f2f2f]"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div>
                          <p className="text-white">{unit.name}</p>
                          {typeof unit.bedrooms === 'number' ? (
                            <p className="text-xs text-[#8f8f8f]">{unit.bedrooms} {t.bedroomShort}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {formatPriceFromAed({
                        amountAed: unit.priceAed,
                        currency,
                        locale,
                        fallback: t.unknown,
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {typeof unit.sizeSqFt === 'number' && Number.isFinite(unit.sizeSqFt)
                        ? `${formatNumber(unit.sizeSqFt, locale)} ${t.areaUnitSqFt}`
                        : t.unknown}
                    </td>
                    <td className="py-2">{unit.status ? humanizeValue(unit.status) : t.unknown}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#888888]">{t.reellyNotAvailable}</p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-[#333333] bg-[#121212] p-6 md:p-8 defer-render">
        <h2 className="text-2xl font-bold text-white mb-4">{t.mapSection}</h2>
        {mapEmbedSrc ? (
          <div className="w-full overflow-hidden rounded-xl border border-[#2d2d2d]">
            <iframe
              title={`${property.title} map`}
              src={mapEmbedSrc}
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <p className="text-[#888888]">{t.mapUnavailable}</p>
        )}
      </div>

      {relatedProperties.length > 0 ? (
        <div className="mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{t.related}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedProperties.map((item) => (
              <Link
                key={item.seedKey}
                to={propertyDetailsHref(item.slug || item.seedKey)}
                className="group rounded-xl overflow-hidden border border-[#333333] bg-[#121212] hover:border-[#d4a853]/70 transition-colors"
              >
                <div className="h-44 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 group-hover:text-[#d4a853] transition-colors">{item.title}</h3>
                  <p className="text-[#888888] text-sm mb-2">{item.location}</p>
                  <p className="text-[#d4a853] font-bold">
                    {formatPriceFromAed({
                      amountAed: item.priceAed,
                      currency,
                      locale,
                      fallback: item.price || t.onRequest,
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default PropertyDetailsPage;

























