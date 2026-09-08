import type { FooterColumn } from './footerData';

export default function FooterLinkColumn({ title, links }: FooterColumn) {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
          <span>
            <svg width="6" height="10" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.20549 8.99992L2.01657e-07 16.5382L1.39731 18L10 8.99992L1.39731 0L2.01657e-07 1.46178L7.20549 8.99992Z" fill="currentColor" />
                    </svg>
          </span>
        </a>
      ))}
    </div>
  );
}
