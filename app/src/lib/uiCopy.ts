import type { Locale } from '@/types/content';

export const uiCopy = {
  en: {
    loading: 'Loading',
    propertyListingNav: 'PROPERTY LISTING',
    propertyListingLink: 'Property Listing',
    saleTab: 'Sales',
    searchPropertyType: 'PROPERTY TYPE',
    searchBedrooms: 'BEDROOMS',
    studio: 'Studio',
    searchArea: 'AREA',
    searchPrice: 'PRICE',
    resetFilters: 'Reset Filters',
    onRequest: 'On request',
    loadErrorTitle: 'Unable to load content',
    loadErrorBody: 'Strapi content is not available yet.',
    retry: 'Retry',
    agencyEyebrow: 'Robins Properties',
    agencyTitleMain: 'Agency',
    agencyTitleAccent: 'Team',
    agencyDescription: 'Team details sourced from robinsproperties.com/about-us with images downloaded locally for this website.',
    groupLeadership: 'Leadership',
    groupAdvisors: 'Advisors',
    groupAdministration: 'Administration',
    groupMarketing: 'Communication & Marketing',
  },
  fr: {
    loading: 'Chargement',
    propertyListingNav: 'LISTE DES BIENS',
    propertyListingLink: 'Liste des biens',
    saleTab: 'Vente',
    searchPropertyType: 'TYPE DE BIEN',
    searchBedrooms: 'CHAMBRES',
    studio: 'Studio',
    searchArea: 'SECTEUR',
    searchPrice: 'PRIX',
    resetFilters: 'Reinitialiser les filtres',
    onRequest: 'Sur demande',
    loadErrorTitle: 'Impossible de charger le contenu',
    loadErrorBody: 'Le contenu Strapi n\'est pas disponible pour le moment.',
    retry: 'Reessayer',
    agencyEyebrow: 'Robins Properties',
    agencyTitleMain: 'Equipe',
    agencyTitleAccent: 'Agence',
    agencyDescription: 'Details de l\'equipe extraits de robinsproperties.com/about-us avec images telechargees localement pour ce site.',
    groupLeadership: 'Direction',
    groupAdvisors: 'Conseillers',
    groupAdministration: 'Administration',
    groupMarketing: 'Communication & Marketing',
  },
  ar: {
    loading: '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644',
    propertyListingNav: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    propertyListingLink: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062a',
    saleTab: '\u0628\u064a\u0639',
    searchPropertyType: '\u0646\u0648\u0639 \u0627\u0644\u0639\u0642\u0627\u0631',
    searchBedrooms: '\u063a\u0631\u0641 \u0627\u0644\u0646\u0648\u0645',
    studio: '\u0627\u0633\u062a\u0648\u062f\u064a\u0648',
    searchArea: '\u0627\u0644\u0645\u0646\u0637\u0642\u0629',
    searchPrice: '\u0627\u0644\u0633\u0639\u0631',
    resetFilters: '\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637 \u0627\u0644\u0641\u0644\u0627\u062a\u0631',
    onRequest: '\u0639\u0646\u062f \u0627\u0644\u0637\u0644\u0628',
    loadErrorTitle: '\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062d\u062a\u0648\u0649',
    loadErrorBody: '\u0645\u062d\u062a\u0648\u0649 Strapi \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u0627\u064b.',
    retry: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629',
    agencyEyebrow: '\u0631\u0648\u0628\u0646\u0632 \u0628\u0631\u0648\u0628\u0631\u062a\u064a\u0632',
    agencyTitleMain: '\u0641\u0631\u064a\u0642',
    agencyTitleAccent: '\u0627\u0644\u0648\u0643\u0627\u0644\u0629',
    agencyDescription: '\u062a\u0645 \u062c\u0644\u0628 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0641\u0631\u064a\u0642 \u0645\u0646 robinsproperties.com/about-us \u0645\u0639 \u062a\u0646\u0632\u064a\u0644 \u0627\u0644\u0635\u0648\u0631 \u0645\u062d\u0644\u064a\u0627\u064b \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639.',
    groupLeadership: '\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
    groupAdvisors: '\u0627\u0644\u0645\u0633\u062a\u0634\u0627\u0631\u0648\u0646',
    groupAdministration: '\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
    groupMarketing: '\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644',
  },
} satisfies Record<Locale, {
  loading: string;
  propertyListingNav: string;
  propertyListingLink: string;
  saleTab: string;
  searchPropertyType: string;
  searchBedrooms: string;
  studio: string;
  searchArea: string;
  searchPrice: string;
  resetFilters: string;
  onRequest: string;
  loadErrorTitle: string;
  loadErrorBody: string;
  retry: string;
  agencyEyebrow: string;
  agencyTitleMain: string;
  agencyTitleAccent: string;
  agencyDescription: string;
  groupLeadership: string;
  groupAdvisors: string;
  groupAdministration: string;
  groupMarketing: string;
}>;