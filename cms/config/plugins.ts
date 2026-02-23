import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const cloudinaryName = env('CLOUDINARY_NAME');
  const cloudinaryKey = env('CLOUDINARY_KEY');
  const cloudinarySecret = env('CLOUDINARY_SECRET');
  const enableCloudinary = Boolean(cloudinaryName && cloudinaryKey && cloudinarySecret);

  return {
    i18n: {
      enabled: true,
      config: {
        defaultLocale: env('STRAPI_DEFAULT_LOCALE', 'en'),
        locales: ['en', 'fr', 'ar'],
      },
    },
    ...(enableCloudinary
      ? {
          upload: {
            config: {
              provider: 'cloudinary',
              providerOptions: {
                cloud_name: cloudinaryName,
                api_key: cloudinaryKey,
                api_secret: cloudinarySecret,
              },
              actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
              },
            },
          },
        }
      : {}),
  };
};

export default config;