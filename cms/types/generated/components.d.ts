import type { Schema, Struct } from '@strapi/strapi';

export interface FaqItem extends Struct.ComponentSchema {
  collectionName: 'components_faq_items';
  info: {
    displayName: 'FAQ Item';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeAboutFeature extends Struct.ComponentSchema {
  collectionName: 'components_home_about_features';
  info: {
    displayName: 'About Feature';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SearchFilter extends Struct.ComponentSchema {
  collectionName: 'components_search_filters';
  info: {
    displayName: 'Search Filter';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    options: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface SharedAgent extends Struct.ComponentSchema {
  collectionName: 'components_shared_agents';
  info: {
    displayName: 'Agent';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMediaLogo extends Struct.ComponentSchema {
  collectionName: 'components_shared_media_logos';
  info: {
    displayName: 'Media Logo';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    widthClass: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    platform: Schema.Attribute.String;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stat';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'faq.item': FaqItem;
      'home.about-feature': HomeAboutFeature;
      'search.filter': SearchFilter;
      'shared.agent': SharedAgent;
      'shared.link': SharedLink;
      'shared.media-logo': SharedMediaLogo;
      'shared.social-link': SharedSocialLink;
      'shared.stat': SharedStat;
    }
  }
}
