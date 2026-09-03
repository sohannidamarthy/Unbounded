'use client';

import { usePathname } from 'next/navigation';

import SiteFooter from './SiteFooter';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname === '/auth';
  return (
    <>
      {children}
      {!hideFooter && <SiteFooter />}
    </>
  );
}
