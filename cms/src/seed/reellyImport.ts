import fs from 'node:fs/promises';
import path from 'node:path';

import type { Core } from '@strapi/strapi';

type LocaleCode = 'en' | 'fr' | 'ar';
type NeighborhoodSize = 'large' | 'medium' | 'small';

type ReellyProjectSummary = {
  id: number;
  name?: string;
};

type ReellyAmenity = {
  amenity?: {
    name?: string;
    icon?: {
      url?: string;
    };
  };
};

type ReellyProjectDetail = {
  id: number;
  name?: string;
  district?: string;
  overview?: string;
  short_description?: string;
  sale_status?: string;
  status?: string;
  property_class?: string;
  min_price?: number | null;
  construction_end_date?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  min_bedrooms?: number | null;
  min_size?: number | null;
  total_area?: number | null;
  unit_types?: string | null;
  cover_image?: { url?: string };
  developer?: { name?: string };
  developer_name?: string;
  amenities?: ReellyAmenity[];
  [key: string]: unknown;
};

type ReellyListResponse = {
  next: string | null;
  results: ReellyProjectSummary[];
};

type DistrictStats = {
  name: string;
  listings: number;
  imageMediaId: number;
};

type NeighborhoodPayload = {
  seedKey: string;
  name: string;
  listings: number;
  size: NeighborhoodSize;
  order: number;
  image: number;
};

const REELLY_IMPORT_ENABLED = process.env.REELLY_IMPORT_ON_BOOTSTRAP === 'true';
const REELLY_LIMIT = Number(process.env.REELLY_LIMIT ?? '10');
const REELLY_LOGIN_URL = process.env.REELLY_LOGIN_URL ?? 'https://api.reelly.io/api:sk5LT7jx/auth/login0';
const REELLY_LIST_URL = process.env.REELLY_LIST_URL ?? 'https://api-reelly.up.railway.app/api/internal/projects?limit=50';
const REELLY_DETAIL_URL = process.env.REELLY_DETAIL_URL ?? 'https://api-reelly.up.railway.app/api/internal/projects/{id}';
const REELLY_ORIGIN = process.env.REELLY_ORIGIN ?? 'https://find.reelly.io';
const REELLY_PAUSE_MS = Number(process.env.REELLY_PAUSE_MS ?? '150');


const REELLY_AUTH_TOKEN = process.env.REELLY_AUTH_TOKEN?.trim() ?? '';
const REELLY_MEDIA_URL = process.env.REELLY_MEDIA_URL ?? 'https://api-reelly.up.railway.app/api/internal/projects/{id}/media';
const REELLY_PAYMENT_PLAN_URL = process.env.REELLY_PAYMENT_PLAN_URL ?? 'https://api-reelly.up.railway.app/api/internal/projects/{id}/payment_plan';
const REELLY_UNITS_URL = process.env.REELLY_UNITS_URL ?? 'https://api-reelly.up.railway.app/api/internal/projects/{id}/units';
const REELLY_FETCH_UNITS_BY_BEDROOMS = process.env.REELLY_FETCH_UNITS_BY_BEDROOMS !== 'false';
const REELLY_MAX_BEDROOM_FILTER = Number(process.env.REELLY_MAX_BEDROOM_FILTER ?? '10');
const REELLY_REQUEST_TIMEOUT_MS = Number(process.env.REELLY_REQUEST_TIMEOUT_MS ?? '30000');
const REELLY_DOWNLOAD_TIMEOUT_MS = Number(process.env.REELLY_DOWNLOAD_TIMEOUT_MS ?? '90000');
const REELLY_REQUEST_RETRIES = Math.max(1, Number(process.env.REELLY_REQUEST_RETRIES ?? '3'));
const REELLY_REQUEST_RETRY_DELAY_MS = Math.max(0, Number(process.env.REELLY_REQUEST_RETRY_DELAY_MS ?? '1200'));
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

const IMPORT_ROOT = path.resolve(process.cwd(), 'imports', 'reelly');
const DATA_DIR = path.join(IMPORT_ROOT, 'data');
const IMAGE_DIR = path.join(IMPORT_ROOT, 'images');
const COVER_DIR = path.join(IMAGE_DIR, 'covers');
const AMENITY_DIR = path.join(IMAGE_DIR, 'amenities');
const GALLERY_DIR = path.join(IMAGE_DIR, 'gallery');
const PLAN_DIR = path.join(IMAGE_DIR, 'plans');
const LOGO_DIR = path.join(IMAGE_DIR, 'logos');
const BROCHURE_DIR = path.join(IMAGE_DIR, 'brochures');
const EXPORT_FILE = path.join(IMPORT_ROOT, 'reelly_test_50_projects.json');
const NEIGHBORHOOD_EXPORT_FILE = path.join(IMPORT_ROOT, 'reelly_neighborhoods.json');

const LOCALES: LocaleCode[] = ['en', 'fr', 'ar'];

const pause = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const cleanMarkdown = (text: string | undefined | null) => {
  if (!text) return '';

  return text
    .replace(/#+/g, '')
    .replace(/\n+/g, '\n')
    .trim();
};

const extensionFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    const ext = path.extname(base).toLowerCase();

    if (ext) return ext;
  } catch {
    // Ignore malformed URL extension parsing.
  }

  return '.jpg';
};

const mimeByExt = (ext: string) => {
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.doc') return 'application/msword';
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext === '.ppt') return 'application/vnd.ms-powerpoint';
  if (ext === '.pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (ext === '.xls') return 'application/vnd.ms-excel';
  if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'application/octet-stream';
};

const toRelativePath = (absolutePath: string) => {
  const relative = path.relative(process.cwd(), absolutePath);
  return relative.split(path.sep).join('/');
};

