import type {
  BlogPostContent,
  FaqCategoryContent,
  HomePageContent,
  NeighborhoodContent,
  PageContent,
  PropertyContent,
  SiteConfigContent,
} from '@/types/content';
import type {
  BlogPostResponse,
  FaqCategoryResponse,
  HomePageResponse,
  NeighborhoodResponse,
  PropertyResponse,
  SiteConfigResponse,
} from '@/lib/strapi';

const asObject = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
};

const unwrapEntity = (value: unknown): Record<string, unknown> => {
  const objectValue = asObject(value);
  const data = objectValue.data;
  const attributes = objectValue.attributes;

  if (data && typeof data === 'object') {
    return unwrapEntity(data);
  }

  if (attributes && typeof attributes === 'object') {
    return {
      ...asObject(attributes),
      ...objectValue,
    };
  }

  return objectValue;
};

const unwrapArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const objectValue = asObject(value);

  if (Array.isArray(objectValue.data)) {
    return objectValue.data;
  }

  return [];
};

const stringValue = (value: unknown, fallback = '') => {
  return typeof value === 'string' ? value : fallback;
};

const numberValue = (value: unknown, fallback = 0) => {
  return typeof value === 'number' ? value : fallback;
};

const booleanValue = (value: unknown, fallback = false) => {
  return typeof value === 'boolean' ? value : fallback;
};

const optionalNumberValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const optionalBooleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  return undefined;
};

const optionalTextValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapWorkingHours = (value: unknown) => {
  const items = unwrapArray(value)
    .map((item) => {
      const entry = asObject(item);
      const day = optionalTextValue(entry.day) ?? optionalTextValue(entry.days);
      const time = optionalTextValue(entry.time) ?? optionalTextValue(entry.time_range);

      if (!day || !time) {
        return null;
      }

      return { day, time };
    })
    .filter((entry): entry is { day: string; time: string } => !!entry);

  return items.length > 0 ? items : undefined;
};

const mapOffice = (value: unknown) => {
  const office = asObject(value);
  const address = optionalTextValue(office.address);
  const city = optionalTextValue(office.city);
  const region = optionalTextValue(office.region);
  const country = optionalTextValue(office.country);
  const email = optionalTextValue(office.email);
  const workingHours = mapWorkingHours(office.working_hours);

  if (!address && !city && !region && !country && !email && !workingHours) {
    return undefined;
  }

  return {
    address,
    city,
    region,
    country,
    email,
    workingHours,
  };
};

const mapInventories = (value: unknown) => {
  const rows = unwrapArray(value)
    .map((item) => {
      const entry = asObject(item);
      const bedroomsValue = optionalNumberValue(entry.bedrooms);
      const bedroomsLabel = bedroomsValue === 0
        ? '0'
        : bedroomsValue !== null
          ? String(Math.round(bedroomsValue))
          : optionalTextValue(entry.bedrooms);

      if (!bedroomsLabel) {
        return null;
      }

      return {
        bedrooms: bedroomsLabel,
        fromSizeSqFt: optionalNumberValue(entry.from_size),
        totalUnits: optionalNumberValue(entry.total_units),
      };
    })
    .filter(
      (entry): entry is { bedrooms: string; fromSizeSqFt: number | null; totalUnits: number | null } => !!entry
    );

  return rows.length > 0 ? rows : undefined;
};

const mapSourceMediaFiles = (value: unknown) => {
  const mediaObject = asObject(value);

  const rows = unwrapArray(mediaObject.files)
    .map((item) => {
      const entity = asObject(item);
      const url = optionalTextValue(entity.file);

      if (!url) {
        return null;
      }

      const mime = optionalTextValue(entity.file_type);
      const baseFile = {
        url,
        name: optionalTextValue(entity.name) ?? 'Brochure',
      };

      return mime ? { ...baseFile, mime } : baseFile;
    })
    .filter((entry) => entry !== null) as Array<{ url: string; name: string; mime?: string }>;

  return rows.length > 0 ? rows : undefined;
};

const mapPaymentPlans = (value: unknown) => {
  const plans = unwrapArray(value)
    .map((item) => {
      const entity = asObject(item);
      const name = optionalTextValue(entity.name);

      if (!name) {
        return null;
      }

      const steps = unwrapArray(entity.steps)
        .map((stepItem) => {
          const step = asObject(stepItem);
          const stepName = optionalTextValue(step.name);

          if (!stepName) {
            return null;
          }

          const children = unwrapArray(step.children)
            .map((childItem) => {
              const child = asObject(childItem);
              const childName = optionalTextValue(child.name);

              if (!childName) {
                return null;
              }

              return {
                name: childName,
                percentage: optionalNumberValue(child.percentage),
                fixedAmount: optionalNumberValue(child.fixed_amount),
              };
            })
            .filter((child) => child !== null) as Array<{
            name: string;
            percentage: number | null;
            fixedAmount: number | null;
          }>;

          return {
            name: stepName,
            percentage: optionalNumberValue(step.percentage),
            fixedAmount: optionalNumberValue(step.fixed_amount),
            stageType: optionalTextValue(step.stage_type),
            children,
          };
        })
        .filter((step) => step !== null) as Array<{
        name: string;
        percentage: number | null;
        fixedAmount: number | null;
        stageType?: string;
        children: Array<{ name: string; percentage: number | null; fixedAmount: number | null }>;
      }>;

      return {
        name,
        hasPostHandover: optionalBooleanValue(entity.has_post_handover),
        steps,
      };
    })
    .filter((entry) => entry !== null) as Array<{
    name: string;
    hasPostHandover?: boolean;
    steps: Array<{
      name: string;
      percentage: number | null;
      fixedAmount: number | null;
      stageType?: string;
      children: Array<{ name: string; percentage: number | null; fixedAmount: number | null }>;
    }>;
  }>;

  return plans.length > 0 ? plans : undefined;
};

