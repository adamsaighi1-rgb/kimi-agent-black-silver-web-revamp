export type LocaleCode = 'en' | 'fr' | 'ar';

type Localized<T> = Record<LocaleCode, T>;

export interface SiteConfigSeed {
  brandMain: string;
  brandSuffix: string;
  brandSubtext: string;
  phone: string;
  phoneDisplay: string;
  headerCtaLabel: string;
  headerCtaHref: string;
  navLinks: Array<{ label: string; href: string }>;
  socialLinks: Array<{ label: string; href: string; platform: string }>;
  footerDescription: string;
  quickLinksTitle: string;
  quickLinks: Array<{ label: string; href: string }>;
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
  legalLinks: Array<{ label: string; href: string }>;
  backToTopLabel: string;
  loadingText: string;
}

export interface HomePageSeed {
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBackground: string;
  mediaMentionsLabel: string;
  mediaLogos: Array<{ name: string; widthClass: string }>;
  scrollLabel: string;
  searchTabs: Array<{ id: string; label: string }>;
  searchFilters: Array<{ key: string; label: string; icon: string; options: string[] }>;
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

export interface PropertySeed {
  seedKey: string;
  title: string;
  location: string;
  price: string;
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
  image: string;
}

export interface NeighborhoodSeed {
  seedKey: string;
  name: string;
  listings: number;
  size: 'large' | 'medium' | 'small';
  order: number;
  image: string;
}

export interface BlogPostSeed {
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

export interface FaqCategorySeed {
  seedKey: string;
  title: string;
  order: number;
  items: Array<{ question: string; answer: string }>;
}

export const LOCALES: Array<{ code: LocaleCode; name: string }> = [
  { code: 'en', name: 'English (en)' },
  { code: 'fr', name: 'French (fr)' },
  { code: 'ar', name: 'Arabic (ar)' },
];

const baseLogos = [
  { name: 'BFM BUSINESS', widthClass: 'w-24' },
  { name: 'C NEWS', widthClass: 'w-16' },
  { name: 'Forbes', widthClass: 'w-20' },
  { name: 'Le Point', widthClass: 'w-16' },
];

const baseSearchFilters = [
  { key: 'type', label: 'PROPERTY TYPE', icon: 'home', options: ['Apartment', 'Duplex', 'Penthouse', 'Villa'] },
  { key: 'bedrooms', label: 'BEDROOMS', icon: 'bed', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
  {
    key: 'area',
    label: 'AREA',
    icon: 'map-pin',
    options: ['Downtown', 'Dubai Islands', 'Palm Deira', 'Siniya Island'],
  },
  {
    key: 'price',
    label: 'PRICE',
    icon: 'euro',
    options: ['0 - 500,000 EUR', '500,000 - 1,000,000 EUR', '1,000,000 - 2,000,000 EUR', '2,000,000+ EUR'],
  },
];

const baseProperties: PropertySeed[] = [
  {
    seedKey: 'green-field-warsan-4',
    title: 'Green Field Warsan 4',
    location: 'Dubai South',
    price: '195,258',
    pricePrefix: 'Starting from',
    beds: 2,
    area: '850 sqm',
    typeLabel: 'Sales',
    statusLabel: 'Off-plan',
    featured: true,
    showInOffPlan: true,
    showInFeaturedCarousel: false,
    showInFooter: false,
    order: 1,
    image: 'property-1.jpg',
  },
  {
    seedKey: 'inara-residence-dubai-south',
    title: 'Inara Residence Dubai South',
    location: 'Dubai South',
    price: '154,598',
    pricePrefix: 'Starting from',
    beds: 2,
    area: '650 sqm',
    typeLabel: 'Sales',
    statusLabel: 'Off-plan',
    featured: false,
    showInOffPlan: true,
    showInFeaturedCarousel: false,
    showInFooter: false,
    order: 2,
    image: 'property-2.jpg',
  },
  {
    seedKey: 'luxury-6-bed-mansion-reno',
    title: 'Luxury 6 Bed Mansion in Reno',
    location: 'Dubai Islands, Reno',
    price: '5,500,000',
    beds: 6,
    baths: 5,
    area: '12,000 sqm',
    typeLabel: 'Sales',
    statusLabel: 'Featured',
    featured: true,
    showInOffPlan: false,
    showInFeaturedCarousel: true,
    showInFooter: true,
    order: 10,
    image: 'property-5.jpg',
    agent: { name: 'Maria Barlow', title: 'Senior Consultant' },
  },
  {
    seedKey: 'penthouse-360-infinity-pool',
    title: 'Penthouse with 360 Infinity Pool',
    location: 'Wells Avenue, Reno',
    price: '2,100,000',
    pricePrefix: 'Starting from',
    beds: 3,
    baths: 2,
    area: '150 sqm',
    typeLabel: 'Sales',
    statusLabel: 'Active',
    featured: false,
    showInOffPlan: false,
    showInFeaturedCarousel: true,
    showInFooter: false,
    order: 11,
    image: 'property-3.jpg',
    agent: { name: 'Janet Richmond', title: 'Property Consultant' },
  },
];

const baseNeighborhoods: NeighborhoodSeed[] = [
  { seedKey: 'downtown', name: 'Downtown', listings: 12, size: 'large', order: 1, image: 'neighborhood-downtown.jpg' },
  { seedKey: 'dubai-islands', name: 'Dubai Islands', listings: 8, size: 'medium', order: 2, image: 'neighborhood-islands.jpg' },
  { seedKey: 'siniya-island', name: 'Siniya Island', listings: 5, size: 'medium', order: 3, image: 'neighborhood-siniya.jpg' },
];

const baseBlogs: BlogPostSeed[] = [
  {
    seedKey: 'buying-home-dubai-guide',
    title: 'Buying a Home in Dubai: Complete Guide',
    excerpt: 'Everything you need to know about purchasing property in Dubai as a foreign investor.',
    dateLabel: 'May 28, 2024',
    readTime: '8 min read',
    category: 'Guide',
    featured: true,
    order: 1,
    image: 'property-1.jpg',
  },
  {
    seedKey: 'selling-home-tips',
    title: 'Selling Your Home: Tips from Experts',
    excerpt: 'Increase your property value with expert recommendations for a smooth sale in Dubai.',
    dateLabel: 'May 27, 2024',
    readTime: '5 min read',
    category: 'Tips',
    featured: false,
    order: 2,
    image: 'property-2.jpg',
  },
];
const baseFaq: FaqCategorySeed[] = [
  {
    seedKey: 'faq-common',
    title: 'Frequently asked questions',
    order: 1,
    items: [
      {
        question: 'Is Dubai a secure real estate market?',
        answer: 'Yes. The market is tightly regulated by RERA with escrow and compliance controls for investor protection.',
      },
      {
        question: 'Why do investors choose Dubai?',
        answer: 'Dubai combines strong fundamentals, tax efficiency, modern infrastructure, and strong rental demand.',
      },
    ],
  },
  {
    seedKey: 'faq-strategy',
    title: 'Investment strategy and returns',
    order: 2,
    items: [
      {
        question: 'What ROI can I expect?',
        answer: 'Net rental yields are often between 6% and 10%, depending on district and property type.',
      },
      {
        question: 'When is the best time to invest?',
        answer: 'Pre-launch and VIP phases often offer better pricing and terms before public release.',
      },
    ],
  },
];

const baseHomePage: HomePageSeed = {
  heroTitleLine1: 'REAL ESTATE AGENCY',
  heroTitleHighlight: 'IN DUBAI',
  heroSubtitle: 'Robins Properties supports international investors in building high-yield real estate portfolios in Dubai.',
  heroBackground: 'hero-bg.jpg',
  mediaMentionsLabel: 'Featured in:',
  mediaLogos: baseLogos,
  scrollLabel: 'Scroll',
  searchTabs: [
    { id: 'sales', label: 'Sales' },
  ],
  searchFilters: baseSearchFilters,
  searchButtonLabel: 'Search Properties',
  offPlanLabel: 'Off-Plan Projects',
  offPlanTitle: 'Top off-plan opportunities in Dubai',
  offPlanTitleHighlight: 'selected by AI',
  offPlanFilterChips: ['Types', 'Categories', 'Regions', 'Cities', 'Status', 'Features'],
  offPlanViewAllLabel: 'View All Properties',
  aboutLabel: 'Robins Properties',
  aboutTitle: 'Agency expertise,',
  aboutTitleHighlight: 'AI precision',
  aboutLead: 'Our mission is not only to sell you a property.',
  aboutBody: 'We design and execute an investment strategy aligned with your financial goals and timeline.',
  aboutFeatures: [
    { icon: 'brain', text: 'AI-driven market intelligence' },
    { icon: 'trending-up', text: 'Selection based on your strategy' },
    { icon: 'key', text: 'Early access to VIP projects' },
    { icon: 'handshake', text: 'Financing support from our team' },
  ],
  aboutAdditionalText: 'Our AI market system continuously identifies opportunities by evaluating appreciation and rental performance.',
  aboutCtaLabel: 'Deploy your strategy',
  aboutImage: 'team-photo.jpg',
  aboutImageAlt: 'Robins Properties Team',
  aboutStats: [
    { value: '500+', label: 'Properties Sold' },
    { value: '98%', label: 'Client Satisfaction' },
  ],
  featuredPropertiesLabel: 'Selected by AI',
  featuredPropertiesTitle: 'Project of the',
  featuredPropertiesTitleHighlight: 'month',
  featuredBadgeLabel: 'Featured',
  featuredBannerLabel: 'Featured Property',
  featuredBannerTitle: 'Attractive Private Pool',
  featuredBannerTitleHighlight: 'Penthouse',
  featuredBannerDescription: 'Discover this exceptional penthouse with private pool and skyline views.',
  featuredBannerCtaLabel: 'Discover More',
  featuredBannerImage: 'featured-property.jpg',
  featuredBannerAgent: { name: 'Maria Barlow', title: 'Senior Consultant' },
  featuredBannerStats: [
    { value: '4', label: 'Bedrooms' },
    { value: '3', label: 'Bathrooms' },
    { value: '450', label: 'm2' },
  ],
  neighborhoodsLabel: 'Where to invest in Dubai',
  neighborhoodsTitle: 'Best neighborhoods',
  neighborhoodsTitleHighlight: 'to invest in Dubai',
  neighborhoodsAreaLabel: 'Investment Area',
  neighborhoodsListingsLabel: 'Listings',
  neighborhoodsViewAllLabel: 'Explore all neighborhoods',
  blogLabel: 'Dubai Real Estate News',
  blogTitle: 'Tips',
  blogTitleHighlight: '& Insights',
  blogViewAllLabel: 'View All Articles',
  blogReadMoreLabel: 'Read More',
  faqLabel: 'Complete FAQ',
  faqTitle: 'For',
  faqTitleHighlight: 'international investors',
  faqDescription: 'Everything you need to know before investing in Dubai real estate.',
  faqContactQuestion: 'Do you have more questions?',
  faqContactHelp: 'Our team is here to help you.',
  faqContactButton: 'Contact us',
  propertyViewDetailsLabel: 'View Details',
  featuredBannerDiscoverLabel: 'Discover More',
};

const mapProperties = (locale: LocaleCode): PropertySeed[] => {
  if (locale === 'en') return baseProperties;

  if (locale === 'fr') {
    return baseProperties.map((item) => ({
      ...item,
      typeLabel: 'Vente',
      statusLabel: item.statusLabel === 'Active' ? 'Actif' : item.statusLabel === 'Featured' ? 'Vedette' : 'Off-plan',
      pricePrefix: item.pricePrefix ? 'A partir de' : item.pricePrefix,
      priceSuffix: item.priceSuffix ? '/ mois' : item.priceSuffix,
    }));
  }

  return baseProperties.map((item) => ({
    ...item,
    typeLabel: '\u0628\u064a\u0639',
    statusLabel: item.statusLabel === 'Active' ? '\u0646\u0634\u0637' : item.statusLabel === 'Featured' ? '\u0645\u0645\u064a\u0632' : '\u0642\u064a\u062f \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
    pricePrefix: item.pricePrefix ? '\u0627\u0628\u062a\u062f\u0627\u0621\u064b \u0645\u0646' : item.pricePrefix,
    priceSuffix: item.priceSuffix ? '/ \u0634\u0647\u0631\u064a\u0627\u064b' : item.priceSuffix,
  }));
};

export const siteConfigSeed: Localized<SiteConfigSeed> = {
  en: {
    brandMain: 'ROBINS',
    brandSuffix: '.',
    brandSubtext: 'Properties',
    phone: '+971555097657',
    phoneDisplay: '+971 55 509 7657',
    headerCtaLabel: 'Add Listing',
    headerCtaHref: '#contact',
    navLinks: [
      { label: 'HOME', href: '#' },
      { label: 'PROPERTY LISTING', href: '#vendre' },
      { label: 'AGENCY', href: '#agence' },
      { label: 'BLOG', href: '#blog' },
      { label: 'CONTACT', href: '#contact' },
    ],
    socialLinks: [
      { label: 'Facebook', href: '#', platform: 'facebook' },
      { label: 'WhatsApp', href: '#', platform: 'whatsapp' },
      { label: 'Twitter', href: '#', platform: 'twitter' },
      { label: 'Instagram', href: '#', platform: 'instagram' },
      { label: 'LinkedIn', href: '#', platform: 'linkedin' },
      { label: 'YouTube', href: '#', platform: 'youtube' },
    ],
    footerDescription: 'Robins Properties is a luxury real estate agency helping global investors in Dubai.',
    quickLinksTitle: 'Quick Links',
    quickLinks: [
      { label: 'Home', href: '#' },
      { label: 'Property Listing', href: '#vendre' },
      { label: 'Blog', href: '#blog' },
      { label: 'Contact', href: '#contact' },
    ],
    featuredFooterTitle: 'Featured Projects',
    contactTitle: 'Contact',
    contactAddress: '3755 Commercial St SE Salem\nDubai, United Arab Emirates',
    contactEmail: 'contact@robinsproperties.com',
    appointmentLabel: 'Book an appointment',
    newsletterTitle: 'Stay informed about top opportunities',
    newsletterText: 'Get curated off-plan projects and market analysis in your inbox.',
    newsletterPlaceholder: 'Your email',
    newsletterButtonLabel: 'Subscribe',
    rightsText: '(c) 2026 Robins Properties. All rights reserved.',
    legalLinks: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Legal Notice', href: '#' },
    ],
    backToTopLabel: 'Back to top',
    loadingText: 'Loading',
  },
  fr: {
    brandMain: 'ROBINS',
    brandSuffix: '.',
    brandSubtext: 'Properties',
    phone: '+971555097657',
    phoneDisplay: '+971 55 509 7657',
    headerCtaLabel: 'Ajouter une annonce',
    headerCtaHref: '#contact',
    navLinks: [
      { label: 'ACCUEIL', href: '#' },
      { label: 'LISTE DES BIENS', href: '#vendre' },
      { label: 'AGENCE', href: '#agence' },
      { label: 'BLOG', href: '#blog' },
      { label: 'CONTACT', href: '#contact' },
    ],
    socialLinks: [
      { label: 'Facebook', href: '#', platform: 'facebook' },
      { label: 'WhatsApp', href: '#', platform: 'whatsapp' },
      { label: 'Twitter', href: '#', platform: 'twitter' },
      { label: 'Instagram', href: '#', platform: 'instagram' },
      { label: 'LinkedIn', href: '#', platform: 'linkedin' },
      { label: 'YouTube', href: '#', platform: 'youtube' },
    ],
    footerDescription: 'Robins Properties est une agence immobiliere premium a Dubai.',
    quickLinksTitle: 'Liens rapides',
    quickLinks: [
      { label: 'Accueil', href: '#' },
      { label: 'Liste des biens', href: '#vendre' },
      { label: 'Blog', href: '#blog' },
      { label: 'Contact', href: '#contact' },
    ],
    featuredFooterTitle: 'Projets vedettes',
    contactTitle: 'Contact',
    contactAddress: '3755 Commercial St SE Salem\nDubai, Emirats arabes unis',
    contactEmail: 'contact@robinsproperties.com',
    appointmentLabel: 'Prendre rendez-vous',
    newsletterTitle: 'Restez informe des meilleures opportunites',
    newsletterText: 'Recevez nos selections off-plan et analyses de marche.',
    newsletterPlaceholder: 'Votre email',
    newsletterButtonLabel: 'S\'inscrire',
    rightsText: '(c) 2026 Robins Properties. Tous droits reserves.',
    legalLinks: [
      { label: 'Politique de confidentialite', href: '#' },
      { label: 'Conditions d\'utilisation', href: '#' },
      { label: 'Mentions legales', href: '#' },
    ],
    backToTopLabel: 'Retour en haut',
    loadingText: 'Chargement',
  },
  ar: {
    brandMain: 'ROBINS',
    brandSuffix: '.',
    brandSubtext: '\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    phone: '+971555097657',
    phoneDisplay: '+971 55 509 7657',
    headerCtaLabel: '\u0623\u0636\u0641 \u0625\u0639\u0644\u0627\u0646\u0627\u064b',
    headerCtaHref: '#contact',
    navLinks: [
      { label: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', href: '#' },
      { label: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a', href: '#vendre' },
      { label: '\u0627\u0644\u0648\u0643\u0627\u0644\u0629', href: '#agence' },
      { label: '\u0627\u0644\u0645\u062f\u0648\u0646\u0629', href: '#blog' },
      { label: '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627', href: '#contact' },
    ],
    socialLinks: [
      { label: 'Facebook', href: '#', platform: 'facebook' },
      { label: 'WhatsApp', href: '#', platform: 'whatsapp' },
      { label: 'Twitter', href: '#', platform: 'twitter' },
      { label: 'Instagram', href: '#', platform: 'instagram' },
      { label: 'LinkedIn', href: '#', platform: 'linkedin' },
      { label: 'YouTube', href: '#', platform: 'youtube' },
    ],
    footerDescription: '\u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632 \u0648\u0643\u0627\u0644\u0629 \u0639\u0642\u0627\u0631\u064a\u0629 \u0641\u0627\u062e\u0631\u0629 \u062a\u062f\u0639\u0645 \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0627\u0644\u062f\u0648\u0644\u064a\u064a\u0646 \u0641\u064a \u062f\u0628\u064a.',
    quickLinksTitle: '\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629',
    quickLinks: [
      { label: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', href: '#' },
      { label: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a', href: '#vendre' },
      { label: '\u0627\u0644\u0645\u062f\u0648\u0646\u0629', href: '#blog' },
      { label: '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627', href: '#contact' },
    ],
    featuredFooterTitle: '\u0645\u0634\u0627\u0631\u064a\u0639 \u0645\u0645\u064a\u0632\u0629',
    contactTitle: '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627',
    contactAddress: '3755 Commercial St SE Salem\n\u062f\u0628\u064a\u060c \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629',
    contactEmail: 'contact@robinsproperties.com',
    appointmentLabel: '\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0627\u064b',
    newsletterTitle: '\u0627\u0628\u0642\u064e \u0639\u0644\u0649 \u0627\u0637\u0644\u0627\u0639 \u0628\u0623\u0641\u0636\u0644 \u0627\u0644\u0641\u0631\u0635',
    newsletterText: '\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u062a\u0631\u0634\u064a\u062d\u0627\u062a \u0645\u0634\u0627\u0631\u064a\u0639 \u0642\u064a\u062f \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0648\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0627\u0644\u0633\u0648\u0642 \u0641\u064a \u0628\u0631\u064a\u062f\u0643.',
    newsletterPlaceholder: '\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    newsletterButtonLabel: '\u0627\u0634\u062a\u0631\u0643',
    rightsText: '\u00a9 2026 \u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.',
    legalLinks: [
      { label: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629', href: '#' },
      { label: '\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645', href: '#' },
      { label: '\u0625\u0634\u0639\u0627\u0631 \u0642\u0627\u0646\u0648\u0646\u064a', href: '#' },
    ],
    backToTopLabel: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0623\u0639\u0644\u0649',
    loadingText: '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644',
  },
};

export const homePageSeed: Localized<HomePageSeed> = {
  en: baseHomePage,
  fr: {
    ...baseHomePage,
    heroTitleLine1: 'AGENCE IMMOBILIERE',
    heroTitleHighlight: 'A DUBAI',
    heroSubtitle: 'Robins Properties accompagne les investisseurs internationaux pour construire des portefeuilles immobiliers performants a Dubai.',
    mediaMentionsLabel: 'Presse :',
    scrollLabel: 'Defiler',
    searchTabs: [{ id: 'sales', label: 'Vente' }],
    searchFilters: [
      { key: 'type', label: 'TYPE DE BIEN', icon: 'home', options: ['Appartement', 'Duplex', 'Penthouse', 'Villa'] },
      { key: 'bedrooms', label: 'CHAMBRES', icon: 'bed', options: ['Studio', '1', '2', '3', '4', '5', '6+'] },
      { key: 'area', label: 'SECTEUR', icon: 'map-pin', options: ['Downtown', 'Dubai Islands', 'Palm Deira', 'Siniya Island'] },
      { key: 'price', label: 'PRIX', icon: 'coins', options: ['0 - 2 000 000 AED', '2 000 000 - 4 000 000 AED', '4 000 000 - 8 000 000 AED', '8 000 000+ AED'] },
    ],
    searchButtonLabel: 'Rechercher des biens',
    offPlanLabel: 'Projets Off-Plan',
    offPlanTitle: 'Meilleures opportunites off-plan a Dubai',
    offPlanTitleHighlight: 'selectionnees par IA',
    offPlanFilterChips: ['Types', 'Categories', 'Regions', 'Villes', 'Statuts', 'Atouts'],
    offPlanViewAllLabel: 'Voir tous les biens',
    aboutLabel: 'Robins Properties',
    aboutTitle: 'Expertise agence,',
    aboutTitleHighlight: 'precision IA',
    aboutLead: 'Notre mission ne se limite pas a vous vendre un bien.',
    aboutBody: 'Nous concevons et executons une strategie d\'investissement alignee sur vos objectifs financiers et votre horizon.',
    aboutFeatures: [
      { icon: 'brain', text: 'Intelligence de marche pilotee par IA' },
      { icon: 'trending-up', text: 'Selection adaptee a votre strategie' },
      { icon: 'key', text: 'Acces anticipe aux projets VIP' },
      { icon: 'handshake', text: 'Accompagnement financement par nos equipes' },
    ],
    aboutAdditionalText: 'Notre systeme IA detecte en continu les meilleures opportunites selon le potentiel de valorisation et de rendement locatif.',
    aboutCtaLabel: 'Lancer votre strategie',
    aboutImageAlt: 'Equipe Robins Properties',
    aboutStats: [
      { value: '500+', label: 'Biens vendus' },
      { value: '98%', label: 'Satisfaction client' },
    ],
    featuredPropertiesLabel: 'Selection IA',
    featuredPropertiesTitle: 'Projet du',
    featuredPropertiesTitleHighlight: 'mois',
    featuredBadgeLabel: 'A la une',
    featuredBannerLabel: 'Bien vedette',
    featuredBannerTitle: 'Penthouse exclusif',
    featuredBannerTitleHighlight: 'avec piscine privee',
    featuredBannerDescription: 'Decouvrez ce penthouse exceptionnel avec piscine privee et vue sur skyline.',
    featuredBannerCtaLabel: 'En savoir plus',
    featuredBannerAgent: { name: 'Maria Barlow', title: 'Consultante senior' },
    featuredBannerStats: [
      { value: '4', label: 'Chambres' },
      { value: '3', label: 'Salles de bain' },
      { value: '450', label: 'm2' },
    ],
    neighborhoodsLabel: 'Ou investir a Dubai',
    neighborhoodsTitle: 'Meilleurs quartiers',
    neighborhoodsTitleHighlight: 'pour investir a Dubai',
    neighborhoodsAreaLabel: 'Zone d\'investissement',
    neighborhoodsListingsLabel: 'Annonces',
    neighborhoodsViewAllLabel: 'Explorer tous les quartiers',
    blogLabel: 'Actualites Immobilieres Dubai',
    blogTitle: 'Conseils',
    blogTitleHighlight: '& Analyses',
    blogViewAllLabel: 'Voir tous les articles',
    blogReadMoreLabel: 'Lire la suite',
    faqLabel: 'FAQ complete',
    faqTitle: 'Pour',
    faqTitleHighlight: 'investisseurs internationaux',
    faqDescription: 'Tout ce qu\'il faut savoir avant d\'investir dans l\'immobilier a Dubai.',
    faqContactQuestion: 'Vous avez d\'autres questions ?',
    faqContactHelp: 'Notre equipe est la pour vous aider.',
    faqContactButton: 'Contactez-nous',
    propertyViewDetailsLabel: 'Voir les details',
    featuredBannerDiscoverLabel: 'En savoir plus',
  },
  ar: {
    ...baseHomePage,
    heroTitleLine1: '\u0648\u0643\u0627\u0644\u0629 \u0639\u0642\u0627\u0631\u064a\u0629',
    heroTitleHighlight: '\u0641\u064a \u062f\u0628\u064a',
    heroSubtitle: '\u062a\u062f\u0639\u0645 \u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632 \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0627\u0644\u062f\u0648\u0644\u064a\u064a\u0646 \u0644\u0628\u0646\u0627\u0621 \u0645\u062d\u0627\u0641\u0638 \u0639\u0642\u0627\u0631\u064a\u0629 \u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u0639\u0627\u0626\u062f \u0641\u064a \u062f\u0628\u064a.',
    mediaMentionsLabel: '\u0638\u0647\u0631\u0646\u0627 \u0641\u064a:',
    scrollLabel: '\u062a\u0645\u0631\u064a\u0631',
    searchTabs: [{ id: 'sales', label: '\u0628\u064a\u0639' }],
    searchFilters: [
      { key: 'type', label: '\u0646\u0648\u0639 \u0627\u0644\u0639\u0642\u0627\u0631', icon: 'home', options: ['\u0634\u0642\u0629', '\u062f\u0648\u0628\u0644\u0643\u0633', '\u0628\u0646\u062a\u0647\u0627\u0648\u0633', '\u0641\u064a\u0644\u0627'] },
      { key: 'bedrooms', label: '\u063a\u0631\u0641 \u0627\u0644\u0646\u0648\u0645', icon: 'bed', options: ['\u0627\u0633\u062a\u0648\u062f\u064a\u0648', '1', '2', '3', '4', '5', '6+'] },
      { key: 'area', label: '\u0627\u0644\u0645\u0646\u0637\u0642\u0629', icon: 'map-pin', options: ['Downtown', 'Dubai Islands', 'Palm Deira', 'Siniya Island'] },
      { key: 'price', label: '\u0627\u0644\u0633\u0639\u0631', icon: 'coins', options: ['0 - 2,000,000 AED', '2,000,000 - 4,000,000 AED', '4,000,000 - 8,000,000 AED', '8,000,000+ AED'] },
    ],
    searchButtonLabel: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    offPlanLabel: '\u0645\u0634\u0627\u0631\u064a\u0639 \u0642\u064a\u062f \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
    offPlanTitle: '\u0623\u0641\u0636\u0644 \u0641\u0631\u0635 \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0642\u064a\u062f \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0641\u064a \u062f\u0628\u064a',
    offPlanTitleHighlight: '\u0628\u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    offPlanFilterChips: ['\u0627\u0644\u0623\u0646\u0648\u0627\u0639', '\u0627\u0644\u0641\u0626\u0627\u062a', '\u0627\u0644\u0645\u0646\u0627\u0637\u0642', '\u0627\u0644\u0645\u062f\u0646', '\u0627\u0644\u062d\u0627\u0644\u0629', '\u0627\u0644\u0645\u0645\u064a\u0632\u0627\u062a'],
    offPlanViewAllLabel: '\u0639\u0631\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    aboutLabel: '\u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632',
    aboutTitle: '\u062e\u0628\u0631\u0629 \u0648\u0643\u0627\u0644\u0629,',
    aboutTitleHighlight: '\u062f\u0642\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    aboutLead: '\u0645\u0647\u0645\u062a\u0646\u0627 \u0644\u0627 \u062a\u0642\u062a\u0635\u0631 \u0639\u0644\u0649 \u0628\u064a\u0639 \u0639\u0642\u0627\u0631 \u0641\u0642\u0637.',
    aboutBody: '\u0646\u0636\u0639 \u0648\u0646\u0646\u0641\u0630 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0623\u0647\u062f\u0627\u0641\u0643 \u0627\u0644\u0645\u0627\u0644\u064a\u0629 \u0648\u0627\u0644\u0632\u0645\u0646\u064a\u0629.',
    aboutFeatures: [
      { icon: 'brain', text: '\u0631\u0624\u0649 \u0633\u0648\u0642\u064a\u0629 \u0645\u062f\u0639\u0648\u0645\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a' },
      { icon: 'trending-up', text: '\u0627\u062e\u062a\u064a\u0627\u0631 \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u062a\u0643' },
      { icon: 'key', text: '\u0648\u0635\u0648\u0644 \u0645\u0628\u0643\u0631 \u0625\u0644\u0649 \u0645\u0634\u0627\u0631\u064a\u0639 VIP' },
      { icon: 'handshake', text: '\u062f\u0639\u0645 \u0627\u0644\u062a\u0645\u0648\u064a\u0644 \u0645\u0646 \u0641\u0631\u064a\u0642\u0646\u0627' },
    ],
    aboutAdditionalText: '\u064a\u062d\u062f\u062f \u0646\u0638\u0627\u0645\u0646\u0627 \u0627\u0644\u0630\u0643\u064a \u0628\u0634\u0643\u0644 \u0645\u0633\u062a\u0645\u0631 \u0623\u0641\u0636\u0644 \u0627\u0644\u0641\u0631\u0635 \u0648\u0641\u0642 \u0625\u0645\u0643\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0645\u0648 \u0648\u0639\u0648\u0627\u0626\u062f \u0627\u0644\u0625\u064a\u062c\u0627\u0631.',
    aboutCtaLabel: '\u0623\u0637\u0644\u0642 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u062a\u0643',
    aboutImageAlt: '\u0641\u0631\u064a\u0642 \u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632',
    aboutStats: [
      { value: '500+', label: '\u0639\u0642\u0627\u0631\u0627\u062a \u0645\u0628\u0627\u0639\u0629' },
      { value: '98%', label: '\u0631\u0636\u0627 \u0627\u0644\u0639\u0645\u0644\u0627\u0621' },
    ],
    featuredPropertiesLabel: '\u0645\u062e\u062a\u0627\u0631 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a',
    featuredPropertiesTitle: '\u0645\u0634\u0631\u0648\u0639',
    featuredPropertiesTitleHighlight: '\u0627\u0644\u0634\u0647\u0631',
    featuredBadgeLabel: '\u0645\u0645\u064a\u0632',
    featuredBannerLabel: '\u0639\u0642\u0627\u0631 \u0645\u0645\u064a\u0632',
    featuredBannerTitle: '\u0628\u0646\u062a\u0647\u0627\u0648\u0633 \u0628\u0645\u0633\u0628\u062d \u062e\u0627\u0635',
    featuredBannerTitleHighlight: '\u0648\u0625\u0637\u0644\u0627\u0644\u0629 \u062e\u0644\u0627\u0628\u0629',
    featuredBannerDescription: '\u0627\u0643\u062a\u0634\u0641 \u0647\u0630\u0627 \u0627\u0644\u0628\u0646\u062a\u0647\u0627\u0648\u0633 \u0627\u0644\u0627\u0633\u062a\u062b\u0646\u0627\u0626\u064a \u0645\u0639 \u0645\u0633\u0628\u062d \u062e\u0627\u0635 \u0648\u0645\u0634\u0647\u062f \u0628\u0627\u0646\u0648\u0631\u0627\u0645\u064a.',
    featuredBannerCtaLabel: '\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0632\u064a\u062f',
    featuredBannerAgent: { name: 'Maria Barlow', title: '\u0645\u0633\u062a\u0634\u0627\u0631\u0629 \u0623\u0648\u0644\u0649' },
    featuredBannerStats: [
      { value: '4', label: '\u063a\u0631\u0641 \u0646\u0648\u0645' },
      { value: '3', label: '\u062d\u0645\u0627\u0645\u0627\u062a' },
      { value: '450', label: 'm2' },
    ],
    neighborhoodsLabel: '\u0623\u064a\u0646 \u062a\u0633\u062a\u062b\u0645\u0631 \u0641\u064a \u062f\u0628\u064a',
    neighborhoodsTitle: '\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0646\u0627\u0637\u0642',
    neighborhoodsTitleHighlight: '\u0644\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0641\u064a \u062f\u0628\u064a',
    neighborhoodsAreaLabel: '\u0645\u0646\u0637\u0642\u0629 \u0627\u0633\u062a\u062b\u0645\u0627\u0631',
    neighborhoodsListingsLabel: '\u0625\u0639\u0644\u0627\u0646\u0627\u062a',
    neighborhoodsViewAllLabel: '\u0627\u0633\u062a\u0639\u0631\u0636 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u0627\u0637\u0642',
    blogLabel: '\u0623\u062e\u0628\u0627\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a \u0641\u064a \u062f\u0628\u064a',
    blogTitle: '\u0646\u0635\u0627\u0626\u062d',
    blogTitleHighlight: '\u0648\u062a\u062d\u0644\u064a\u0644\u0627\u062a',
    blogViewAllLabel: '\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062a',
    blogReadMoreLabel: '\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f',
    faqLabel: '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629',
    faqTitle: '\u0644\u0644',
    faqTitleHighlight: '\u0644\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646 \u0627\u0644\u062f\u0648\u0644\u064a\u064a\u0646',
    faqDescription: '\u0643\u0644 \u0645\u0627 \u062a\u062d\u062a\u0627\u062c \u0645\u0639\u0631\u0641\u062a\u0647 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0641\u064a \u0639\u0642\u0627\u0631\u0627\u062a \u062f\u0628\u064a.',
    faqContactQuestion: '\u0647\u0644 \u0644\u062f\u064a\u0643 \u0627\u0633\u0626\u0644\u0629 \u0627\u062e\u0631\u0649\u061f',
    faqContactHelp: '\u0641\u0631\u064a\u0642\u0646\u0627 \u0647\u0646\u0627 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643.',
    faqContactButton: '\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627',
    propertyViewDetailsLabel: '\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644',
    featuredBannerDiscoverLabel: '\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0645\u0632\u064a\u062f',
  },
};

export const propertiesSeed: Localized<PropertySeed[]> = {
  en: mapProperties('en'),
  fr: mapProperties('fr'),
  ar: mapProperties('ar'),
};

export const neighborhoodsSeed: Localized<NeighborhoodSeed[]> = {
  en: baseNeighborhoods,
  fr: [
    { ...baseNeighborhoods[0], name: 'Centre-ville de Dubai' },
    { ...baseNeighborhoods[1], name: 'Iles de Dubai' },
    { ...baseNeighborhoods[2], name: 'Ile de Siniya' },
  ],
  ar: [
    { ...baseNeighborhoods[0], name: '\u0648\u0633\u0637 \u062f\u0628\u064a' },
    { ...baseNeighborhoods[1], name: '\u062c\u0632\u0631 \u062f\u0628\u064a' },
    { ...baseNeighborhoods[2], name: '\u062c\u0632\u064a\u0631\u0629 \u0627\u0644\u0633\u064a\u0646\u064a\u0629' },
  ],
};

export const blogPostsSeed: Localized<BlogPostSeed[]> = {
  en: baseBlogs,
  fr: [
    {
      ...baseBlogs[0],
      title: 'Acheter a Dubai : guide complet',
      excerpt: 'Tout ce qu\'il faut savoir pour acheter un bien a Dubai en tant qu\'investisseur etranger.',
      dateLabel: '28 mai 2024',
      readTime: '8 min de lecture',
      category: 'Guide',
    },
    {
      ...baseBlogs[1],
      title: 'Vendre son bien : conseils d\'experts',
      excerpt: 'Augmentez la valeur de votre bien avec des recommandations expertes pour une vente reussie a Dubai.',
      dateLabel: '27 mai 2024',
      readTime: '5 min de lecture',
      category: 'Conseils',
    },
  ],
  ar: [
    {
      ...baseBlogs[0],
      title: '\u062f\u0644\u064a\u0644 \u0634\u0631\u0627\u0621 \u0639\u0642\u0627\u0631 \u0641\u064a \u062f\u0628\u064a',
      excerpt: '\u0643\u0644 \u0645\u0627 \u062a\u062d\u062a\u0627\u062c \u0645\u0639\u0631\u0641\u062a\u0647 \u0644\u0634\u0631\u0627\u0621 \u0639\u0642\u0627\u0631 \u0641\u064a \u062f\u0628\u064a \u0643\u0645\u0633\u062a\u062b\u0645\u0631 \u0623\u062c\u0646\u0628\u064a.',
      dateLabel: '\u0662\u0668 \u0645\u0627\u064a\u0648 \u0662\u0660\u0662\u0664',
      readTime: '\u0668 \u062f\u0642\u0627\u0626\u0642 \u0642\u0631\u0627\u0621\u0629',
      category: '\u062f\u0644\u064a\u0644',
    },
    {
      ...baseBlogs[1],
      title: '\u0646\u0635\u0627\u0626\u062d \u0628\u064a\u0639 \u0627\u0644\u0639\u0642\u0627\u0631 \u0645\u0646 \u0627\u0644\u062e\u0628\u0631\u0627\u0621',
      excerpt: '\u0627\u0631\u0641\u0639 \u0642\u064a\u0645\u0629 \u0639\u0642\u0627\u0631\u0643 \u0628\u062a\u0648\u0635\u064a\u0627\u062a \u062e\u0628\u064a\u0631\u0629 \u0644\u0628\u064a\u0639 \u0633\u0644\u0633 \u0648\u0646\u0627\u062c\u062d \u0641\u064a \u062f\u0628\u064a.',
      dateLabel: '\u0662\u0667 \u0645\u0627\u064a\u0648 \u0662\u0660\u0662\u0664',
      readTime: '\u0665 \u062f\u0642\u0627\u0626\u0642 \u0642\u0631\u0627\u0621\u0629',
      category: '\u0646\u0635\u0627\u0626\u062d',
    },
  ],
};

export const faqCategoriesSeed: Localized<FaqCategorySeed[]> = {
  en: baseFaq,
  fr: [
    {
      ...baseFaq[0],
      title: 'Questions frequentes',
      items: [
        {
          question: 'Dubai est-il un marche immobilier sur ?',
          answer: 'Oui. Le marche est strictement regule par la RERA avec des controles d\'escrow et de conformite pour proteger les investisseurs.',
        },
        {
          question: 'Pourquoi les investisseurs choisissent Dubai ?',
          answer: 'Dubai combine fondamentaux solides, efficacite fiscale, infrastructures modernes et forte demande locative.',
        },
      ],
    },
    {
      ...baseFaq[1],
      title: 'Strategie d\'investissement et rendement',
      items: [
        {
          question: 'Quel ROI puis-je esperer ?',
          answer: 'Les rendements locatifs nets se situent souvent entre 6% et 10% selon la zone et le type de bien.',
        },
        {
          question: 'Quel est le meilleur moment pour investir ?',
          answer: 'Les phases pre-lancement et VIP proposent souvent de meilleurs prix et conditions avant la commercialisation publique.',
        },
      ],
    },
  ],
  ar: [
    {
      ...baseFaq[0],
      title: '\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629',
      items: [
        {
          question: '\u0647\u0644 \u062f\u0628\u064a \u0633\u0648\u0642 \u0639\u0642\u0627\u0631\u064a \u0622\u0645\u0646\u061f',
          answer: '\u0646\u0639\u0645. \u064a\u062e\u0636\u0639 \u0627\u0644\u0633\u0648\u0642 \u0644\u062a\u0646\u0638\u064a\u0645 \u0635\u0627\u0631\u0645 \u0645\u0646 RERA \u0645\u0639 \u0622\u0644\u064a\u0627\u062a \u062d\u0633\u0627\u0628 \u0636\u0645\u0627\u0646 \u0648\u0627\u0645\u062a\u062b\u0627\u0644 \u0644\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u064a\u0646.',
        },
        {
          question: '\u0644\u0645\u0627\u0630\u0627 \u064a\u062e\u062a\u0627\u0631 \u0627\u0644\u0645\u0633\u062a\u062b\u0645\u0631\u0648\u0646 \u062f\u0628\u064a\u061f',
          answer: '\u0644\u0623\u0646 \u062f\u0628\u064a \u062a\u062c\u0645\u0639 \u0628\u064a\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0627\u062a \u0627\u0644\u0642\u0648\u064a\u0629 \u0648\u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629 \u0648\u0627\u0644\u0628\u0646\u064a\u0629 \u0627\u0644\u062a\u062d\u062a\u064a\u0629 \u0627\u0644\u062d\u062f\u064a\u062b\u0629 \u0648\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0627\u064a\u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0631\u062a\u0641\u0639.',
        },
      ],
    },
    {
      ...baseFaq[1],
      title: '\u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0627\u0644\u0639\u0627\u0626\u062f',
      items: [
        {
          question: '\u0645\u0627 \u0646\u0633\u0628\u0629 \u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u0645\u062a\u0648\u0642\u0639\u0629\u061f',
          answer: '\u063a\u0627\u0644\u0628\u0627\u064b \u0645\u0627 \u062a\u062a\u0631\u0627\u0648\u062d \u0639\u0648\u0627\u0626\u062f \u0627\u0644\u0627\u064a\u062c\u0627\u0631 \u0627\u0644\u0635\u0627\u0641\u064a\u0629 \u0628\u064a\u0646 6% \u0648 10% \u062d\u0633\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0648\u0646\u0648\u0639 \u0627\u0644\u0639\u0642\u0627\u0631.',
        },
        {
          question: '\u0645\u062a\u0649 \u064a\u0643\u0648\u0646 \u0623\u0641\u0636\u0644 \u0648\u0642\u062a \u0644\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631\u061f',
          answer: '\u0639\u0627\u062f\u0629\u064b \u0645\u0627 \u062a\u0648\u0641\u0631 \u0645\u0631\u0627\u062d\u0644 \u0645\u0627 \u0642\u0628\u0644 \u0627\u0644\u0625\u0637\u0644\u0627\u0642 \u0648VIP \u0623\u0633\u0639\u0627\u0631\u0627\u064b \u0623\u0641\u0636\u0644 \u0648\u0634\u0631\u0648\u0637\u0627\u064b \u0623\u0642\u0648\u0649 \u0642\u0628\u0644 \u0627\u0644\u0637\u0631\u062d \u0627\u0644\u0639\u0627\u0645.',
        },
      ],
    },
  ],
};

export const seedAssetFiles = [
  'hero-bg.jpg',
  'team-photo.jpg',
  'featured-property.jpg',
  'property-1.jpg',
  'property-2.jpg',
  'property-3.jpg',
  'property-4.jpg',
  'property-5.jpg',
  'neighborhood-downtown.jpg',
  'neighborhood-islands.jpg',
  'neighborhood-siniya.jpg',
];