const humanize = (value?: string | null) => {
  if (!value) return '';

  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatPrice = (value?: number | null) => {
  if (!value || Number.isNaN(Number(value))) return 'On request';

  return `AED ${new Intl.NumberFormat('en-US').format(Number(value))}`;
};

const inferBeds = (project: ReellyProjectDetail) => {
  if (typeof project.min_bedrooms === 'number' && project.min_bedrooms > 0) {
    return Math.round(project.min_bedrooms);
  }

  const text = `${project.unit_types ?? ''} ${project.name ?? ''} ${project.short_description ?? ''}`;
  const match = text.match(/(\d+)\s*bed/i);

  if (match) {
    return Number(match[1]);
  }

  if (/studio/i.test(text)) {
    return 0;
  }

  return 1;
};

const formatArea = (project: ReellyProjectDetail) => {
  const area = [project.min_size, project.total_area].find((item) => typeof item === 'number' && item > 0);

  if (!area) return 'N/A';

  return `${Math.round(Number(area))} sq.ft.`;
};

const normalizeDistrictName = (value: unknown) => {
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length > 0) return normalized;
  }

  return 'Dubai';
};

const districtMapKey = (districtName: string) => districtName.toLowerCase();

const determineNeighborhoodSize = (listings: number, index: number): NeighborhoodSize => {
  if (index === 0 || listings >= 10) return 'large';
  if (index <= 4 || listings >= 4) return 'medium';
  return 'small';
};

