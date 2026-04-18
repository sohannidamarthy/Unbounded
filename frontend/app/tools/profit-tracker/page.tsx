import { SeoPageShell } from "../../components/SeoPageShell";
import { buildSeoMetadata } from "../../components/seoData";

export const metadata = buildSeoMetadata("/tools/profit-tracker");

export default function ToolsProfitTrackerSeoPage() {
  return <SeoPageShell path="/tools/profit-tracker" />;
}
