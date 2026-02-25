import { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, Globe, Menu, Phone, Plus, SunMoon, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { currencyOptions } from '@/lib/currency';
import { APP_ROUTES, isAppRoute, isDeprecatedMarketLink, resolveCmsHref } from '@/lib/siteRoutes';
import { uiCopy } from '@/lib/uiCopy';
import type { CurrencyCode, Locale, SiteConfigContent } from '@/types/content';
import type { ThemeMode } from '@/context/ThemeContext';

interface HeaderProps {
  config: SiteConfigContent;
  locale: Locale;
  currency: CurrencyCode;
  theme: ThemeMode;
  onLocaleChange: (locale: Locale) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onThemeChange: (theme: ThemeMode) => void;
}

const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'ar', label: 'AR' },
];

const Header = ({ config, locale, currency, theme, onLocaleChange, onCurrencyChange, onThemeChange }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copy = uiCopy[locale];

  const navLinks = useMemo(() => {
    const links = config.navLinks.length > 0 ? config.navLinks : [{ label: 'HOME', href: APP_ROUTES.home }];

    return links
      .filter((link) => !isDeprecatedMarketLink(link.href, link.label))
      .map((link) => {
        const href = resolveCmsHref(link.href, link.label);
        const label = href === APP_ROUTES.sell ? copy.propertyListingNav : link.label;

        return { label, href };
      });
  }, [config.navLinks, copy.propertyListingNav]);

  const ctaHref = resolveCmsHref(config.headerCtaHref, config.headerCtaLabel);

  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: 'dark', label: copy.themeDark },
    { value: 'light', label: copy.themeLight },
  ];

  const headerThemeClass = isScrolled
    ? theme === 'light'
      ? 'bg-white/95 backdrop-blur-xl border-b border-[#d9dce3]'
      : 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#333333]/50'
    : 'bg-transparent';

  const navInactiveClass = theme === 'light' ? 'text-[#374151] hover:text-[#d4a853]' : 'text-white/80 hover:text-[#d4a853]';
  const controlTextClass = theme === 'light' ? 'text-[#374151]' : 'text-white/80';
  const selectClass =
    theme === 'light'
      ? 'bg-white border border-[#d9dce3] text-[#111827] text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a853]'
      : 'bg-[#1a1a1a] border border-[#333333] text-white text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-[#d4a853]';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${headerThemeClass}`}
      style={{
        height: isScrolled ? '70px' : '90px',
      }}
    >
      <div className="h-full section-padding flex items-center justify-between">
        <Link to={APP_ROUTES.home} className="flex items-center gap-1 group">
          <span className={`text-2xl font-bold tracking-wider transition-all duration-300 ${isScrolled ? 'text-xl' : ''}`}>
            <span className={theme === 'light' ? 'text-[#111827]' : 'text-white'}>{config.brandMain}</span>
            <span className="text-[#d4a853]">{config.brandSuffix}</span>
          </span>
          <span className={theme === 'light' ? 'text-[#6b7280] text-xs tracking-[0.2em] uppercase hidden sm:block' : 'text-[#888888] text-xs tracking-[0.2em] uppercase hidden sm:block'}>
            {config.brandSubtext}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            isAppRoute(link.href) ? (
              <NavLink
                key={`${link.label}-${link.href}`}
                to={link.href}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-300 gold-underline ${
                    isActive ? 'text-[#d4a853]' : navInactiveClass
                  }`
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={`${navInactiveClass} text-sm font-medium tracking-wide transition-colors duration-300 gold-underline`}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <label className={`hidden md:flex items-center gap-2 ${controlTextClass}`}>
            <Globe className="w-4 h-4" />
            <select
              value={locale}
              onChange={(event) => onLocaleChange(event.target.value as Locale)}
              className={selectClass}
              aria-label="Language"
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`hidden md:flex items-center gap-2 ${controlTextClass}`}>
            <BadgeDollarSign className="w-4 h-4" />
            <select
              value={currency}
              onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
              className={selectClass}
              aria-label="Currency"
            >
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`hidden md:flex items-center gap-2 ${controlTextClass}`}>
            <SunMoon className="w-4 h-4" />
            <select
              value={theme}
              onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
              className={selectClass}
              aria-label={copy.themeMode}
            >
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <a href={`tel:${config.phone}`} className={`hidden md:flex items-center gap-2 ${navInactiveClass} transition-colors duration-300`}>
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">{config.phoneDisplay}</span>
          </a>

          {isAppRoute(ctaHref) ? (
            <Link
              to={ctaHref}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#d4a853] text-[#0a0a0a] text-sm font-semibold rounded-sm hover:bg-[#b8923d] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]"
            >
              <Plus className="w-4 h-4" />
              {config.headerCtaLabel}
            </Link>
          ) : (
            <a
              href={ctaHref}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#d4a853] text-[#0a0a0a] text-sm font-semibold rounded-sm hover:bg-[#b8923d] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]"
            >
              <Plus className="w-4 h-4" />
              {config.headerCtaLabel}
            </a>
          )}

          <button
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            className={`lg:hidden p-2 ${theme === 'light' ? 'text-[#111827] hover:text-[#d4a853]' : 'text-white hover:text-[#d4a853]'} transition-colors duration-300`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden fixed inset-0 top-[70px] backdrop-blur-xl transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        } ${theme === 'light' ? 'bg-white/95' : 'bg-[#0a0a0a]/98'}`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) =>
            isAppRoute(link.href) ? (
              <NavLink
                key={`${link.label}-${link.href}`}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-2xl font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'text-[#d4a853]'
                      : theme === 'light'
                        ? 'text-[#111827] hover:text-[#d4a853]'
                        : 'text-white hover:text-[#d4a853]'
                  }`
                }
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                {link.label}
              </NavLink>
            ) : (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${theme === 'light' ? 'text-[#111827]' : 'text-white'} text-2xl font-medium tracking-wide hover:text-[#d4a853] transition-all duration-300`}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                {link.label}
              </a>
            )
          )}

          <div className="flex items-center gap-2 mt-2">
            {localeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onLocaleChange(option.value)}
                className={`px-3 py-1 rounded-sm border text-xs ${
                  locale === option.value
                    ? 'border-[#d4a853] text-[#d4a853]'
                    : theme === 'light'
                      ? 'border-[#d9dce3] text-[#374151] hover:text-[#111827] hover:border-[#b9bec7]'
                      : 'border-[#333333] text-white/70 hover:text-white hover:border-[#555555]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onCurrencyChange(option.value)}
                className={`px-3 py-1 rounded-sm border text-xs ${
                  currency === option.value
                    ? 'border-[#d4a853] text-[#d4a853]'
                    : theme === 'light'
                      ? 'border-[#d9dce3] text-[#374151] hover:text-[#111827] hover:border-[#b9bec7]'
                      : 'border-[#333333] text-white/70 hover:text-white hover:border-[#555555]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onThemeChange(option.value)}
                className={`px-3 py-1 rounded-sm border text-xs ${
                  theme === option.value
                    ? 'border-[#d4a853] text-[#d4a853]'
                    : theme === 'light'
                      ? 'border-[#d9dce3] text-[#374151] hover:text-[#111827] hover:border-[#b9bec7]'
                      : 'border-[#333333] text-white/70 hover:text-white hover:border-[#555555]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <a href={`tel:${config.phone}`} className="flex items-center gap-2 text-[#d4a853] text-lg mt-2">
            <Phone className="w-5 h-5" />
            {config.phoneDisplay}
          </a>
        </nav>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent transition-transform duration-700 origin-center ${
          isScrolled ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </header>
  );
};

export default Header;
