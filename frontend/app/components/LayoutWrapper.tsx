'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname === '/auth';
  console.log('test');
  return (
    <>
    {children}
      {/* Paste your raw footer JSX directly here if it is not a module */}
      {!hideFooter && (
    <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <strong>Unbounded</strong>
            <span>Precision betting workflows, education, and account tools.</span>
          </div>
          <div className="footer-columns">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/arbitrage">Arbitrage</a>
              <a href="/positive-ev">Positive EV</a>
              <a href="/tools">Tools</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-column">
              <h4>Learn</h4>
              <a href="/tutorials">Discover</a>
              <a href="/status">Status</a>
              <a href="/billing">Billing</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/terms">Terms</a>
              <a href="/disclaimer">Disclaimer</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-legal">
            21+ only. Unbounded is an education, tracking, and workflow tool; it does not place bets or guarantee profit.
          </p>
          <span className="footer-copyright">
            © {new Date().getFullYear()} Unbounded
          </span>
        </div>
      </footer>
      )}
    </>
  );
}
