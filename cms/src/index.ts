import type { Core } from '@strapi/strapi';

import { bootstrapCms } from './seed/bootstrap';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await bootstrapCms(strapi);
  },
};
