import { notFound } from "next/navigation";

import { MarketingChrome } from "./MarketingChrome";
import { SeoPageClient } from "./SeoPageClient";
import { SEO_PAGES } from "./seoData";

type SeoPageShellProps = {
  path: string;
};

export function SeoPageShell({ path }: SeoPageShellProps) {
  const page = SEO_PAGES[path];

  if (!page) {
    notFound();
  }

  return (
    <MarketingChrome>
      <SeoPageClient page={page} />
    </MarketingChrome>
  );
}
