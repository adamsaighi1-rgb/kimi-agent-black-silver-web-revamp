import type { Locale } from '@/types/content';

export const STRAPI_BASE_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

export interface SiteConfigResponse {
  data: unknown | null;
}

export interface HomePageResponse {
  data: unknown | null;
}

export interface PropertyResponse {
  data: unknown[];
}

export interface NeighborhoodResponse {
  data: unknown[];
}

export interface BlogPostResponse {
  data: unknown[];
}

export interface FaqCategoryResponse {
  data: unknown[];
}

interface StrapiListResponse {
  data: unknown[];
}

interface StrapiSingleResponse {
  data: unknown | null;
}

const LIST_PAGE_SIZE = '100';
const MAX_FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 1200;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const createUrl = (path: string, params: Record<string, string>) => {
  const url = new URL(`${STRAPI_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

const fetchStrapi = async <T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_FETCH_RETRIES; attempt += 1) {
    try {
      const response = await fetch(createUrl(path, params), {
        method: 'GET',
        signal,
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      const requestError = new Error(`Strapi request failed (${response.status}) for ${path}`);

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_FETCH_RETRIES) {
        throw requestError;
      }

      lastError = requestError;
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      const requestError = error instanceof Error ? error : new Error(`Strapi request failed for ${path}`);
      lastError = requestError;

      if (attempt === MAX_FETCH_RETRIES) {
        throw requestError;
      }
    }

    await sleep(RETRY_DELAY_MS * attempt);
  }

  throw lastError ?? new Error(`Strapi request failed for ${path}`);
};

export const fetchSiteConfig = async (locale: Locale, signal?: AbortSignal): Promise<SiteConfigResponse> => {
  const response = await fetchStrapi<StrapiSingleResponse>('/api/site-config', { locale, populate: '*' }, signal);
  return { data: response.data };
};

export const fetchHomePage = async (locale: Locale, signal?: AbortSignal): Promise<HomePageResponse> => {
  const response = await fetchStrapi<StrapiSingleResponse>('/api/home-page', { locale, populate: '*' }, signal);
  return { data: response.data };
};

export const fetchProperties = async (locale: Locale, signal?: AbortSignal): Promise<PropertyResponse> => {
  const response = await fetchStrapi<StrapiListResponse>(
    '/api/properties',
    {
      locale,
      'sort[0]': 'order:asc',
      'pagination[pageSize]': LIST_PAGE_SIZE,
      'fields[0]': 'seedKey',
      'fields[1]': 'slug',
      'fields[2]': 'title',
      'fields[3]': 'location',
      'fields[4]': 'price',
      'fields[5]': 'pricePrefix',
      'fields[6]': 'priceSuffix',
      'fields[7]': 'beds',
      'fields[8]': 'baths',
      'fields[9]': 'area',
      'fields[10]': 'typeLabel',
      'fields[11]': 'statusLabel',
      'fields[12]': 'featured',
      'fields[13]': 'showInOffPlan',
      'fields[14]': 'showInFeaturedCarousel',
      'fields[15]': 'showInFooter',
      'fields[16]': 'order',
      'fields[17]': 'developerName',
      'fields[18]': 'completionDate',
      'fields[19]': 'sourceUrl',
      'fields[20]': 'latitude',
      'fields[21]': 'longitude',
      'populate[image][fields][0]': 'url',
      'populate[image][fields][1]': 'formats',
      'populate[agent][fields][0]': 'name',
      'populate[agent][fields][1]': 'title',
    },
    signal
  );

  return { data: response.data };
};

export const fetchPropertyByIdentifier = async (
  locale: Locale,
  identifier: string,
  signal?: AbortSignal
): Promise<PropertyResponse> => {
  const normalizedIdentifier = identifier.trim();

  const baseParams: Record<string, string> = {
    locale,
    'pagination[pageSize]': '1',
    'fields[0]': 'seedKey',
    'fields[1]': 'slug',
    'fields[2]': 'title',
    'fields[3]': 'location',
    'fields[4]': 'price',
    'fields[5]': 'pricePrefix',
    'fields[6]': 'priceSuffix',
    'fields[7]': 'beds',
    'fields[8]': 'baths',
    'fields[9]': 'area',
    'fields[10]': 'typeLabel',
    'fields[11]': 'statusLabel',
    'fields[12]': 'featured',
    'fields[13]': 'showInOffPlan',
    'fields[14]': 'showInFeaturedCarousel',
    'fields[15]': 'showInFooter',
    'fields[16]': 'order',
    'fields[17]': 'developerName',
    'fields[18]': 'completionDate',
    'fields[19]': 'sourceUrl',
    'fields[20]': 'latitude',
    'fields[21]': 'longitude',
    'fields[22]': 'description',
    'fields[23]': 'sourceId',
    'fields[24]': 'sourceData',
    'populate[image][fields][0]': 'url',
    'populate[image][fields][1]': 'formats',
    'populate[gallery][fields][0]': 'url',
    'populate[gallery][fields][1]': 'formats',
    'populate[generalPlanImage][fields][0]': 'url',
    'populate[generalPlanImage][fields][1]': 'formats',
    'populate[developerLogo][fields][0]': 'url',
    'populate[developerLogo][fields][1]': 'formats',
    'populate[brokerLogo][fields][0]': 'url',
    'populate[brokerLogo][fields][1]': 'formats',
    'populate[brochures][fields][0]': 'url',
    'populate[brochures][fields][1]': 'name',
    'populate[brochures][fields][2]': 'mime',
    'populate[agent][fields][0]': 'name',
    'populate[agent][fields][1]': 'title',
  };

  const bySlug = await fetchStrapi<StrapiListResponse>(
    '/api/properties',
    {
      ...baseParams,
      'filters[slug][$eq]': normalizedIdentifier,
    },
    signal
  );

  if (bySlug.data.length > 0) {
    return { data: bySlug.data };
  }

  const bySeedKey = await fetchStrapi<StrapiListResponse>(
    '/api/properties',
    {
      ...baseParams,
      'filters[seedKey][$eq]': normalizedIdentifier,
    },
    signal
  );

  return { data: bySeedKey.data };
};

export const fetchNeighborhoods = async (locale: Locale, signal?: AbortSignal): Promise<NeighborhoodResponse> => {
  const response = await fetchStrapi<StrapiListResponse>(
    '/api/neighborhoods',
    { locale, populate: '*', 'sort[0]': 'order:asc' },
    signal
  );

  return { data: response.data };
};

export const fetchBlogPosts = async (locale: Locale, signal?: AbortSignal): Promise<BlogPostResponse> => {
  const response = await fetchStrapi<StrapiListResponse>(
    '/api/blog-posts',
    { locale, populate: '*', 'sort[0]': 'order:asc' },
    signal
  );

  return { data: response.data };
};

export const fetchFaqCategories = async (locale: Locale, signal?: AbortSignal): Promise<FaqCategoryResponse> => {
  const response = await fetchStrapi<StrapiListResponse>(
    '/api/faq-categories',
    { locale, populate: '*', 'sort[0]': 'order:asc' },
    signal
  );

  return { data: response.data };
};

export const fetchContentBundle = async (locale: Locale, signal?: AbortSignal) => {
  const [siteConfigResult, homePageResult, propertiesResult, neighborhoodsResult, blogPostsResult, faqCategoriesResult] =
    await Promise.allSettled([
      fetchSiteConfig(locale, signal),
      fetchHomePage(locale, signal),
      fetchProperties(locale, signal),
      fetchNeighborhoods(locale, signal),
      fetchBlogPosts(locale, signal),
      fetchFaqCategories(locale, signal),
    ]);

  const siteConfig = siteConfigResult.status === 'fulfilled' ? siteConfigResult.value : { data: null };
  const homePage = homePageResult.status === 'fulfilled' ? homePageResult.value : { data: null };
  const properties = propertiesResult.status === 'fulfilled' ? propertiesResult.value : { data: [] };
  const neighborhoods = neighborhoodsResult.status === 'fulfilled' ? neighborhoodsResult.value : { data: [] };
  const blogPosts = blogPostsResult.status === 'fulfilled' ? blogPostsResult.value : { data: [] };
  const faqCategories = faqCategoriesResult.status === 'fulfilled' ? faqCategoriesResult.value : { data: [] };

  if (
    siteConfigResult.status === 'rejected' &&
    homePageResult.status === 'rejected' &&
    propertiesResult.status === 'rejected'
  ) {
    throw new Error('Strapi is temporarily unavailable. Please retry in a few seconds.');
  }

  return {
    siteConfig,
    homePage,
    properties,
    neighborhoods,
    blogPosts,
    faqCategories,
    strapiBaseUrl: STRAPI_BASE_URL,
  };
};