const mapUnits = (value: unknown, strapiBaseUrl: string) => {
  const units = unwrapArray(value)
    .map((item) => {
      const entity = asObject(item);
      const name = optionalTextValue(entity.name);

      if (!name) {
        return null;
      }

      const layoutObject = asObject(entity.layout);
      const layoutImages = unwrapArray(layoutObject.images)
        .map((imageEntry) => {
          const imageObject = asObject(imageEntry);
          return mediaUrl(imageObject.image, strapiBaseUrl, '', ['small', 'thumbnail', 'medium']);
        })
        .filter((url): url is string => typeof url === 'string' && url.length > 0);

      return {
        name,
        priceAed: optionalNumberValue(entity.price),
        sizeSqFt: optionalNumberValue(entity.size),
        bedrooms: optionalNumberValue(entity.bedrooms),
        status: optionalTextValue(entity.status),
        unitType: optionalTextValue(entity.unit_type),
        layoutType: optionalTextValue(entity.layout_type),
        pricePerArea: optionalNumberValue(entity.price_per_area),
        layoutImages: layoutImages.length > 0 ? layoutImages : undefined,
      };
    })
    .filter((entry) => entry !== null) as Array<{
    name: string;
    priceAed: number | null;
    sizeSqFt: number | null;
    bedrooms: number | null;
    status?: string;
    unitType?: string;
    layoutType?: string;
    pricePerArea: number | null;
    layoutImages?: string[];
  }>;

  return units.length > 0 ? units : undefined;
};

const parsePriceNumber = (value: string) => {
  const compact = value.trim().toUpperCase().replace(/\s+/g, '');
  const match = compact.match(/([0-9][0-9.,]*)([KMB])?/);

  if (!match) return null;

  const numberPart = match[1];
  const suffix = match[2] ?? '';

  let normalized = numberPart;
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf('.') > normalized.lastIndexOf(',')) {
      normalized = normalized.replace(/,/g, '');
    } else {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    const commaCount = (normalized.match(/,/g) ?? []).length;
    if (commaCount > 1) {
      normalized = normalized.replace(/,/g, '');
    } else {
      const decimalPart = normalized.split(',')[1] ?? '';
      normalized = decimalPart.length === 3 ? normalized.replace(',', '') : normalized.replace(',', '.');
    }
  } else if (hasDot) {
    const dotCount = (normalized.match(/\./g) ?? []).length;
    if (dotCount > 1) {
      normalized = normalized.replace(/\./g, '');
    }
  }

  const base = Number(normalized);
  if (!Number.isFinite(base) || base <= 0) return null;

  const multiplier = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : 1;

  return base * multiplier;
};

const resolvePriceAed = (entity: Record<string, unknown>) => {
  const sourceData = asObject(entity.sourceData);

  if (typeof sourceData.min_price === 'number' && Number.isFinite(sourceData.min_price) && sourceData.min_price > 0) {
    return sourceData.min_price;
  }

  return parsePriceNumber(stringValue(entity.price));
};

type MediaFormatName = 'thumbnail' | 'small' | 'medium' | 'large';

const toAbsoluteMediaUrl = (url: string, strapiBaseUrl: string) => {
  return url.startsWith('http') ? url : `${strapiBaseUrl}${url}`;
};

const mediaUrl = (
  value: unknown,
  strapiBaseUrl: string,
  fallback: string,
  preferredFormats: MediaFormatName[] = []
) => {
  const entity = unwrapEntity(value);
  const formats = asObject(entity.formats);

  for (const formatName of preferredFormats) {
    const format = asObject(formats[formatName]);
    const formatUrl = format.url;

    if (typeof formatUrl === 'string' && formatUrl.length > 0) {
      return toAbsoluteMediaUrl(formatUrl, strapiBaseUrl);
    }
  }

  const directUrl = entity.url;

  if (typeof directUrl === 'string' && directUrl.length > 0) {
    return toAbsoluteMediaUrl(directUrl, strapiBaseUrl);
  }

  return fallback;
};

