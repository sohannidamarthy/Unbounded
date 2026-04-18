import { SeoPageShell } from "../components/SeoPageShell";
import { buildSeoMetadata } from "../components/seoData";

export const metadata = buildSeoMetadata("/tools");

export default function ToolsSeoPage() {
  return <SeoPageShell path="/tools" />;
}
