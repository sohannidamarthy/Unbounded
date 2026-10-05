import { ArbEvExpandedPage } from "../components/ArbEvExpandedPage";
import { RequireAuth } from "../components/RequireAuth";

export default function ArbitrageBetsPage() {
  return (
    <RequireAuth>
      <ArbEvExpandedPage initialView="arb" />
    </RequireAuth>
  );
}
