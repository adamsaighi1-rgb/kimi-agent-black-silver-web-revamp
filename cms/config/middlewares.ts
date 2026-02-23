import type { Core } from '@strapi/strapi';

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const allowAll = env.bool('CORS_ALLOW_ALL', false);
  const envOrigins = env.array('CORS_ORIGINS', []);

  const stringOrigins = [...new Set([...defaultOrigins, ...envOrigins].filter(Boolean))];
  const regexOrigins = [/^https:\/\/.*\.pages\.dev$/, /^https:\/\/.*\.workers\.dev$/];

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: allowAll ? '*' : [...stringOrigins, ...regexOrigins],
        credentials: !allowAll,
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