const fetchWithTimeout = async (url: string, options: RequestInit | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const requestJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= REELLY_REQUEST_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, REELLY_REQUEST_TIMEOUT_MS);

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 400)}`);

        if (attempt < REELLY_REQUEST_RETRIES && RETRYABLE_STATUS_CODES.has(response.status)) {
          lastError = error;
          if (REELLY_REQUEST_RETRY_DELAY_MS > 0) {
            await pause(REELLY_REQUEST_RETRY_DELAY_MS * attempt);
          }
          continue;
        }

        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      const requestError = error instanceof Error ? error : new Error(String(error));
      const isAbort = requestError.name === 'AbortError';
      const isNetworkFailure = /fetch failed|network|timed out|econn|socket|enotfound/i.test(requestError.message);

      if (attempt < REELLY_REQUEST_RETRIES && (isAbort || isNetworkFailure)) {
        lastError = requestError;
        if (REELLY_REQUEST_RETRY_DELAY_MS > 0) {
          await pause(REELLY_REQUEST_RETRY_DELAY_MS * attempt);
        }
        continue;
      }

      throw requestError;
    }
  }

  throw lastError ?? new Error(`Request failed for ${url}`);
};

const resolveDetailUrl = (id: number) => REELLY_DETAIL_URL.replace('{id}', String(id));
const resolveMediaUrl = (id: number) => REELLY_MEDIA_URL.replace('{id}', String(id));
const resolvePaymentPlanUrl = (id: number) => REELLY_PAYMENT_PLAN_URL.replace('{id}', String(id));
const resolveUnitsUrl = (id: number) => REELLY_UNITS_URL.replace('{id}', String(id));

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
};

const parseCollectionPayload = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      next: null as string | null,
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      items: [] as unknown[],
      next: null as string | null,
    };
  }

  const entity = payload as Record<string, unknown>;
  const nestedData = asRecord(entity.data);
  const rawItems = Array.isArray(entity.results)
    ? (entity.results as unknown[])
    : Array.isArray(entity.data)
      ? (entity.data as unknown[])
      : Array.isArray(entity.items)
        ? (entity.items as unknown[])
        : Array.isArray(entity.units)
          ? (entity.units as unknown[])
          : Array.isArray(entity.payment_plan)
            ? (entity.payment_plan as unknown[])
            : Array.isArray(entity.paymentPlans)
              ? (entity.paymentPlans as unknown[])
              : Array.isArray(entity.rows)
                ? (entity.rows as unknown[])
                : Array.isArray(entity.list)
                  ? (entity.list as unknown[])
                  : Array.isArray(nestedData.results)
                    ? (nestedData.results as unknown[])
                    : Array.isArray(nestedData.items)
                      ? (nestedData.items as unknown[])
                      : [];

  const items =
    rawItems.length > 0
      ? rawItems
      : typeof entity.id === 'number' || typeof entity.id === 'string'
        ? [entity]
        : [];

  const next = typeof entity.next === 'string' && entity.next.length > 0 ? entity.next : null;

  return {
    items,
    next,
  };
};

const fetchCollectionResults = async (url: string, token: string) => {
  const allResults: unknown[] = [];
  const seenUrls = new Set<string>();
  let nextUrl: string | null = url;

  while (nextUrl) {
    if (seenUrls.has(nextUrl)) {
      break;
    }

    seenUrls.add(nextUrl);

    const payload = await requestJson<unknown>(nextUrl, {
      method: 'GET',
      headers: reellyHeaders(token),
    });

    const page = parseCollectionPayload(payload);

    if (page.items.length > 0) {
      allResults.push(...page.items);
    }

    nextUrl = page.next;

    if (REELLY_PAUSE_MS > 0 && nextUrl) {
      await pause(REELLY_PAUSE_MS);
    }
  }

  return allResults;
};

const normalizeMediaPayload = (payload: unknown) => {
  const direct = asRecord(payload);

  if (
    Array.isArray(direct.images) ||
    Array.isArray(direct.files) ||
    Array.isArray(direct.videos) ||
    Array.isArray(direct.links)
  ) {
    return direct;
  }

  const nestedCandidates = [direct.data, direct.result, direct.media];

  for (const candidate of nestedCandidates) {
    const nested = asRecord(candidate);
    if (
      Array.isArray(nested.images) ||
      Array.isArray(nested.files) ||
      Array.isArray(nested.videos) ||
      Array.isArray(nested.links)
    ) {
      return nested;
    }
  }

  return direct;
};

const errorMessage = (reason: unknown) => {
  if (reason instanceof Error) {
    return reason.message;
  }

  return String(reason);
};

const dedupeCollectionItems = (items: unknown[]) => {
  const byKey = new Map<string, unknown>();

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const entity = item as Record<string, unknown>;
    const id = entity.id;

    const key =
      typeof id === 'number' || typeof id === 'string'
        ? 'id:' + String(id)
        : [
            typeof entity.name === 'string' ? entity.name : '',
            typeof entity.price === 'number' || typeof entity.price === 'string' ? String(entity.price) : '',
            typeof entity.size === 'number' || typeof entity.size === 'string' ? String(entity.size) : '',
            typeof entity.bedrooms === 'number' || typeof entity.bedrooms === 'string' ? String(entity.bedrooms) : '',
          ].join('|');

    if (!byKey.has(key)) {
      byKey.set(key, item);
    }
  }

  return [...byKey.values()];
};

const buildUnitsBedrooms = (project: ReellyProjectDetail) => {
  const values = new Set<number>();

  if (typeof project.min_bedrooms === 'number' && Number.isFinite(project.min_bedrooms) && project.min_bedrooms >= 0) {
    values.add(Math.round(project.min_bedrooms));
  }

  const text = (project.unit_types ?? '') + ' ' + (project.name ?? '') + ' ' + (project.short_description ?? '');
  const matches = text.matchAll(/(\d+)\s*(?:bed|br)/gi);

  for (const match of matches) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed >= 0) {
      values.add(parsed);
    }
  }

  if (/studio/i.test(text)) {
    values.add(0);
  }

  for (let bedroom = 0; bedroom <= Math.max(0, REELLY_MAX_BEDROOM_FILTER); bedroom += 1) {
    values.add(bedroom);
  }

  return [...values].sort((a, b) => a - b);
};

const resolveUnitsUrlByBedrooms = (id: number, bedrooms: number) => {
  const base = resolveUnitsUrl(id);

  try {
    const url = new URL(base);
    url.searchParams.set('bedrooms', String(bedrooms));
    return url.toString();
  } catch {
    const joiner = base.includes('?') ? '&' : '?';
    return base + joiner + 'bedrooms=' + encodeURIComponent(String(bedrooms));
  }
};

const fetchUnitsResults = async (project: ReellyProjectDetail, token: string) => {
  const baseUnits = await fetchCollectionResults(resolveUnitsUrl(project.id), token);

  if (baseUnits.length > 0 || !REELLY_FETCH_UNITS_BY_BEDROOMS) {
    return dedupeCollectionItems(baseUnits);
  }

  const bedrooms = buildUnitsBedrooms(project);
  const allUnits = [...baseUnits];

  for (const bedroom of bedrooms) {
    const units = await fetchCollectionResults(resolveUnitsUrlByBedrooms(project.id, bedroom), token);

    if (units.length > 0) {
      allUnits.push(...units);
    }

    if (REELLY_PAUSE_MS > 0) {
      await pause(REELLY_PAUSE_MS);
    }
  }

  return dedupeCollectionItems(allUnits);
};
const isReellyProjectImageUrl = (url: string, projectId: number) => {
  const normalized = url.toLowerCase();

  if (normalized.includes('/amenity_icons/')) return false;
  if (normalized.includes('/unit_layouts/')) return true;
  if (!normalized.includes('/projects/') || !normalized.includes('/images/')) return false;

  return normalized.includes(`/projects/${projectId}/`);
};

const rawUrlExt = (url: string) => {
  try {
    const parsed = new URL(url);
    return path.extname(parsed.pathname).toLowerCase().replace('.', '');
  } catch {
    const clean = url.split('?')[0]?.split('#')[0] ?? '';
    const ext = path.extname(clean).toLowerCase();
    return ext.replace('.', '');
  }
};

const isLikelyImageUrl = (url: string) => {
  const ext = rawUrlExt(url);
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'svg'].includes(ext);
};

const isExcludedImageUrl = (url: string) => {
  return url.toLowerCase().includes('/amenity_icons/');
};

const normalizeUrlKey = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? url.toLowerCase();
  }
};

const collectProjectImageUrls = (project: ReellyProjectDetail) => {
  const urlsByKey = new Map<string, string>();

  const addUrl = (value: unknown, strictProjectMatch = false) => {
    if (typeof value !== 'string' || value.length === 0) return;
    if (isExcludedImageUrl(value)) return;
    if (!isLikelyImageUrl(value)) return;
    if (strictProjectMatch && !isReellyProjectImageUrl(value, project.id)) return;

    const key = normalizeUrlKey(value);
    if (!urlsByKey.has(key)) {
      urlsByKey.set(key, value);
    }
  };

  const source = project as Record<string, unknown>;
  const mediaObject = source.reellyMedia;

  if (mediaObject && typeof mediaObject === 'object') {
    const mediaImages = Array.isArray((mediaObject as Record<string, unknown>).images)
      ? ((mediaObject as Record<string, unknown>).images as unknown[])
      : [];

    for (const mediaImage of mediaImages) {
      if (!mediaImage || typeof mediaImage !== 'object') continue;
      const imageObject = mediaImage as Record<string, unknown>;
      const nestedImage = imageObject.image as Record<string, unknown> | undefined;
      addUrl(imageObject.url);
      addUrl(imageObject.file);
      addUrl(nestedImage?.url);
      addUrl(nestedImage?.file);
    }

    const mediaFiles = Array.isArray((mediaObject as Record<string, unknown>).files)
      ? ((mediaObject as Record<string, unknown>).files as unknown[])
      : [];

    for (const mediaFile of mediaFiles) {
      if (!mediaFile || typeof mediaFile !== 'object') continue;
      const fileObject = mediaFile as Record<string, unknown>;
      addUrl(fileObject.url);
      addUrl(fileObject.file);
    }
  }

  const unitRows = Array.isArray(source.reellyUnits) ? (source.reellyUnits as unknown[]) : [];

  for (const unitRow of unitRows) {
    if (!unitRow || typeof unitRow !== 'object') continue;

    const layout = (unitRow as Record<string, unknown>).layout;
    if (!layout || typeof layout !== 'object') continue;

    const layoutImages = Array.isArray((layout as Record<string, unknown>).images)
      ? ((layout as Record<string, unknown>).images as unknown[])
      : [];

    for (const layoutImage of layoutImages) {
      if (!layoutImage || typeof layoutImage !== 'object') continue;
      const image = (layoutImage as Record<string, unknown>).image;
      if (!image || typeof image !== 'object') continue;
      addUrl((image as Record<string, unknown>).url);
      addUrl((image as Record<string, unknown>).file);
    }
  }

  if (urlsByKey.size === 0) {
    const walk = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (!value || typeof value !== 'object') return;

      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if ((key === 'url' || key === 'file') && typeof child === 'string') {
          addUrl(child, true);
          continue;
        }

        if (child && typeof child === 'object') {
          walk(child);
        }
      }
    };

    walk(project);
  }

  if (urlsByKey.size === 0) {
    addUrl(project.cover_image?.url);
  }

  return [...urlsByKey.values()];
};

const urlExtension = (url: string) => {
  try {
    const parsed = new URL(url);
    return path.extname(parsed.pathname).toLowerCase();
  } catch {
    return '';
  }
};

const isDocumentUrl = (url: string) => {
  const ext = urlExtension(url);
  return ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'].includes(ext);
};

const getNestedImageUrl = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  const objectValue = value as Record<string, unknown>;
  const url = objectValue.url;

  if (typeof url === 'string' && url.length > 0) {
    return url;
  }

  return null;
};

const collectDocumentUrls = (project: ReellyProjectDetail) => {
  const urlsByKey = new Map<string, string>();

  const addUrl = (value: unknown) => {
    if (typeof value !== 'string' || value.length === 0) return;
    if (!isDocumentUrl(value)) return;

    const key = normalizeUrlKey(value);
    if (!urlsByKey.has(key)) {
      urlsByKey.set(key, value);
    }
  };

  const source = project as Record<string, unknown>;
  const mediaObject = source.reellyMedia;

  if (mediaObject && typeof mediaObject === 'object') {
    const mediaFiles = Array.isArray((mediaObject as Record<string, unknown>).files)
      ? ((mediaObject as Record<string, unknown>).files as unknown[])
      : [];

    for (const mediaFile of mediaFiles) {
      if (!mediaFile || typeof mediaFile !== 'object') continue;
      const fileObject = mediaFile as Record<string, unknown>;
      addUrl(fileObject.file);
      addUrl(fileObject.url);
    }
  }

  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!value || typeof value !== 'object') return;

    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if ((key === 'url' || key === 'file') && typeof child === 'string') {
        addUrl(child);
        continue;
      }

      if (child && typeof child === 'object') {
        walk(child);
      }
    }
  };

  walk(project);

  return [...urlsByKey.values()];
};

const authenticate = async () => {
  if (REELLY_AUTH_TOKEN) {
    return REELLY_AUTH_TOKEN;
  }

  const email = process.env.REELLY_EMAIL;
  const password = process.env.REELLY_PASSWORD;

  if (!email || !password) {
    throw new Error('REELLY_EMAIL and REELLY_PASSWORD are required when REELLY_IMPORT_ON_BOOTSTRAP=true');
  }

  const response = await requestJson<{ authToken?: string }>(REELLY_LOGIN_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.authToken) {
    throw new Error('Reelly login succeeded without authToken in response.');
  }

  return response.authToken;
};

const reellyHeaders = (token: string) => ({
  accept: 'application/json',
  'content-type': 'application/json',
  origin: REELLY_ORIGIN,
  referer: `${REELLY_ORIGIN}/`,
  'user-agent': 'Mozilla/5.0',
  'xano-authorization': token,
  authorization: `Bearer ${token}`,
});

const fetchProjectIds = async (token: string, limit: number) => {
  const ids: number[] = [];
  let nextUrl: string | null = REELLY_LIST_URL;

  while (nextUrl && ids.length < limit) {
    const page = await requestJson<unknown>(nextUrl, {
      method: 'GET',
      headers: reellyHeaders(token),
    });
    const parsedPage = parseCollectionPayload(page);

    for (const project of parsedPage.items as ReellyProjectSummary[]) {
      const projectId =
        typeof project.id === 'number'
          ? project.id
          : typeof project.id === 'string'
            ? Number(project.id)
            : Number.NaN;

      if (!Number.isFinite(projectId)) continue;
      ids.push(projectId);

      if (ids.length >= limit) break;
    }

    nextUrl = parsedPage.next;

    if (REELLY_PAUSE_MS > 0) {
      await pause(REELLY_PAUSE_MS);
    }
  }

  return ids.slice(0, limit);
};

const downloadToFile = async (url: string, fileBaseName: string, targetDir: string) => {
  if (!url) return null;

  await fs.mkdir(targetDir, { recursive: true });

  const ext = extensionFromUrl(url);
  const fileName = `${fileBaseName}${ext}`;
  const filePath = path.join(targetDir, fileName);

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    // File does not exist yet.
  }

  const response = await fetchWithTimeout(url, undefined, REELLY_DOWNLOAD_TIMEOUT_MS);

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  return filePath;
};

const ensureUploadedFile = async (strapi: Core.Strapi, filePath: string) => {
  const fileName = path.basename(filePath);

  const existing = await strapi.db.query('plugin::upload.file').findOne({
    where: { name: fileName },
  });

  if (existing?.id) {
    return existing.id as number;
  }

  const stat = await fs.stat(filePath);
  const ext = path.extname(fileName).toLowerCase();

  const uploaded = await strapi.plugin('upload').service('upload').upload({
    data: {
      fileInfo: {
        name: fileName,
        alternativeText: fileName,
        caption: fileName,
      },
    },
    files: {
      filepath: filePath,
      originalFilename: fileName,
      mimetype: mimeByExt(ext),
      size: stat.size,
    },
  });

  const entity = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  return entity?.id as number | undefined;
};

const publishIfPossible = async (documentsService: any, documentId: string, locale: LocaleCode) => {
  if (typeof documentsService.publish !== 'function') return;

  try {
    await documentsService.publish({ documentId, locale });
  } catch {
    // Ignore publish failures in restricted environments.
  }
};

const unwrapRelationArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
  }

  const entity = asRecord(value);

  if (Array.isArray(entity.data)) {
    return unwrapRelationArray(entity.data);
  }

  return [] as Record<string, unknown>[];
};

const unwrapSingleRelation = (value: unknown) => {
  const directArray = unwrapRelationArray(value);
  if (directArray.length > 0) {
    return directArray[0];
  }

  const entity = asRecord(value);

  if (entity.data && typeof entity.data === 'object') {
    return asRecord(entity.data);
  }

  if (typeof entity.id === 'number' || typeof entity.documentId === 'string') {
    return entity;
  }

  return null;
};

const relationId = (value: unknown) => {
  const entity = unwrapSingleRelation(value);
  return typeof entity?.id === 'number' ? entity.id : null;
};

const relationIds = (value: unknown) => {
  return unwrapRelationArray(value)
    .map((item) => item.id)
    .filter((item): item is number => typeof item === 'number');
};

const hasMeaningfulMediaPayload = (value: unknown) => {
  const entity = asRecord(value);
  return ['images', 'files', 'videos', 'links'].some((key) => {
    const items = entity[key];
    return Array.isArray(items) && items.length > 0;
  });
};

const mergeArrayField = (nextValue: unknown, existingValue: unknown) => {
  if (Array.isArray(nextValue) && nextValue.length > 0) {
    return nextValue;
  }

  if (Array.isArray(existingValue) && existingValue.length > 0) {
    return existingValue;
  }

  return Array.isArray(nextValue) ? nextValue : [];
};

const mergeMediaField = (nextValue: unknown, existingValue: unknown) => {
  if (hasMeaningfulMediaPayload(nextValue)) {
    return normalizeMediaPayload(nextValue);
  }

  if (hasMeaningfulMediaPayload(existingValue)) {
    return normalizeMediaPayload(existingValue);
  }

  return normalizeMediaPayload(nextValue);
};

const mergeRecordPreferIncoming = (existingValue: unknown, nextValue: unknown): Record<string, unknown> => {
  const existing = asRecord(existingValue);
  const next = asRecord(nextValue);
  const merged: Record<string, unknown> = { ...existing };

  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      if (value.trim().length === 0 && typeof existing[key] === 'string' && String(existing[key]).trim().length > 0) {
        continue;
      }

      merged[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0 && Array.isArray(existing[key]) && (existing[key] as unknown[]).length > 0) {
        continue;
      }

      merged[key] = value;
      continue;
    }

    if (typeof value === 'object') {
      const incomingRecord = asRecord(value);
      const existingRecord = asRecord(existing[key]);

      if (Object.keys(incomingRecord).length === 0 && Object.keys(existingRecord).length > 0) {
        continue;
      }

      merged[key] =
        Object.keys(existingRecord).length > 0
          ? mergeRecordPreferIncoming(existingRecord, incomingRecord)
          : incomingRecord;
      continue;
    }

    merged[key] = value;
  }

  return merged;
};

const getExistingPropertySnapshot = async (strapi: Core.Strapi, seedKey: string) => {
  const uid = 'api::property.property';

  const existing = await strapi.db.query(uid).findOne({
    where: {
      seedKey,
      locale: 'en',
    },
    populate: {
      image: true,
      gallery: true,
      generalPlanImage: true,
      developerLogo: true,
      brokerLogo: true,
      brochures: true,
    },
  });

  return existing ? asRecord(existing) : null;
};

const upsertPropertyByLocale = async (
  strapi: Core.Strapi,
  locale: LocaleCode,
  seedKey: string,
  data: Record<string, unknown>
) => {
  const uid = 'api::property.property';
  const documentsService = strapi.documents(uid as any);

  const existing = await documentsService.findFirst({
    locale,
    filters: { seedKey },
  });

  if (existing?.documentId) {
    const updated = await documentsService.update({
      documentId: existing.documentId,
      locale,
      data,
    });

    await publishIfPossible(documentsService, updated.documentId, locale);
    return;
  }

  const created = await documentsService.create({ locale, data });
  await publishIfPossible(documentsService, created.documentId, locale);
};

const upsertNeighborhoodByLocale = async (
  strapi: Core.Strapi,
  locale: LocaleCode,
  seedKey: string,
  data: Record<string, unknown>
) => {
  const uid = 'api::neighborhood.neighborhood';
  const documentsService = strapi.documents(uid as any);

  const existing = await documentsService.findFirst({
    locale,
    filters: { seedKey },
  });

  if (existing?.documentId) {
    const updated = await documentsService.update({
      documentId: existing.documentId,
      locale,
      data,
    });

    await publishIfPossible(documentsService, updated.documentId, locale);
    return;
  }

  const created = await documentsService.create({ locale, data });
  await publishIfPossible(documentsService, created.documentId, locale);
};

const cleanupNonImportedProperties = async (strapi: Core.Strapi, keepSeedKeys: Set<string>) => {
  const uid = 'api::property.property';

  const entries = await strapi.db.query(uid).findMany({
    select: ['id', 'seedKey'],
  });

  for (const entry of entries ?? []) {
    const seedKey = String(entry?.seedKey ?? '');

    if (keepSeedKeys.has(seedKey)) {
      continue;
    }

    try {
      await strapi.db.query(uid).delete({ where: { id: entry.id } });
    } catch {
      // Ignore cleanup errors and continue removing stale rows.
    }
  }
};

const cleanupNonImportedNeighborhoods = async (strapi: Core.Strapi, keepSeedKeys: Set<string>) => {
  const uid = 'api::neighborhood.neighborhood';

  const entries = await strapi.db.query(uid).findMany({
    select: ['id', 'seedKey'],
  });

  for (const entry of entries ?? []) {
    const seedKey = String(entry?.seedKey ?? '');

    if (keepSeedKeys.has(seedKey)) {
      continue;
    }

    try {
      await strapi.db.query(uid).delete({ where: { id: entry.id } });
    } catch {
      // Ignore cleanup errors and continue removing stale rows.
    }
  }
};

const syncHomePageAreaFilters = async (strapi: Core.Strapi, areaOptions: string[]) => {
  if (areaOptions.length === 0) return;

  const uid = 'api::home-page.home-page';
  const documentsService = strapi.documents(uid as any);

  const areaLabels: Record<LocaleCode, string> = {
    en: 'AREA',
    fr: 'ZONE',
    ar: 'AREA',
  };

  for (const locale of LOCALES) {
    const existing = await documentsService.findFirst({ locale });

    if (!existing?.documentId) {
      continue;
    }

    const filters = Array.isArray((existing as Record<string, unknown>).searchFilters)
      ? ([...(existing as Record<string, any>).searchFilters] as Array<Record<string, unknown>>)
      : [];

    const targetIndex = filters.findIndex((entry) => String(entry.key ?? '').toLowerCase() === 'area');

    if (targetIndex >= 0) {
      filters[targetIndex] = {
        ...(filters[targetIndex] as Record<string, unknown>),
        options: areaOptions,
      };
    } else {
      filters.push({
        key: 'area',
        label: areaLabels[locale],
        icon: 'map-pin',
        options: areaOptions,
      });
    }

    const updated = await documentsService.update({
      documentId: existing.documentId,
      locale,
      data: {
        searchFilters: filters as any,
      },
    });

    await publishIfPossible(documentsService, updated.documentId, locale);
  }
};

const parseDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
};

const buildPropertyPayload = (
  project: ReellyProjectDetail,
  index: number,
  coverMediaId: number,
  galleryMediaIds: number[],
  slug: string,
  amenityDetails: Array<Record<string, unknown>>,
  rawJsonPath: string,
  coverImagePath: string | null,
  generalPlanMediaId: number | null,
  developerLogoMediaId: number | null,
  brokerLogoMediaId: number | null,
  brochureMediaIds: number[]
) => {
  const developerName =
    (typeof project.developer?.name === 'string' && project.developer?.name) ||
    (typeof project.developer_name === 'string' && project.developer_name) ||
    'Reelly';

  const minPrice = typeof project.min_price === 'number' ? project.min_price : null;

  return {
    seedKey: `reelly-${project.id}`,
    sourceId: project.id,
    slug,
    title: project.name || `Project ${project.id}`,
    location: normalizeDistrictName(project.district),
    price: formatPrice(minPrice),
    pricePrefix: minPrice ? 'From' : '',
    priceSuffix: '',
    beds: inferBeds(project),
    baths: null,
    area: formatArea(project),
    typeLabel: humanize(project.property_class) || 'Property',
    statusLabel: humanize(project.sale_status || project.status) || 'Available',
    featured: index < 3,
    showInOffPlan: true,
    showInFeaturedCarousel: index < 8,
    showInFooter: index < 2,
    order: index + 1,
    agent: {
      name: developerName,
      title: 'Developer',
    },
    image: coverMediaId,
    gallery: galleryMediaIds,
    generalPlanImage: generalPlanMediaId,
    developerLogo: developerLogoMediaId,
    brokerLogo: brokerLogoMediaId,
    brochures: brochureMediaIds,
    developerName,
    completionDate: parseDate(project.construction_end_date),
    latitude: typeof project.latitude === 'number' ? project.latitude : null,
    longitude: typeof project.longitude === 'number' ? project.longitude : null,
    description: cleanMarkdown(project.overview || project.short_description),
    sourceProvider: 'reelly',
    sourceUrl: `https://find.reelly.io/projects/${project.id}`,
    sourceData: project,
    amenityDetails,
    rawJsonLocalPath: rawJsonPath,
    coverImageLocalPath: coverImagePath,
  };
};

