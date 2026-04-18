import { SeoPageShell } from "../components/SeoPageShell";
import { buildSeoMetadata } from "../components/seoData";

export const metadata = buildSeoMetadata("/arbitrage");

export default function ArbitrageSeoPage() {
  return <SeoPageShell path="/arbitrage" />;
}
