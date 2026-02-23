import type { Core } from '@strapi/strapi';

const config = (): Core.Config.Middlewares => {
  return [
    'strapi::logger',
    'strapi::errors',
    'global::force-cors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: '*',
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        keepHeaderOnError: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;