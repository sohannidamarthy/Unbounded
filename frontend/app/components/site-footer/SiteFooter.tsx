import Image from 'next/image';
import FooterLinkColumn from './FooterLinkColumn';
import FooterSocialLinks from './FooterSocialLinks';
import Container from '../container/Container';
import { footerColumns } from './footerData';
import styles from './SiteFooter.module.css';


export default function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <Container className={styles.footerContainer}>
        <div className={styles.footerColumns}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
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
        <div className={styles.footerBottom}>
          <p className={styles.footerLegal}>
            21+ only. Unbounded is an education, tracking, and workflow tool; it does not place bets or guarantee
            profit.
          </p>
          <span className={styles.footerCopyright}>© {new Date().getFullYear()} Unbounded</span>
        </div>
      </Container>
    </footer>
  );
}
