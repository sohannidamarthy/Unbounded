import { ArbEvExpandedPage } from "../components/ArbEvExpandedPage";
import { RequireAuth } from "../components/RequireAuth";

export default function EvBetsPage() {
  return (
    <RequireAuth>
      <ArbEvExpandedPage initialView="ev" />
    </RequireAuth>
  );
}