const mediaUrls = (value: unknown, strapiBaseUrl: string, preferredFormats: MediaFormatName[] = []) => {
  return unwrapArray(value)
    .map((item) => mediaUrl(item, strapiBaseUrl, '', preferredFormats))
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
};
const mediaFiles = (value: unknown, strapiBaseUrl: string) => {
  const files = unwrapArray(value)
    .map((item) => {
      const entity = unwrapEntity(item);
      const url = mediaUrl(entity, strapiBaseUrl, '');

      if (!url) {
        return null;
      }

      const mime = optionalTextValue(entity.mime);
      const baseFile = {
        url,
        name: stringValue(entity.name, 'Brochure'),
      };

      return mime ? { ...baseFile, mime } : baseFile;
    })
    .filter((entry) => entry !== null) as Array<{ url: string; name: string; mime?: string }>;

  return files;
};

const normalizeUrlKey = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? url.toLowerCase();
  }
};

const dedupeUrls = (urls: string[]) => {
  const uniqueByKey = new Map<string, string>();

  urls.forEach((url) => {
    const key = normalizeUrlKey(url);

    if (!uniqueByKey.has(key)) {
      uniqueByKey.set(key, url);
    }
  });

  return [...uniqueByKey.values()];
};

const isLikelyProjectImageUrl = (url: string, sourceId: number | null) => {
  const normalized = url.toLowerCase();

  if (normalized.includes('/amenity_icons/')) {
    return false;
  }

  if (normalized.includes('/unit_layouts/')) {
    return true;
  }

  if (!normalized.includes('/projects/') || !normalized.includes('/images/')) {
    return false;
  }

  if (sourceId === null) {
    return true;
  }

  return normalized.includes(`/projects/${sourceId}/`);
};

const collectProjectImageUrls = (value: unknown, sourceId: number | null) => {
  const urlsByKey = new Map<string, string>();

  const addUrl = (input: unknown) => {
    if (typeof input !== 'string' || input.length === 0) {
      return;
    }

    if (!isLikelyProjectImageUrl(input, sourceId)) {
      return;
    }

    const key = normalizeUrlKey(input);

    if (!urlsByKey.has(key)) {
      urlsByKey.set(key, input);
    }
  };

  const source = asObject(value);
  const mediaObject = asObject(source.reellyMedia ?? source.media);

  unwrapArray(mediaObject.images).forEach((entry) => {
    addUrl(asObject(entry).url);
  });

  const unitsValue = source.reellyUnits ?? source.units ?? source.units_details ?? source.units_catalog;

  unwrapArray(unitsValue).forEach((unitEntry) => {
    const layout = asObject(asObject(unitEntry).layout);

    unwrapArray(layout.images).forEach((layoutEntry) => {
      addUrl(asObject(asObject(layoutEntry).image).url);
    });
  });

  if (urlsByKey.size === 0) {
    const walk = (node: unknown) => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      const objectNode = asObject(node);

      Object.entries(objectNode).forEach(([key, child]) => {
        if (key === 'url' && typeof child === 'string') {
          addUrl(child);
          return;
        }

        if (child && typeof child === 'object') {
          walk(child);
        }
      });
    };

    walk(value);
  }

  return [...urlsByKey.values()];
};
const normalizeLinks = (value: unknown) => {
  return unwrapArray(value).map((item) => {
    const entity = unwrapEntity(item);
    return {
      label: stringValue(entity.label),
      href: stringValue(entity.href, '#'),
    };
  });
};

const normalizeSocialLinks = (value: unknown) => {
  return unwrapArray(value).map((item) => {
    const entity = unwrapEntity(item);
    return {
      label: stringValue(entity.label),
      href: stringValue(entity.href, '#'),
      platform: stringValue(entity.platform, 'link'),
    };
  });
};

const normalizeSearchFilters = (value: unknown) => {
  return unwrapArray(value).map((item) => {
    const entity = unwrapEntity(item);
    const optionsRaw = entity.options;

    return {
      key: stringValue(entity.key),
      label: stringValue(entity.label),
      icon: stringValue(entity.icon),
      options: Array.isArray(optionsRaw) ? optionsRaw.filter((option): option is string => typeof option === 'string') : [],
    };
  });
};

const normalizeStats = (value: unknown) => {
  return unwrapArray(value).map((item) => {
    const entity = unwrapEntity(item);
    return {
      value: stringValue(entity.value),
      label: stringValue(entity.label),
    };
  });
};

const normalizeMediaLogos = (value: unknown) => {
  return unwrapArray(value).map((item) => {
    const entity = unwrapEntity(item);
    return {
      name: stringValue(entity.name),
      widthClass: stringValue(entity.widthClass, 'w-20'),
    };
  });
};

