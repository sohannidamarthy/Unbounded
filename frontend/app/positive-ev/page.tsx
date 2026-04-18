import { SeoPageShell } from "../components/SeoPageShell";
import { buildSeoMetadata } from "../components/seoData";

export const metadata = buildSeoMetadata("/positive-ev");

export default function PositiveEvSeoPage() {
  return <SeoPageShell path="/positive-ev" />;
}
