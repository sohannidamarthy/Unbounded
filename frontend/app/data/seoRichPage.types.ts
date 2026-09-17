export interface FeatureCard {
  title: string;
  description: string;
}

export interface HeadingContent {
  highlight: string;
  title: string;
  description: string;
}

export interface HeroButton {
  label: string;
  href?: string;
}

export interface HeroContent {
  titleLead: string;
  titleMiddle: string;
  titleHighlight: string;
  description: string;
  primaryButton: HeroButton;
  secondaryButton?: HeroButton;
  image: { src: string; alt: string };
}

export interface CardsSectionContent extends HeadingContent {
  cards: FeatureCard[];
}

export interface TickerSectionContent extends HeadingContent {
  tickerItems: string[];
}

export interface ComparisonRow {
  comparison: string;
  manual: string;
  unbound: string;
}

export interface ComparisonTableContent extends HeadingContent {
  manualColumnLabel: string;
  unboundColumnLabel: string;
  rows: ComparisonRow[];
}

export interface CtaBannerContent {
  highlight: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
}

export interface LegalityContent extends HeadingContent {
  marketsIntro: string;
  countries: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  description: string;
  items: FaqItem[];
}

export interface SeoRichPageContent {
  hero: HeroContent;
  findTheEdge: CardsSectionContent;
  whatIs: TickerSectionContent;
  ctaBanner: CtaBannerContent;
  validateOpportunities: CardsSectionContent;
  howUnboundWorks: CardsSectionContent;
  comparisonTable: ComparisonTableContent;
  opportunitiesCta: CtaBannerContent;
  logAndOrganize: CardsSectionContent;
  trackPAndL: CardsSectionContent;
  exploreStrategies: CardsSectionContent;
  finalCtaBanner: CtaBannerContent;
  legality: LegalityContent;
  faq: FaqContent;
}