const fallbackSiteConfig: SiteConfigContent = {
  brandMain: 'ROBINS',
  brandSuffix: '.',
  brandSubtext: 'Properties',
  phone: '+971555097657',
  phoneDisplay: '+971 55 509 7657',
  headerCtaLabel: 'Contact Us',
  headerCtaHref: '/contact',
  navLinks: [
    { label: 'HOME', href: '#' },
    { label: 'PROPERTY LISTING', href: '#vendre' },
    { label: 'CONTACT', href: '#contact' },
  ],
  socialLinks: [],
  footerDescription: '',
  quickLinksTitle: 'Quick Links',
  quickLinks: [],
  featuredFooterTitle: 'Featured Projects',
  contactTitle: 'Contact',
  contactAddress: '',
  contactEmail: 'contact@robinsproperties.com',
  appointmentLabel: 'Book an appointment',
  newsletterTitle: '',
  newsletterText: '',
  newsletterPlaceholder: 'Your email',
  newsletterButtonLabel: 'Subscribe',
  rightsText: '',
  legalLinks: [],
  backToTopLabel: 'Back to top',
  loadingText: 'Loading',
};

const fallbackHomePage: HomePageContent = {
  heroTitleLine1: 'ROBINS PROPERTIES',
  heroTitleHighlight: 'DUBAI',
  heroSubtitle: '',
  heroBackground: '/hero-bg.jpg',
  mediaMentionsLabel: 'Featured in:',
  mediaLogos: [],
  scrollLabel: 'Scroll',
  searchTabs: [
    { id: 'sales', label: 'Sales' },
  ],
  searchFilters: [],
  searchButtonLabel: 'Search Properties',
  offPlanLabel: 'Off-Plan Projects',
  offPlanTitle: 'Top off-plan opportunities in Dubai',
  offPlanTitleHighlight: 'by Robins Properties',
  offPlanFilterChips: [],
  offPlanViewAllLabel: 'View All Properties',
  aboutLabel: 'Robins Properties',
  aboutTitle: 'Trusted guidance,',
  aboutTitleHighlight: 'real results',
  aboutLead: '',
  aboutBody: '',
  aboutFeatures: [],
  aboutAdditionalText: '',
  aboutCtaLabel: 'Talk to our advisors',
  aboutImage: '/team-photo.jpg',
  aboutImageAlt: 'Robins Properties Team',
  aboutStats: [],
  featuredPropertiesLabel: 'Selected by Robins',
  featuredPropertiesTitle: 'Project of the',
  featuredPropertiesTitleHighlight: 'month',
  featuredBadgeLabel: 'Featured',
  featuredBannerLabel: 'Featured Property',
  featuredBannerTitle: 'Attractive Private Pool',
  featuredBannerTitleHighlight: 'Penthouse',
  featuredBannerDescription: '',
  featuredBannerCtaLabel: 'Discover More',
  featuredBannerImage: '/featured-property.jpg',
  featuredBannerAgent: { name: 'Robins Advisory Team', title: 'Property Consultant' },
  featuredBannerStats: [],
  neighborhoodsLabel: 'Where to invest in Dubai',
  neighborhoodsTitle: 'Top neighborhoods',
  neighborhoodsTitleHighlight: 'for off-plan investment',
  neighborhoodsAreaLabel: 'Investment Area',
  neighborhoodsListingsLabel: 'Listings',
  neighborhoodsViewAllLabel: 'Explore all neighborhoods',
  blogLabel: 'Dubai Real Estate News',
  blogTitle: 'Tips',
  blogTitleHighlight: '& Insights',
  blogViewAllLabel: 'View All Articles',
  blogReadMoreLabel: 'Read More',
  faqLabel: 'Complete FAQ',
  faqTitle: 'For',
  faqTitleHighlight: 'Robins clients',
  faqDescription: '',
  faqContactQuestion: '',
  faqContactHelp: '',
  faqContactButton: 'Contact us',
  propertyViewDetailsLabel: 'View Details',
  featuredBannerDiscoverLabel: 'Discover More',
};

