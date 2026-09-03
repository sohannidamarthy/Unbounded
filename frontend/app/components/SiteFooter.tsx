import FooterLinkColumn from './FooterLinkColumn';
import FooterSocialLinks from './FooterSocialLinks';
import { footerColumns } from './footerData';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <strong>Unbounded</strong>
          <span>Precision betting workflows, education, and account tools.</span>
          <FooterSocialLinks />
        </div>
        <div className="footer-columns">
          {footerColumns.map((column) => (
            <FooterLinkColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-legal">
          21+ only. Unbounded is an education, tracking, and workflow tool; it does not place bets or guarantee
          profit.
        </p>
        <span className="footer-copyright">© {new Date().getFullYear()} Unbounded</span>
      </div>
    </footer>
  );
}
