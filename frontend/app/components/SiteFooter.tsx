import Image from 'next/image';
import FooterLinkColumn from './FooterLinkColumn';
import FooterSocialLinks from './FooterSocialLinks';
import Container from './container/Container';
import { footerColumns } from './footerData';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-columns">
          <div className="footer-brand">
            <div className='footer-logo'>
              <Image
                src="/unbounded.jpeg"
                alt="Unbounded logo"
                width={56}
                height={56}
                priority
              />
              <h3>Unbounded
                <span>Precision betting workflows, education, and account tools.</span>
              </h3>
              
            </div>
            <FooterSocialLinks />
          </div>
          {footerColumns.map((column) => (
            <FooterLinkColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
        <div className="footer-bottom">
          <p className="footer-legal">
            21+ only. Unbounded is an education, tracking, and workflow tool; it does not place bets or guarantee
            profit.
          </p>
          <span className="footer-copyright">© {new Date().getFullYear()} Unbounded</span>
        </div>
      </Container>
    </footer>
  );
}
