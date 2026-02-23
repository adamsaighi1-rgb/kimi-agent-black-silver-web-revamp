import { useEffect } from 'react';

import type { SeoConfig } from '@/lib/seo';
import { applySeo } from '@/lib/seo';

export const useSeo = (config: SeoConfig) => {
  useEffect(() => {
    applySeo(config);
  }, [config]);
};