const mapSiteConfig = (response: SiteConfigResponse): SiteConfigContent => {
  const entity = unwrapEntity(response.data);

  return {
    ...fallbackSiteConfig,
    brandMain: stringValue(entity.brandMain, fallbackSiteConfig.brandMain),
    brandSuffix: stringValue(entity.brandSuffix, fallbackSiteConfig.brandSuffix),
    brandSubtext: stringValue(entity.brandSubtext, fallbackSiteConfig.brandSubtext),
    phone: stringValue(entity.phone, fallbackSiteConfig.phone),
    phoneDisplay: stringValue(entity.phoneDisplay, fallbackSiteConfig.phoneDisplay),
    headerCtaLabel: stringValue(entity.headerCtaLabel, fallbackSiteConfig.headerCtaLabel),
    headerCtaHref: stringValue(entity.headerCtaHref, fallbackSiteConfig.headerCtaHref),
    navLinks: normalizeLinks(entity.navLinks),
    socialLinks: normalizeSocialLinks(entity.socialLinks),
    footerDescription: stringValue(entity.footerDescription, fallbackSiteConfig.footerDescription),
    quickLinksTitle: stringValue(entity.quickLinksTitle, fallbackSiteConfig.quickLinksTitle),
    quickLinks: normalizeLinks(entity.quickLinks),
    featuredFooterTitle: stringValue(entity.featuredFooterTitle, fallbackSiteConfig.featuredFooterTitle),
    contactTitle: stringValue(entity.contactTitle, fallbackSiteConfig.contactTitle),
    contactAddress: stringValue(entity.contactAddress, fallbackSiteConfig.contactAddress),
    contactEmail: stringValue(entity.contactEmail, fallbackSiteConfig.contactEmail),
    appointmentLabel: stringValue(entity.appointmentLabel, fallbackSiteConfig.appointmentLabel),
    newsletterTitle: stringValue(entity.newsletterTitle, fallbackSiteConfig.newsletterTitle),
    newsletterText: stringValue(entity.newsletterText, fallbackSiteConfig.newsletterText),
    newsletterPlaceholder: stringValue(entity.newsletterPlaceholder, fallbackSiteConfig.newsletterPlaceholder),
    newsletterButtonLabel: stringValue(entity.newsletterButtonLabel, fallbackSiteConfig.newsletterButtonLabel),
    rightsText: stringValue(entity.rightsText, fallbackSiteConfig.rightsText),
    legalLinks: normalizeLinks(entity.legalLinks),
    backToTopLabel: stringValue(entity.backToTopLabel, fallbackSiteConfig.backToTopLabel),
    loadingText: stringValue(entity.loadingText, fallbackSiteConfig.loadingText),
  };
};

