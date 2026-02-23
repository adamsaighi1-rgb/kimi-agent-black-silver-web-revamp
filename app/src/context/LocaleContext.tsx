import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { localeFromSearch } from '@/lib/seo';
import type { Direction, Locale } from '@/types/content';

interface LocaleContextValue {
  locale: Locale;
  dir: Direction;
  setLocale: (nextLocale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'robins-locale';

const isLocale = (value: string): value is Locale => value === 'en' || value === 'fr' || value === 'ar';

const syncLocaleQueryParam = (locale: Locale) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  if (locale === 'en') {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', locale);
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (next !== current) {
    window.history.replaceState({}, '', next);
  }
};

const resolveInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const queryLocale = localeFromSearch(window.location.search);

  if (queryLocale) {
    return queryLocale;
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  if (stored && isLocale(stored)) {
    return stored;
  }

  return 'en';
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    syncLocaleQueryParam(locale);
  }, [locale, dir]);

  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      dir,
      setLocale: (nextLocale: Locale) => {
        setLocaleState(nextLocale);
      },
    };
  }, [dir, locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
};