const buildNeighborhoodPayloads = (districtStats: Map<string, DistrictStats>) => {
  const orderedDistricts = [...districtStats.values()].sort((a, b) => {
    if (b.listings !== a.listings) return b.listings - a.listings;
    return a.name.localeCompare(b.name);
  });

  const usedSeedKeys = new Set<string>();

  return orderedDistricts.map((district, index) => {
    const slugBase = slugify(district.name) || `district-${index + 1}`;
    let seedKey = `reelly-neighborhood-${slugBase}`;

    if (usedSeedKeys.has(seedKey)) {
      seedKey = `${seedKey}-${index + 1}`;
    }

    usedSeedKeys.add(seedKey);

    const payload: NeighborhoodPayload = {
      seedKey,
      name: district.name,
      listings: district.listings,
      size: determineNeighborhoodSize(district.listings, index),
      order: index + 1,
      image: district.imageMediaId,
    };

    return payload;
  });
};

export const importReellyProperties = async (strapi: Core.Strapi) => {
  if (!REELLY_IMPORT_ENABLED) {
    return;
  }

  strapi.log.info('Reelly import enabled. Fetching token and syncing projects/neighborhoods.');

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(COVER_DIR, { recursive: true });
  await fs.mkdir(AMENITY_DIR, { recursive: true });
  await fs.mkdir(GALLERY_DIR, { recursive: true });
  await fs.mkdir(PLAN_DIR, { recursive: true });
  await fs.mkdir(LOGO_DIR, { recursive: true });
  await fs.mkdir(BROCHURE_DIR, { recursive: true });

  const token = await authenticate();
  const ids = await fetchProjectIds(token, REELLY_LIMIT);

  if (ids.length === 0) {
    throw new Error('No Reelly project IDs were fetched.');
  }

  const fallbackImage = await strapi.db.query('plugin::upload.file').findOne({
    where: { name: 'property-1.jpg' },
  });

  const importedProperties: Array<Record<string, unknown>> = [];
  const keepPropertySeedKeys = new Set<string>();
  const districtStats = new Map<string, DistrictStats>();
  let hadImportFailures = false;

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const expectedSeedKey = `reelly-${id}`;
    keepPropertySeedKeys.add(expectedSeedKey);
    strapi.log.info(`Reelly import progress ${index + 1}/${ids.length}: project ${id}`);

    try {
      const existingProperty = await getExistingPropertySnapshot(strapi, expectedSeedKey);
      const existingSourceData = asRecord(existingProperty?.sourceData);

      let project = await requestJson<ReellyProjectDetail>(resolveDetailUrl(id), {
      method: 'GET',
      headers: reellyHeaders(token),
    });

    const [mediaResult, paymentPlanResult, unitsResult] = await Promise.allSettled([
      requestJson<unknown>(resolveMediaUrl(id), {
        method: 'GET',
        headers: reellyHeaders(token),
      }),
      fetchCollectionResults(resolvePaymentPlanUrl(id), token),
      fetchUnitsResults(project, token),
    ]);

    if (mediaResult.status === 'fulfilled') {
      (project as Record<string, unknown>).reellyMedia = normalizeMediaPayload(mediaResult.value);
    } else {
      strapi.log.warn(`Project ${id}: unable to fetch media endpoint (${errorMessage(mediaResult.reason)}).`);
      (project as Record<string, unknown>).reellyMedia = {};
    }

    if (paymentPlanResult.status === 'fulfilled') {
      (project as Record<string, unknown>).reellyPaymentPlans = paymentPlanResult.value;
    } else {
      strapi.log.warn(
        `Project ${id}: unable to fetch payment plan endpoint (${errorMessage(paymentPlanResult.reason)}).`
      );
      (project as Record<string, unknown>).reellyPaymentPlans = [];
    }

    if (unitsResult.status === 'fulfilled') {
      (project as Record<string, unknown>).reellyUnits = unitsResult.value;
    } else {
      strapi.log.warn(`Project ${id}: unable to fetch units endpoint (${errorMessage(unitsResult.reason)}).`);
      (project as Record<string, unknown>).reellyUnits = [];
    }

    const mergedProjectRecord = mergeRecordPreferIncoming(existingSourceData, project as Record<string, unknown>);
    mergedProjectRecord.reellyMedia = mergeMediaField(
      (project as Record<string, unknown>).reellyMedia,
      existingSourceData.reellyMedia
    );
    mergedProjectRecord.reellyPaymentPlans = mergeArrayField(
      (project as Record<string, unknown>).reellyPaymentPlans,
      existingSourceData.reellyPaymentPlans
    );
    mergedProjectRecord.reellyUnits = mergeArrayField(
      (project as Record<string, unknown>).reellyUnits,
      existingSourceData.reellyUnits
    );
    project = mergedProjectRecord as ReellyProjectDetail;

    const mediaObject = asRecord((project as Record<string, unknown>).reellyMedia);
    const mediaImageCount = Array.isArray(mediaObject.images) ? (mediaObject.images as unknown[]).length : 0;
    const mediaFileCount = Array.isArray(mediaObject.files) ? (mediaObject.files as unknown[]).length : 0;
    const paymentPlanCount = Array.isArray((project as Record<string, unknown>).reellyPaymentPlans)
      ? ((project as Record<string, unknown>).reellyPaymentPlans as unknown[]).length
      : 0;
    const unitsCount = Array.isArray((project as Record<string, unknown>).reellyUnits)
      ? ((project as Record<string, unknown>).reellyUnits as unknown[]).length
      : 0;

    strapi.log.info(
      `Project ${id}: media images=${mediaImageCount}, media files=${mediaFileCount}, payment plans=${paymentPlanCount}, units=${unitsCount}.`
    );

    const districtName = normalizeDistrictName(project.district);

    const slugBase = slugify(`${project.name || `project-${id}`}-${districtName || 'uae'}`);
    const slug = slugBase || `project-${id}`;

    const rawFilePath = path.join(DATA_DIR, `${String(id).padStart(4, '0')}-${slug}.json`);
    await fs.writeFile(rawFilePath, JSON.stringify(project, null, 2), 'utf-8');

    const coverUrl = project.cover_image?.url ?? '';
    const coverLocalPath = coverUrl
      ? await downloadToFile(coverUrl, `${String(id).padStart(4, '0')}-${slug}-cover`, COVER_DIR)
      : null;

    let coverMediaId: number | undefined;

    if (coverLocalPath) {
      coverMediaId = await ensureUploadedFile(strapi, coverLocalPath);
    }

    const existingCoverMediaId = relationId(existingProperty?.image);
    if (!coverMediaId && existingCoverMediaId) {
      coverMediaId = existingCoverMediaId;
    }

    if (!coverMediaId && fallbackImage?.id) {
      coverMediaId = fallbackImage.id as number;
    }

    if (!coverMediaId) {
      strapi.log.warn(`Skipping project ${id}: no cover media could be resolved.`);
      continue;
    }

    const coverUrlKey = coverUrl ? normalizeUrlKey(coverUrl) : '';
    const projectImageUrls = collectProjectImageUrls(project).filter((url) => normalizeUrlKey(url) !== coverUrlKey);
    const galleryMediaIds: number[] = [];
    const galleryLocalPaths: string[] = [];

    for (let imageIndex = 0; imageIndex < projectImageUrls.length; imageIndex += 1) {
      const imageUrl = projectImageUrls[imageIndex];
      const downloadedPath = await downloadToFile(
        imageUrl,
        `${String(id).padStart(4, '0')}-${slug}-gallery-${String(imageIndex + 1).padStart(2, '0')}`,
        GALLERY_DIR
      );

      if (!downloadedPath) continue;

      const mediaId = await ensureUploadedFile(strapi, downloadedPath);
      if (!mediaId || galleryMediaIds.includes(mediaId)) continue;

      galleryMediaIds.push(mediaId);
      galleryLocalPaths.push(toRelativePath(downloadedPath));
    }

    const existingGalleryMediaIds = relationIds(existingProperty?.gallery);
    if (existingGalleryMediaIds.length > galleryMediaIds.length) {
      galleryMediaIds.push(...existingGalleryMediaIds.filter((mediaId) => !galleryMediaIds.includes(mediaId)));
    }

    if (!galleryMediaIds.includes(coverMediaId)) {
      galleryMediaIds.unshift(coverMediaId);

      if (coverLocalPath) {
        galleryLocalPaths.unshift(toRelativePath(coverLocalPath));
      }
    }

    let amenityDetails: Array<Record<string, unknown>> = [];

    for (const amenity of project.amenities ?? []) {
      const name = amenity.amenity?.name;
      const iconUrl = amenity.amenity?.icon?.url;
      if (!name) continue;

      let iconLocalPath: string | null = null;

      if (iconUrl) {
        iconLocalPath = await downloadToFile(
          iconUrl,
          `${String(id).padStart(4, '0')}-${slug}-${slugify(name) || 'amenity'}`,
          AMENITY_DIR
        );
      }

      amenityDetails.push({
        name,
        iconUrl: iconUrl ?? null,
        iconLocalPath: iconLocalPath ? toRelativePath(iconLocalPath) : null,
      });
    }

    const existingAmenityDetails = Array.isArray(existingProperty?.amenityDetails)
      ? (existingProperty.amenityDetails as Array<Record<string, unknown>>)
      : [];

    if (amenityDetails.length === 0 && existingAmenityDetails.length > 0) {
      amenityDetails = [...existingAmenityDetails];
    }

    const generalPlanUrl = getNestedImageUrl((project as Record<string, unknown>).general_plan);
    const generalPlanLocalPath = generalPlanUrl
      ? await downloadToFile(generalPlanUrl, `${String(id).padStart(4, '0')}-${slug}-general-plan`, PLAN_DIR)
      : null;
    let generalPlanMediaId = generalPlanLocalPath ? (await ensureUploadedFile(strapi, generalPlanLocalPath)) ?? null : null;

    const developerLogoUrl = getNestedImageUrl((project.developer as Record<string, unknown> | undefined)?.logo);
    const developerLogoLocalPath = developerLogoUrl
      ? await downloadToFile(developerLogoUrl, `${String(id).padStart(4, '0')}-${slug}-developer-logo`, LOGO_DIR)
      : null;
    let developerLogoMediaId = developerLogoLocalPath ? (await ensureUploadedFile(strapi, developerLogoLocalPath)) ?? null : null;

    const brokerObject = (project as Record<string, unknown>).broker as Record<string, unknown> | undefined;
    const brokerLogoUrl = getNestedImageUrl(brokerObject?.logo);
    const brokerLogoLocalPath = brokerLogoUrl
      ? await downloadToFile(brokerLogoUrl, `${String(id).padStart(4, '0')}-${slug}-broker-logo`, LOGO_DIR)
      : null;
    let brokerLogoMediaId = brokerLogoLocalPath ? (await ensureUploadedFile(strapi, brokerLogoLocalPath)) ?? null : null;

    if (!generalPlanMediaId) {
      generalPlanMediaId = relationId(existingProperty?.generalPlanImage);
    }

    if (!developerLogoMediaId) {
      developerLogoMediaId = relationId(existingProperty?.developerLogo);
    }

    if (!brokerLogoMediaId) {
      brokerLogoMediaId = relationId(existingProperty?.brokerLogo);
    }

    const brochureUrls = [...new Set(collectDocumentUrls(project))];
    const brochureMediaIds: number[] = [];
    const brochureLocalPaths: string[] = [];

    for (let brochureIndex = 0; brochureIndex < brochureUrls.length; brochureIndex += 1) {
      const brochureUrl = brochureUrls[brochureIndex];
      const brochurePath = await downloadToFile(
        brochureUrl,
        `${String(id).padStart(4, '0')}-${slug}-brochure-${String(brochureIndex + 1).padStart(2, '0')}`,
        BROCHURE_DIR
      );

      if (!brochurePath) continue;

      const mediaId = await ensureUploadedFile(strapi, brochurePath);
      if (!mediaId || brochureMediaIds.includes(mediaId)) continue;

      brochureMediaIds.push(mediaId);
      brochureLocalPaths.push(toRelativePath(brochurePath));
    }

    const existingBrochureMediaIds = relationIds(existingProperty?.brochures);
    if (existingBrochureMediaIds.length > brochureMediaIds.length) {
      brochureMediaIds.push(...existingBrochureMediaIds.filter((mediaId) => !brochureMediaIds.includes(mediaId)));
    }

    const payload = buildPropertyPayload(
      project,
      index,
      coverMediaId,
      galleryMediaIds,
      slug,
      amenityDetails,
      toRelativePath(rawFilePath),
      coverLocalPath ? toRelativePath(coverLocalPath) : null,
      generalPlanMediaId,
      developerLogoMediaId,
      brokerLogoMediaId,
      brochureMediaIds
    );

    if (String(payload.description ?? '').trim().length === 0 && typeof existingProperty?.description === 'string') {
      payload.description = existingProperty.description;
    }

    for (const locale of LOCALES) {
      await upsertPropertyByLocale(strapi, locale, String(payload.seedKey), payload);
    }

    const districtKey = districtMapKey(districtName);
    const currentDistrict = districtStats.get(districtKey);

    if (currentDistrict) {
      currentDistrict.listings += 1;
    } else {
      districtStats.set(districtKey, {
        name: districtName,
        listings: 1,
        imageMediaId: coverMediaId,
      });
    }

    importedProperties.push({
      id,
      slug,
      name: project.name,
      district: districtName,
      developer: payload.developerName,
      min_price: project.min_price,
      completion_date: project.construction_end_date,
      status: project.status,
      latitude: project.latitude,
      longitude: project.longitude,
      description: payload.description,
      cover_image_local: coverLocalPath ? toRelativePath(coverLocalPath) : null,
      raw_json_local: toRelativePath(rawFilePath),
      amenity_images: amenityDetails,
      gallery_images_local: galleryLocalPaths,
      general_plan_local: generalPlanLocalPath ? toRelativePath(generalPlanLocalPath) : null,
      developer_logo_local: developerLogoLocalPath ? toRelativePath(developerLogoLocalPath) : null,
      broker_logo_local: brokerLogoLocalPath ? toRelativePath(brokerLogoLocalPath) : null,
      brochures_local: brochureLocalPaths,
    });

    strapi.log.info(`Reelly import saved project ${id} (${index + 1}/${ids.length}).`);
    } catch (error) {
      hadImportFailures = true;
      strapi.log.error(`Project ${id}: import failed (${errorMessage(error)}).`);
    }

    if (REELLY_PAUSE_MS > 0) {
      await pause(REELLY_PAUSE_MS);
    }
  }

  let neighborhoodPayloads: NeighborhoodPayload[] = [];

  if (hadImportFailures) {
    strapi.log.warn('Reelly import completed with partial failures. Cleanup and neighborhood sync were skipped to avoid data loss.');
  } else {
    await cleanupNonImportedProperties(strapi, keepPropertySeedKeys);

    neighborhoodPayloads = buildNeighborhoodPayloads(districtStats);
    const keepNeighborhoodSeedKeys = new Set<string>();

    for (const neighborhood of neighborhoodPayloads) {
      keepNeighborhoodSeedKeys.add(neighborhood.seedKey);

      for (const locale of LOCALES) {
        await upsertNeighborhoodByLocale(strapi, locale, neighborhood.seedKey, neighborhood);
      }
    }

    await cleanupNonImportedNeighborhoods(strapi, keepNeighborhoodSeedKeys);
    await syncHomePageAreaFilters(
      strapi,
      neighborhoodPayloads.map((item) => item.name)
    );

    await fs.writeFile(NEIGHBORHOOD_EXPORT_FILE, JSON.stringify(neighborhoodPayloads, null, 2), 'utf-8');
  }

  await fs.writeFile(EXPORT_FILE, JSON.stringify(importedProperties, null, 2), 'utf-8');

  strapi.log.info(
    hadImportFailures
      ? `Reelly import saved ${importedProperties.length} projects with partial failures.`
      : `Reelly import completed. Imported ${importedProperties.length} projects and ${neighborhoodPayloads.length} neighborhoods.`
  );
};









