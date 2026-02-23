import type { Core } from '@strapi/strapi';

const isAllowedOrigin = (origin: string) => {
  if (!origin) return false;
  return (
    origin === 'https://robins-7p8.pages.dev' ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.workers.dev') ||
    origin === 'http://localhost:5173' ||
    origin === 'http://127.0.0.1:5173' ||
    origin === 'http://localhost:4173' ||
    origin === 'http://127.0.0.1:4173'
  );
};

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const origin = String(ctx?.request?.header?.origin ?? '');

    if (isAllowedOrigin(origin)) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
      ctx.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
      ctx.set('Vary', 'Origin');
    }

    ctx.set('X-Robins-Cors', '1');

    if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
    }

    await next();
  };
};