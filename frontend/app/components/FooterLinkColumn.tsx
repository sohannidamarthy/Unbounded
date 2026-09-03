import type { FooterColumn } from './footerData';

export default function FooterLinkColumn({ title, links }: FooterColumn) {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </div>
  );
}