const mapHomePage = (response: HomePageResponse, strapiBaseUrl: string): HomePageContent => {
  const entity = unwrapEntity(response.data);

  return {
    ...fallbackHomePage,
    heroTitleLine1: stringValue(entity.heroTitleLine1, fallbackHomePage.heroTitleLine1),
    heroTitleHighlight: stringValue(entity.heroTitleHighlight, fallbackHomePage.heroTitleHighlight),
    heroSubtitle: stringValue(entity.heroSubtitle, fallbackHomePage.heroSubtitle),
    heroBackground: mediaUrl(entity.heroBackground, strapiBaseUrl, fallbackHomePage.heroBackground, ['large', 'medium']),
    mediaMentionsLabel: stringValue(entity.mediaMentionsLabel, fallbackHomePage.mediaMentionsLabel),
    mediaLogos: normalizeMediaLogos(entity.mediaLogos),
    scrollLabel: stringValue(entity.scrollLabel, fallbackHomePage.scrollLabel),
    searchTabs: Array.isArray(entity.searchTabs)
      ? entity.searchTabs.map((item) => {
          const itemObject = asObject(item);
          return {
            id: stringValue(itemObject.id),
            label: stringValue(itemObject.label),
          };
        })
      : fallbackHomePage.searchTabs,
    searchFilters: normalizeSearchFilters(entity.searchFilters),
    searchButtonLabel: stringValue(entity.searchButtonLabel, fallbackHomePage.searchButtonLabel),
    offPlanLabel: stringValue(entity.offPlanLabel, fallbackHomePage.offPlanLabel),
    offPlanTitle: stringValue(entity.offPlanTitle, fallbackHomePage.offPlanTitle),
    offPlanTitleHighlight: stringValue(entity.offPlanTitleHighlight, fallbackHomePage.offPlanTitleHighlight),
    offPlanFilterChips: Array.isArray(entity.offPlanFilterChips)
      ? entity.offPlanFilterChips.filter((item): item is string => typeof item === 'string')
      : fallbackHomePage.offPlanFilterChips,
    offPlanViewAllLabel: stringValue(entity.offPlanViewAllLabel, fallbackHomePage.offPlanViewAllLabel),
    aboutLabel: stringValue(entity.aboutLabel, fallbackHomePage.aboutLabel),
    aboutTitle: stringValue(entity.aboutTitle, fallbackHomePage.aboutTitle),
    aboutTitleHighlight: stringValue(entity.aboutTitleHighlight, fallbackHomePage.aboutTitleHighlight),
    aboutLead: stringValue(entity.aboutLead, fallbackHomePage.aboutLead),
    aboutBody: stringValue(entity.aboutBody, fallbackHomePage.aboutBody),
    aboutFeatures: unwrapArray(entity.aboutFeatures).map((item) => {
      const itemObject = unwrapEntity(item);
      return {
        icon: stringValue(itemObject.icon),
        text: stringValue(itemObject.text),
      };
    }),
    aboutAdditionalText: stringValue(entity.aboutAdditionalText, fallbackHomePage.aboutAdditionalText),
    aboutCtaLabel: stringValue(entity.aboutCtaLabel, fallbackHomePage.aboutCtaLabel),
    aboutImage: mediaUrl(entity.aboutImage, strapiBaseUrl, fallbackHomePage.aboutImage, ['medium', 'small', 'large']),
    aboutImageAlt: stringValue(entity.aboutImageAlt, fallbackHomePage.aboutImageAlt),
    aboutStats: normalizeStats(entity.aboutStats),
    featuredPropertiesLabel: stringValue(entity.featuredPropertiesLabel, fallbackHomePage.featuredPropertiesLabel),
    featuredPropertiesTitle: stringValue(entity.featuredPropertiesTitle, fallbackHomePage.featuredPropertiesTitle),
    featuredPropertiesTitleHighlight: stringValue(entity.featuredPropertiesTitleHighlight, fallbackHomePage.featuredPropertiesTitleHighlight),
    featuredBadgeLabel: stringValue(entity.featuredBadgeLabel, fallbackHomePage.featuredBadgeLabel),
    featuredBannerLabel: stringValue(entity.featuredBannerLabel, fallbackHomePage.featuredBannerLabel),
    featuredBannerTitle: stringValue(entity.featuredBannerTitle, fallbackHomePage.featuredBannerTitle),
    featuredBannerTitleHighlight: stringValue(entity.featuredBannerTitleHighlight, fallbackHomePage.featuredBannerTitleHighlight),
    featuredBannerDescription: stringValue(entity.featuredBannerDescription, fallbackHomePage.featuredBannerDescription),
    featuredBannerCtaLabel: stringValue(entity.featuredBannerCtaLabel, fallbackHomePage.featuredBannerCtaLabel),
    featuredBannerImage: mediaUrl(entity.featuredBannerImage, strapiBaseUrl, fallbackHomePage.featuredBannerImage, ['large', 'medium']),
    featuredBannerAgent: {
      name: stringValue(unwrapEntity(entity.featuredBannerAgent).name, fallbackHomePage.featuredBannerAgent.name),
      title: stringValue(unwrapEntity(entity.featuredBannerAgent).title, fallbackHomePage.featuredBannerAgent.title),
    },
    featuredBannerStats: normalizeStats(entity.featuredBannerStats),
    neighborhoodsLabel: stringValue(entity.neighborhoodsLabel, fallbackHomePage.neighborhoodsLabel),
    neighborhoodsTitle: stringValue(entity.neighborhoodsTitle, fallbackHomePage.neighborhoodsTitle),
    neighborhoodsTitleHighlight: stringValue(entity.neighborhoodsTitleHighlight, fallbackHomePage.neighborhoodsTitleHighlight),
    neighborhoodsAreaLabel: stringValue(entity.neighborhoodsAreaLabel, fallbackHomePage.neighborhoodsAreaLabel),
    neighborhoodsListingsLabel: stringValue(entity.neighborhoodsListingsLabel, fallbackHomePage.neighborhoodsListingsLabel),
    neighborhoodsViewAllLabel: stringValue(entity.neighborhoodsViewAllLabel, fallbackHomePage.neighborhoodsViewAllLabel),
    blogLabel: stringValue(entity.blogLabel, fallbackHomePage.blogLabel),
    blogTitle: stringValue(entity.blogTitle, fallbackHomePage.blogTitle),
    blogTitleHighlight: stringValue(entity.blogTitleHighlight, fallbackHomePage.blogTitleHighlight),
    blogViewAllLabel: stringValue(entity.blogViewAllLabel, fallbackHomePage.blogViewAllLabel),
    blogReadMoreLabel: stringValue(entity.blogReadMoreLabel, fallbackHomePage.blogReadMoreLabel),
    faqLabel: stringValue(entity.faqLabel, fallbackHomePage.faqLabel),
    faqTitle: stringValue(entity.faqTitle, fallbackHomePage.faqTitle),
    faqTitleHighlight: stringValue(entity.faqTitleHighlight, fallbackHomePage.faqTitleHighlight),
    faqDescription: stringValue(entity.faqDescription, fallbackHomePage.faqDescription),
    faqContactQuestion: stringValue(entity.faqContactQuestion, fallbackHomePage.faqContactQuestion),
    faqContactHelp: stringValue(entity.faqContactHelp, fallbackHomePage.faqContactHelp),
    faqContactButton: stringValue(entity.faqContactButton, fallbackHomePage.faqContactButton),
    propertyViewDetailsLabel: stringValue(entity.propertyViewDetailsLabel, fallbackHomePage.propertyViewDetailsLabel),
    featuredBannerDiscoverLabel: stringValue(
      entity.featuredBannerDiscoverLabel,
      fallbackHomePage.featuredBannerDiscoverLabel
    ),
  };
};

