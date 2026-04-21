"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="site auth-page">
      <section className="auth-shell">
        <div className="auth-card">
          <p>Login and signup are temporarily disabled. Redirecting to dashboard...</p>
        </div>
      </section>
    </main>
  );
}
