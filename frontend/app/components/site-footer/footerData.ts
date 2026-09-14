export type FooterSocialLink = {
  href: string;
  label: string;
  icon: 'instagram' | 'facebook' | 'x' | 'reddit' | 'discord' | 'linkedin' | 'tiktok';
};

// TODO: replace with real social URLs
export const footerSocialLinks: FooterSocialLink[] = [
  { href: '#', label: 'Unbounded on Instagram', icon: 'instagram' },
  { href: '#', label: 'Unbounded on Facebook', icon: 'facebook' },
  { href: '#', label: 'Unbounded on X', icon: 'x' },
  { href: '#', label: 'Unbounded on Reddit', icon: 'reddit' },
  { href: '#', label: 'Unbounded on Discord', icon: 'discord' },
  { href: '#', label: 'Unbounded on LinkedIn', icon: 'linkedin' },
  { href: '#', label: 'Unbounded on TikTok', icon: 'tiktok' },
];

export type FooterLink = {
  href: string;
  label: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { href: '/arbitrage', label: 'Arbitrage' },
      { href: '/positive-ev', label: 'Positive EV' },
      { href: '/tools', label: 'Tools' },
      { href: '#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/tutorials', label: 'Discover' },
      { href: '/status', label: 'Status' },
      { href: '/billing', label: 'Billing' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/disclaimer', label: 'Disclaimer' },
    ],
  },
];
