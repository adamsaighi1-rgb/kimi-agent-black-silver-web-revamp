import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen';
import SeoController from './components/SeoController';
import { useCurrency } from './context/CurrencyContext';
import { useLocale } from './context/LocaleContext';
import { filterProperties, type PropertyFilterCriteria } from './lib/propertyFilters';
import { APP_ROUTES } from './lib/siteRoutes';
import { uiCopy } from './lib/uiCopy';
import { mapContentBundle } from './lib/contentMapper';
import { fetchContentBundle } from './lib/strapi';
import type { PageContent } from './types/content';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import About from './sections/About';
import AgencyTeam from './sections/AgencyTeam';
import Blog from './sections/Blog';
import FAQ from './sections/FAQ';
import FeaturedBanner from './sections/FeaturedBanner';
import FeaturedProperties from './sections/FeaturedProperties';
import Footer from './sections/Footer';
import Header from './sections/Header';
import Hero from './sections/Hero';
import Neighborhoods from './sections/Neighborhoods';
import OffPlanProjects from './sections/OffPlanProjects';
import SearchPanel from './sections/SearchPanel';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_PROPERTY_FILTERS: PropertyFilterCriteria = {
  activeTab: 'sales',
  selectedOptions: {},
};

const HOME_OFFPLAN_FEATURED_LIMIT = 6;

interface PageRoutesProps {
  content: PageContent;
  offPlanProperties: PageContent['properties'];
  homeFeaturedOffPlanProperties: PageContent['properties'];
  filteredOffPlanProperties: PageContent['properties'];
  propertyFilters: PropertyFilterCriteria;
  onPropertyFiltersChange: (next: PropertyFilterCriteria) => void;
}

const PageRoutes = ({
  content,
  offPlanProperties,
  homeFeaturedOffPlanProperties,
  filteredOffPlanProperties,
  propertyFilters,
  onPropertyFiltersChange,
}: PageRoutesProps) => {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.home}
        element={
          <>
            <Hero content={content.homePage} />
            <SearchPanel content={content.homePage} properties={offPlanProperties} filters={propertyFilters} onFiltersChange={onPropertyFiltersChange} />
            <OffPlanProjects content={content.homePage} properties={homeFeaturedOffPlanProperties} />
            <About content={content.homePage} />
            <FeaturedProperties content={content.homePage} properties={content.properties} />
            <Neighborhoods content={content.homePage} neighborhoods={content.neighborhoods} />
            <FeaturedBanner content={content.homePage} />
            <Blog content={content.homePage} posts={content.blogPosts} />
            <FAQ content={content.homePage} categories={content.faqCategories} />
          </>
        }
      />

      <Route
        path={APP_ROUTES.sell}
        element={
          <>
            <Hero content={content.homePage} />
            <SearchPanel content={content.homePage} properties={offPlanProperties} filters={propertyFilters} onFiltersChange={onPropertyFiltersChange} />
            <OffPlanProjects content={content.homePage} properties={filteredOffPlanProperties} />
            <FeaturedProperties content={content.homePage} properties={content.properties} />
            <Neighborhoods content={content.homePage} neighborhoods={content.neighborhoods} />
            <FeaturedBanner content={content.homePage} />
          </>
        }
      />

      <Route
        path={APP_ROUTES.agency}
        element={
          <div className="pt-24">
            <About content={content.homePage} />
            <AgencyTeam />
            <FeaturedBanner content={content.homePage} />
            <FAQ content={content.homePage} categories={content.faqCategories} />
          </div>
        }
      />

      <Route
        path={APP_ROUTES.blog}
        element={
          <div className="pt-24">
            <Blog content={content.homePage} posts={content.blogPosts} />
            <FeaturedBanner content={content.homePage} />
          </div>
        }
      />

      <Route
        path={APP_ROUTES.contact}
        element={
          <div className="pt-24">
            <FAQ content={content.homePage} categories={content.faqCategories} />
            <FeaturedBanner content={content.homePage} />
          </div>
        }
      />

      <Route
        path={APP_ROUTES.propertyDetails}
        element={<PropertyDetailsPage properties={content.properties} config={content.siteConfig} />}
      />

      <Route path="/sell" element={<Navigate to={APP_ROUTES.sell} replace />} />
      <Route path="/buy" element={<Navigate to={APP_ROUTES.sell} replace />} />
      <Route path="/rent" element={<Navigate to={APP_ROUTES.sell} replace />} />

      <Route path="*" element={<Navigate to={APP_ROUTES.home} replace />} />
    </Routes>
  );
};