const mapProperties = (response: PropertyResponse, strapiBaseUrl: string): PropertyContent[] => {
  const mappedProperties = response.data.map((item) => {
    const entity = unwrapEntity(item);
    const rawAgent = unwrapEntity(entity.agent);
    const agentName = stringValue(rawAgent.name);
    const agentTitle = stringValue(rawAgent.title);

    const amenityDetails = unwrapArray(entity.amenityDetails)
      .map((amenity) => {
        const amenityEntity = unwrapEntity(amenity);
        const name = stringValue(amenityEntity.name);

        if (!name) {
          return null;
        }

        return {
          name,
          iconUrl: stringValue(amenityEntity.iconUrl) || null,
          iconLocalPath: stringValue(amenityEntity.iconLocalPath) || null,
        };
      })
      .filter((entry): entry is { name: string; iconUrl: string | null; iconLocalPath: string | null } => !!entry);

    const image = mediaUrl(entity.image, strapiBaseUrl, '/property-1.jpg', ['medium', 'small', 'thumbnail']);
    const imageLarge = mediaUrl(entity.image, strapiBaseUrl, '/property-1.jpg');
    const galleryMediaUrls = mediaUrls(entity.gallery, strapiBaseUrl, ['large', 'medium']);
    const sourceData = asObject(entity.sourceData);
    const sourceId = optionalNumberValue(entity.sourceId) ?? optionalNumberValue(sourceData.id);
    const sourceImageUrls = collectProjectImageUrls(sourceData, sourceId);
    const combinedGalleryUrls = dedupeUrls([...galleryMediaUrls, ...sourceImageUrls]);
    const galleryImages = dedupeUrls(
      [imageLarge, ...combinedGalleryUrls].filter((url): url is string => typeof url === 'string' && url.length > 0)
    );
    const sourceDeveloper = asObject(sourceData.developer);
    const sourceBroker = asObject(sourceData.broker);
    const sourceGeneralPlan = asObject(sourceData.general_plan);
    const sourceDeveloperLogo = asObject(sourceDeveloper.logo);
    const sourceBrokerLogo = asObject(sourceBroker.logo);
    const sourceBrokerOffice = asObject(sourceBroker.main_office);
    const sourceDeveloperOffice = asObject(sourceDeveloper.main_office);
    const generalPlanImageUrl = mediaUrl(entity.generalPlanImage, strapiBaseUrl, '');
    const developerLogoImageUrl = mediaUrl(entity.developerLogo, strapiBaseUrl, '');
    const brokerLogoImageUrl = mediaUrl(entity.brokerLogo, strapiBaseUrl, '');
    const brochureFiles = mediaFiles(entity.brochures, strapiBaseUrl);
    const sourceMediaData = asObject(sourceData.reellyMedia ?? sourceData.media);
    const sourceBrochureFiles = mapSourceMediaFiles(sourceMediaData);
    const sourcePaymentPlans = mapPaymentPlans(
      sourceData.reellyPaymentPlans ?? sourceData.paymentPlans ?? sourceData.payment_plan ?? sourceData.payment_plan_details
    );
    const sourceUnits = mapUnits(
      sourceData.reellyUnits ?? sourceData.units ?? sourceData.units_details ?? sourceData.units_catalog,
      strapiBaseUrl
    );
    const rawServiceCharge = sourceData.service_charge;

    const reellyDetails = {
      launchDate: optionalTextValue(sourceData.launch_date),
      constructionStartDate: optionalTextValue(sourceData.construction_start_date),
      readinessProgress: optionalNumberValue(sourceData.readiness_progress),
      furnishing: optionalTextValue(sourceData.furnishing),
      serviceCharge: typeof rawServiceCharge === 'number' ? String(rawServiceCharge) : optionalTextValue(rawServiceCharge),
      totalAreaSqFt: optionalNumberValue(sourceData.total_area),
      maxFloor: optionalNumberValue(sourceData.max_floor),
      floors: optionalNumberValue(sourceData.floors),
      totalParkingLots: optionalNumberValue(sourceData.total_parking_lots),
      unitTypes: optionalTextValue(sourceData.unit_types),
      hasEscrow: optionalBooleanValue(sourceData.has_escrow),
      postHandover: optionalBooleanValue(sourceData.post_handover),
      isBrandedProject: optionalBooleanValue(sourceData.is_branded_project),
      hasChessboard: optionalBooleanValue(sourceData.has_chessboard),
      depositDescription: optionalTextValue(sourceData.deposit_description),
      resaleConditions: optionalTextValue(sourceData.resale_conditions),
      managingCompany: optionalTextValue(sourceData.managing_company),
      generalPlanUrl: optionalTextValue(generalPlanImageUrl) ?? optionalTextValue(sourceGeneralPlan.url),
      brokerName: optionalTextValue(sourceBroker.name),
      developerDescription: optionalTextValue(sourceDeveloper.description),
      brokerDescription: optionalTextValue(sourceBroker.description),
      developerLogoUrl: optionalTextValue(developerLogoImageUrl) ?? optionalTextValue(sourceDeveloperLogo.url),
      brokerLogoUrl: optionalTextValue(brokerLogoImageUrl) ?? optionalTextValue(sourceBrokerLogo.url),
      brochures: brochureFiles.length > 0 ? brochureFiles : sourceBrochureFiles,
      brokerWebsite: optionalTextValue(sourceBroker.website),
      paymentPlans: sourcePaymentPlans,
      units: sourceUnits,
      brokerOffice: mapOffice(sourceBrokerOffice),
      developerOffice: mapOffice(sourceDeveloperOffice),
      developerWorkingHours: mapWorkingHours(sourceDeveloper.working_hours),
      inventories: mapInventories(sourceData.inventories),
      projectClass: optionalTextValue(sourceData.property_class),
      saleStatus: optionalTextValue(sourceData.sale_status) ?? optionalTextValue(sourceData.status),
      isPartnerProject: optionalBooleanValue(sourceData.is_partner_project),
    };

    return {
      seedKey: stringValue(entity.seedKey),
      slug: stringValue(entity.slug),
      title: stringValue(entity.title),
      location: stringValue(entity.location),
      price: stringValue(entity.price),
      priceAed: resolvePriceAed(entity),
      pricePrefix: stringValue(entity.pricePrefix),
      priceSuffix: stringValue(entity.priceSuffix),
      beds: numberValue(entity.beds),
      baths: numberValue(entity.baths),
      area: stringValue(entity.area),
      typeLabel: stringValue(entity.typeLabel),
      statusLabel: stringValue(entity.statusLabel),
      featured: booleanValue(entity.featured),
      showInOffPlan: booleanValue(entity.showInOffPlan),
      showInFeaturedCarousel: booleanValue(entity.showInFeaturedCarousel),
      showInFooter: booleanValue(entity.showInFooter),
      order: numberValue(entity.order),
      agent: agentName ? { name: agentName, title: agentTitle } : undefined,
      developerName: stringValue(entity.developerName),
      completionDate: stringValue(entity.completionDate),
      latitude: optionalNumberValue(entity.latitude),
      longitude: optionalNumberValue(entity.longitude),
      description: stringValue(entity.description),
      sourceUrl: stringValue(entity.sourceUrl),
      amenityDetails,
      image,
      imageLarge,
      galleryImages,
      reellyDetails,
    };
  });

  return mappedProperties.filter((property) => property.showInOffPlan && (property.slug || property.sourceUrl));
};
export const mapFirstPropertyFromResponse = (
  response: PropertyResponse,
  strapiBaseUrl: string
): PropertyContent | null => {
  const mapped = mapProperties(response, strapiBaseUrl);
  return mapped[0] ?? null;
};
const mapNeighborhoods = (response: NeighborhoodResponse, strapiBaseUrl: string): NeighborhoodContent[] => {
  return response.data.map((item) => {
    const entity = unwrapEntity(item);

    return {
      seedKey: stringValue(entity.seedKey),
      name: stringValue(entity.name),
      listings: numberValue(entity.listings),
      size: stringValue(entity.size, 'medium') as 'large' | 'medium' | 'small',
      order: numberValue(entity.order),
      image: mediaUrl(entity.image, strapiBaseUrl, '/neighborhood-downtown.jpg', ['medium', 'small', 'thumbnail']),
    };
  });
};

