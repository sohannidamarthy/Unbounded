import { SeoPageShell } from "../components/SeoPageShell";
import { buildSeoMetadata } from "../components/seoData";

export const metadata = buildSeoMetadata("/tutorials");

export default function TutorialsSeoPage() {
  return <SeoPageShell path="/tutorials" />;
}
