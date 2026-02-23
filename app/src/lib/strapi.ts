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

const createUrl = (path: string, params: Record<string, string>) => {
  const url = new URL(`${STRAPI_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

const fetchStrapi = async <T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(createUrl(path, params), {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
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
  const response = await fetchStrapi<StrapiListResponse>(
    '/api/properties',
    {
      locale,
      populate: '*',
      'pagination[pageSize]': '1',
      'filters[$or][0][slug][$eq]': identifier,
      'filters[$or][1][seedKey][$eq]': identifier,
    },
    signal
  );

  return { data: response.data };
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
  const [siteConfig, homePage, properties, neighborhoods, blogPosts, faqCategories] = await Promise.all([
    fetchSiteConfig(locale, signal),
    fetchHomePage(locale, signal),
    fetchProperties(locale, signal),
    fetchNeighborhoods(locale, signal),
    fetchBlogPosts(locale, signal),
    fetchFaqCategories(locale, signal),
  ]);

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



