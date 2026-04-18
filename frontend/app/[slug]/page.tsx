import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPageShell } from "../components/SeoPageShell";
import {
  ROOT_DYNAMIC_SEO_SLUGS,
  buildSeoMetadata,
} from "../components/seoData";

type RootSeoPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return Array.from(ROOT_DYNAMIC_SEO_SLUGS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: RootSeoPageProps): Metadata {
  const path = `/${params.slug}`;

  if (!ROOT_DYNAMIC_SEO_SLUGS.has(params.slug)) {
    return buildSeoMetadata("/");
  }

  return buildSeoMetadata(path);
}

export default function RootSeoPage({ params }: RootSeoPageProps) {
  if (!ROOT_DYNAMIC_SEO_SLUGS.has(params.slug)) {
    notFound();
  }

  return <SeoPageShell path={`/${params.slug}`} />;
}
