import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPageShell } from "../../components/SeoPageShell";
import {
  POSITIVE_EV_CHILD_SLUGS,
  buildSeoMetadata,
} from "../../components/seoData";

type PositiveEvChildPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return Array.from(POSITIVE_EV_CHILD_SLUGS).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: PositiveEvChildPageProps): Metadata {
  const path = `/positive-ev/${params.slug}`;

  if (!POSITIVE_EV_CHILD_SLUGS.has(params.slug)) {
    return buildSeoMetadata("/positive-ev");
  }

  return buildSeoMetadata(path);
}

export default function PositiveEvChildPage({
  params,
}: PositiveEvChildPageProps) {
  if (!POSITIVE_EV_CHILD_SLUGS.has(params.slug)) {
    notFound();
  }

  return <SeoPageShell path={`/positive-ev/${params.slug}`} />;
}
