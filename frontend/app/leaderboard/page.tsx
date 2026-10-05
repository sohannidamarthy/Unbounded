import { LeaderboardHubPage } from "../components/LeaderboardHubPage";
import { RequireAuth } from "../components/RequireAuth";

export default function LeaderboardPage() {
  return (
    <RequireAuth>
      <LeaderboardHubPage />
    </RequireAuth>
  );
}
