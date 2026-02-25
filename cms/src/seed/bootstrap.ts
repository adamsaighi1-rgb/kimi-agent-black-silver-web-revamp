import fs from 'node:fs/promises';
import path from 'node:path';

import type { Core } from '@strapi/strapi';

import {
  LOCALES,
  blogPostsSeed,
  faqCategoriesSeed,
  homePageSeed,
  neighborhoodsSeed,
  propertiesSeed,
  seedAssetFiles,
  siteConfigSeed,
  type LocaleCode,
} from './content';
import { importReellyProperties } from './reellyImport';

const SEED_ENABLED = process.env.SEED_ON_BOOTSTRAP !== 'false';
const ASSET_DIR = path.resolve(process.cwd(), 'seed-assets');

const PUBLIC_CONTENT_UIDS = [
  'api::site-config.site-config',
  'api::home-page.home-page',
  'api::property.property',
  'api::neighborhood.neighborhood',
  'api::blog-post.blog-post',
  'api::faq-category.faq-category',
] as const;

const mediaMime = (fileName: string) => {
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const publishIfPossible = async (documentsService: any, documentId: string, locale: LocaleCode) => {
  if (typeof documentsService.publish !== 'function') return;

  try {
    await documentsService.publish({ documentId, locale });
  } catch {
    // Ignore publish failures in environments that disable draft/publish publication in bootstrap.
  }
};

const ensureMediaMap = async (strapi: Core.Strapi) => {
  const mediaMap = new Map<string, number>();

  for (const fileName of seedAssetFiles) {
    const existing = await strapi.db.query('plugin::upload.file').findOne({
      where: { name: fileName },
    });

    if (existing?.id) {
      mediaMap.set(fileName, existing.id);
      continue;
    }

    const filePath = path.join(ASSET_DIR, fileName);
    await fs.access(filePath);
    const stat = await fs.stat(filePath);

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
        mimetype: mediaMime(fileName),
        size: stat.size,
      },
    });

    const created = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    if (created?.id) {
      mediaMap.set(fileName, created.id);
    }
  }

  return mediaMap;
};

const ensureLocales = async (strapi: Core.Strapi) => {
  const localeService = strapi.plugin('i18n').service('locales');
  const existingLocales = await localeService.find();

  for (const locale of LOCALES) {
    const exists = existingLocales.some((item: { code: string }) => item.code === locale.code);

    if (!exists) {
      await localeService.create(locale);
    }
  }

  await localeService.setDefaultLocale({ code: 'en' });
};

const upsertSingleByLocale = async (strapi: Core.Strapi, uid: string, locale: LocaleCode, data: any) => {
  const documentsService = strapi.documents(uid as any);
  const existing = await documentsService.findFirst({ locale });

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

const upsertCollectionByLocale = async (
  strapi: Core.Strapi,
  uid: string,
  locale: LocaleCode,
  seedKey: string,
  data: any
) => {
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

const configurePublicReadPermissions = async (strapi: Core.Strapi) => {
  const usersPermissions = strapi.plugin('users-permissions').service('users-permissions');
  await usersPermissions.syncPermissions();

  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
    populate: ['permissions'],
  });

  if (!publicRole) {
    return;
  }

  const allowedActions = new Set(PUBLIC_CONTENT_UIDS.flatMap((uid) => [`${uid}.find`, `${uid}.findOne`]));
  const managedPrefixes = PUBLIC_CONTENT_UIDS.map((uid) => `${uid}.`);

  for (const permission of publicRole.permissions ?? []) {
    const action = permission.action as string;
    const isManaged = managedPrefixes.some((prefix) => action.startsWith(prefix));

    if (isManaged && !allowedActions.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').delete({ where: { id: permission.id } });
    }
  }

  const existing = await strapi.db.query('plugin::users-permissions.permission').findMany({
    where: { role: { id: publicRole.id } },
  });

  const existingActions = new Set(existing.map((permission: { action: string }) => permission.action));

  for (const action of allowedActions) {
    if (existingActions.has(action)) continue;

    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action,
        role: publicRole.id,
      },
    });
  }
};

const seedLocalizedContent = async (strapi: Core.Strapi, mediaMap: Map<string, number>) => {
  const locales: LocaleCode[] = ['en', 'fr', 'ar'];

  for (const locale of locales) {
    await upsertSingleByLocale(strapi, 'api::site-config.site-config', locale, siteConfigSeed[locale]);

    await upsertSingleByLocale(strapi, 'api::home-page.home-page', locale, {
      ...homePageSeed[locale],
      heroBackground: mediaMap.get(homePageSeed[locale].heroBackground),
      aboutImage: mediaMap.get(homePageSeed[locale].aboutImage),
      featuredBannerImage: mediaMap.get(homePageSeed[locale].featuredBannerImage),
    });

    for (const property of propertiesSeed[locale]) {
      await upsertCollectionByLocale(strapi, 'api::property.property', locale, property.seedKey, {
        ...property,
        image: mediaMap.get(property.image),
      });
    }

    for (const neighborhood of neighborhoodsSeed[locale]) {
      await upsertCollectionByLocale(strapi, 'api::neighborhood.neighborhood', locale, neighborhood.seedKey, {
        ...neighborhood,
        image: mediaMap.get(neighborhood.image),
      });
    }

    for (const blogPost of blogPostsSeed[locale]) {
      await upsertCollectionByLocale(strapi, 'api::blog-post.blog-post', locale, blogPost.seedKey, {
        ...blogPost,
        image: mediaMap.get(blogPost.image),
      });
    }

    for (const faqCategory of faqCategoriesSeed[locale]) {
      await upsertCollectionByLocale(strapi, 'api::faq-category.faq-category', locale, faqCategory.seedKey, faqCategory);
    }
  }
};

export const bootstrapCms = async (strapi: Core.Strapi) => {
  await ensureLocales(strapi);
  await configurePublicReadPermissions(strapi);

  if (SEED_ENABLED) {
    const mediaMap = await ensureMediaMap(strapi);
    await seedLocalizedContent(strapi, mediaMap);
    strapi.log.info('Localized seed content has been applied.');
  } else {
    strapi.log.info('SEED_ON_BOOTSTRAP=false, skipping CMS data seeding.');
  }

  try {
    await importReellyProperties(strapi);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    strapi.log.error(`Reelly import failed: ${message}`);
  }
};


