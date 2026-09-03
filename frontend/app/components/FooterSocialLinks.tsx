import {
  DiscordIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  TikTokIcon,
  XIcon,
} from './SocialIcons';
import { footerSocialLinks, type FooterSocialLink } from './footerData';

const ICONS: Record<FooterSocialLink['icon'], () => JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
  reddit: RedditIcon,
  discord: DiscordIcon,
  linkedin: LinkedInIcon,
  tiktok: TikTokIcon,
};

export default function FooterSocialLinks() {
  return (
    <div className="footer-socials">
      {footerSocialLinks.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a key={label} className="footer-social-link" href={href} aria-label={label}>
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
