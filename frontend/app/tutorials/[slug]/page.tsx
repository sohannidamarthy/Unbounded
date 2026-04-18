import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoPageShell } from "../../components/SeoPageShell";
import {
  TUTORIAL_CHILD_SLUGS,
  buildSeoMetadata,
} from "../../components/seoData";

type TutorialChildPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return Array.from(TUTORIAL_CHILD_SLUGS).map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: TutorialChildPageProps): Metadata {
  const path = `/tutorials/${params.slug}`;

  if (!TUTORIAL_CHILD_SLUGS.has(params.slug)) {
    return buildSeoMetadata("/tutorials");
  }

  return buildSeoMetadata(path);
}

export default function TutorialChildPage({
  params,
}: TutorialChildPageProps) {
  if (!TUTORIAL_CHILD_SLUGS.has(params.slug)) {
    notFound();
  }

  return <SeoPageShell path={`/tutorials/${params.slug}`} />;
}