const mapBlogPosts = (response: BlogPostResponse, strapiBaseUrl: string): BlogPostContent[] => {
  return response.data.map((item) => {
    const entity = unwrapEntity(item);

    return {
      seedKey: stringValue(entity.seedKey),
      title: stringValue(entity.title),
      excerpt: stringValue(entity.excerpt),
      dateLabel: stringValue(entity.dateLabel),
      readTime: stringValue(entity.readTime),
      category: stringValue(entity.category),
      featured: booleanValue(entity.featured),
      order: numberValue(entity.order),
      image: mediaUrl(entity.image, strapiBaseUrl, '/property-1.jpg', ['medium', 'small', 'thumbnail']),
    };
  });
};

const mapFaqCategories = (response: FaqCategoryResponse): FaqCategoryContent[] => {
  return response.data.map((item) => {
    const entity = unwrapEntity(item);

    return {
      seedKey: stringValue(entity.seedKey),
      title: stringValue(entity.title),
      order: numberValue(entity.order),
      items: unwrapArray(entity.items).map((entry) => {
        const itemObject = unwrapEntity(entry);
        return {
          question: stringValue(itemObject.question),
          answer: stringValue(itemObject.answer),
        };
      }),
    };
  });
};

export const mapContentBundle = (bundle: {
  siteConfig: SiteConfigResponse;
  homePage: HomePageResponse;
  properties: PropertyResponse;
  neighborhoods: NeighborhoodResponse;
  blogPosts: BlogPostResponse;
  faqCategories: FaqCategoryResponse;
  strapiBaseUrl: string;
}): PageContent => {
  const siteConfig = mapSiteConfig(bundle.siteConfig);
  const homePage = mapHomePage(bundle.homePage, bundle.strapiBaseUrl);

  return {
    siteConfig,
    homePage,
    properties: mapProperties(bundle.properties, bundle.strapiBaseUrl),
    neighborhoods: mapNeighborhoods(bundle.neighborhoods, bundle.strapiBaseUrl),
    blogPosts: mapBlogPosts(bundle.blogPosts, bundle.strapiBaseUrl),
    faqCategories: mapFaqCategories(bundle.faqCategories),
  };
};





