function App() {
  const { locale, setLocale } = useLocale();
  const { currency, setCurrency } = useCurrency();
  const copy = uiCopy[locale];
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<PageContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilterCriteria>(DEFAULT_PROPERTY_FILTERS);
  const mainRef = useRef<HTMLDivElement>(null);
  const contentCacheRef = useRef<Map<string, PageContent>>(new Map());

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadContent = async () => {
      const cached = contentCacheRef.current.get(locale);

      if (cached) {
        setContent(cached);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        setError(null);
        const bundle = await fetchContentBundle(locale, controller.signal);

        if (!active) return;

        const mapped = mapContentBundle(bundle);
        contentCacheRef.current.set(locale, mapped);
        setContent(mapped);
      } catch (loadError) {
        if (!active) return;

        setError(loadError instanceof Error ? loadError.message : copy.loadErrorBody);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      active = false;
      controller.abort();
    };
  }, [locale]);

  useEffect(() => {
    setPropertyFilters(DEFAULT_PROPERTY_FILTERS);
  }, [locale]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && mainRef.current) {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.fade-up').forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('.slide-left').forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, x: -50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('.slide-right').forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, x: 50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('.scale-in').forEach((element) => {
          gsap.fromTo(
            element,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('.stagger-container').forEach((container) => {
          const items = container.querySelectorAll('.stagger-item');
          gsap.fromTo(
            items,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: container,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        ScrollTrigger.refresh();
      }, mainRef);

      return () => ctx.revert();
    }
  }, [isLoading, location.pathname]);

  const offPlanProperties = useMemo(() => {
    if (!content) return [];
    return content.properties.filter((property) => property.showInOffPlan);
  }, [content]);

  const filteredOffPlanProperties = useMemo(() => {
    return filterProperties(offPlanProperties, propertyFilters);
  }, [offPlanProperties, propertyFilters]);

  const homeFeaturedOffPlanProperties = useMemo(() => {
    const featured = filteredOffPlanProperties.filter((property) => property.featured);
    if (featured.length > 0) {
      return featured.slice(0, HOME_OFFPLAN_FEATURED_LIMIT);
    }

    return filteredOffPlanProperties.slice(0, HOME_OFFPLAN_FEATURED_LIMIT);
  }, [filteredOffPlanProperties]);

  const fallbackLoadingText = content?.siteConfig.loadingText ?? copy.loading;
  const fallbackBrandMain = content?.siteConfig.brandMain ?? 'ROBINS';
  const fallbackBrandSuffix = content?.siteConfig.brandSuffix ?? '.';
  const fallbackBrandSubtext = content?.siteConfig.brandSubtext ?? 'Properties';

  return (
    <>
      <SeoController pathname={location.pathname} locale={locale} content={content} />
      {isLoading && (
        <LoadingScreen
          brandMain={fallbackBrandMain}
          brandSuffix={fallbackBrandSuffix}
          brandSubtext={fallbackBrandSubtext}
          loadingText={fallbackLoadingText}
        />
      )}

      <div ref={mainRef} className={`min-h-screen transition-opacity duration-500 bg-[#0a0a0a] ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {content ? (
          <>
            <Header
              config={content.siteConfig}
              locale={locale}
              currency={currency}
              onLocaleChange={setLocale}
              onCurrencyChange={setCurrency}
            />
            <main>
              <PageRoutes
                content={content}
                offPlanProperties={offPlanProperties}
                homeFeaturedOffPlanProperties={homeFeaturedOffPlanProperties}
                filteredOffPlanProperties={filteredOffPlanProperties}
                propertyFilters={propertyFilters}
                onPropertyFiltersChange={setPropertyFilters}
              />
            </main>
            <Footer config={content.siteConfig} footerProperties={content.properties.filter((property) => property.showInFooter)} />
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center section-padding">
            <div className="max-w-xl text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{copy.loadErrorTitle}</h1>
              <p className="text-[#888888] mb-6">{error ?? copy.loadErrorBody}</p>
              <button
                className="btn-gold"
                onClick={() => {
                  window.location.reload();
                }}
              >
                {copy.retry}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;