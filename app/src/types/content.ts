export type Locale = 'en' | 'fr' | 'ar';

export type Direction = 'ltr' | 'rtl';

export type CurrencyCode = 'AED' | 'USD' | 'EUR' | 'GBP';

export interface LinkItem {
  label: string;
  href: string;
}

export interface SocialLink extends LinkItem {
  platform: string;
}

export interface SiteConfigContent {
  brandMain: string;
  brandSuffix: string;
  brandSubtext: string;
  phone: string;
  phoneDisplay: string;
  headerCtaLabel: string;
  headerCtaHref: string;
  navLinks: LinkItem[];
  socialLinks: SocialLink[];
  footerDescription: string;
  quickLinksTitle: string;
  quickLinks: LinkItem[];
  featuredFooterTitle: string;
  contactTitle: string;
  contactAddress: string;
  contactEmail: string;
  appointmentLabel: string;
  newsletterTitle: string;
  newsletterText: string;
  newsletterPlaceholder: string;
  newsletterButtonLabel: string;
  rightsText: string;
  legalLinks: LinkItem[];
  backToTopLabel: string;
  loadingText: string;
}

export interface SearchFilter {
  key: string;
  label: string;
  icon: string;
  options: string[];
}

export interface HomePageContent {
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBackground: string;
  mediaMentionsLabel: string;
  mediaLogos: Array<{ name: string; widthClass: string }>;
  scrollLabel: string;
  searchTabs: Array<{ id: string; label: string }>;
  searchFilters: SearchFilter[];
  searchButtonLabel: string;
  offPlanLabel: string;
  offPlanTitle: string;
  offPlanTitleHighlight: string;
  offPlanFilterChips: string[];
  offPlanViewAllLabel: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutTitleHighlight: string;
  aboutLead: string;
  aboutBody: string;
  aboutFeatures: Array<{ icon: string; text: string }>;
  aboutAdditionalText: string;
  aboutCtaLabel: string;
  aboutImage: string;
  aboutImageAlt: string;
  aboutStats: Array<{ value: string; label: string }>;
  featuredPropertiesLabel: string;
  featuredPropertiesTitle: string;
  featuredPropertiesTitleHighlight: string;
  featuredBadgeLabel: string;
  featuredBannerLabel: string;
  featuredBannerTitle: string;
  featuredBannerTitleHighlight: string;
  featuredBannerDescription: string;
  featuredBannerCtaLabel: string;
  featuredBannerImage: string;
  featuredBannerAgent: { name: string; title: string };
  featuredBannerStats: Array<{ value: string; label: string }>;
  neighborhoodsLabel: string;
  neighborhoodsTitle: string;
  neighborhoodsTitleHighlight: string;
  neighborhoodsAreaLabel: string;
  neighborhoodsListingsLabel: string;
  neighborhoodsViewAllLabel: string;
  blogLabel: string;
  blogTitle: string;
  blogTitleHighlight: string;
  blogViewAllLabel: string;
  blogReadMoreLabel: string;
  faqLabel: string;
  faqTitle: string;
  faqTitleHighlight: string;
  faqDescription: string;
  faqContactQuestion: string;
  faqContactHelp: string;
  faqContactButton: string;
  propertyViewDetailsLabel: string;
  featuredBannerDiscoverLabel: string;
}

export interface PropertyAmenityContent {
  name: string;
  iconUrl?: string | null;
  iconLocalPath?: string | null;
}

export interface PropertyBusinessHourContent {
  day: string;
  time: string;
}

export interface PropertyOfficeContent {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  email?: string;
  workingHours?: PropertyBusinessHourContent[];
}

export interface PropertyInventoryContent {
  bedrooms: string;
  fromSizeSqFt?: number | null;
  totalUnits?: number | null;
}

export interface PropertyMediaFileContent {
  name: string;
  url: string;
  mime?: string;
}

export interface PropertyPaymentPlanStepContent {
  name: string;
  percentage?: number | null;
  fixedAmount?: number | null;
  stageType?: string;
  children: Array<{
    name: string;
    percentage?: number | null;
    fixedAmount?: number | null;
  }>;
}

export interface PropertyPaymentPlanContent {
  name: string;
  hasPostHandover?: boolean;
  steps: PropertyPaymentPlanStepContent[];
}

export interface PropertyUnitContent {
  name: string;
  priceAed?: number | null;
  sizeSqFt?: number | null;
  bedrooms?: number | null;
  status?: string;
  unitType?: string;
  layoutType?: string;
  pricePerArea?: number | null;
  layoutImages?: string[];
}

export interface PropertyReellyDetailsContent {
  launchDate?: string;
  constructionStartDate?: string;
  readinessProgress?: number | null;
  furnishing?: string;
  serviceCharge?: string;
  totalAreaSqFt?: number | null;
  maxFloor?: number | null;
  floors?: number | null;
  totalParkingLots?: number | null;
  unitTypes?: string;
  hasEscrow?: boolean;
  postHandover?: boolean;
  isBrandedProject?: boolean;
  hasChessboard?: boolean;
  depositDescription?: string;
  resaleConditions?: string;
  managingCompany?: string;
  generalPlanUrl?: string;
  brokerName?: string;
  developerDescription?: string;
  brokerDescription?: string;
  developerLogoUrl?: string;
  brokerLogoUrl?: string;
  brochures?: PropertyMediaFileContent[];
  brokerWebsite?: string;
  brokerOffice?: PropertyOfficeContent;
  developerOffice?: PropertyOfficeContent;
  developerWorkingHours?: PropertyBusinessHourContent[];
  inventories?: PropertyInventoryContent[];
  projectClass?: string;
  saleStatus?: string;
  isPartnerProject?: boolean;
  paymentPlans?: PropertyPaymentPlanContent[];
  units?: PropertyUnitContent[];
}

export interface PropertyContent {
  seedKey: string;
  slug?: string;
  title: string;
  location: string;
  price: string;
  priceAed?: number | null;
  pricePrefix?: string;
  priceSuffix?: string;
  beds: number;
  baths?: number;
  area: string;
  typeLabel: string;
  statusLabel: string;
  featured: boolean;
  showInOffPlan: boolean;
  showInFeaturedCarousel: boolean;
  showInFooter: boolean;
  order: number;
  agent?: { name: string; title: string };
  developerName?: string;
  completionDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  sourceUrl?: string;
  amenityDetails?: PropertyAmenityContent[];
  image: string;
  imageLarge?: string;
  galleryImages?: string[];
  reellyDetails?: PropertyReellyDetailsContent;
}

export interface NeighborhoodContent {
  seedKey: string;
  name: string;
  listings: number;
  size: 'large' | 'medium' | 'small';
  order: number;
  image: string;
}

export interface BlogPostContent {
  seedKey: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  readTime: string;
  category: string;
  featured: boolean;
  order: number;
  image: string;
}

export interface FaqCategoryContent {
  seedKey: string;
  title: string;
  order: number;
  items: Array<{ question: string; answer: string }>;
}

export interface PageContent {
  siteConfig: SiteConfigContent;
  homePage: HomePageContent;
  properties: PropertyContent[];
  neighborhoods: NeighborhoodContent[];
  blogPosts: BlogPostContent[];
  faqCategories: FaqCategoryContent[];
}


