import "./globals.css";
import { SiteChatbot } from "./components/SiteChatbot";
import LayoutWrapper from "./components/LayoutWrapper";

export const metadata = {
  title: "Unbounded",
  description: "Unbounded frontend"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {process.env.NODE_ENV === "development" ? (
          <script
            // Prevent stale localhost service workers from serving old Next chunks.
            dangerouslySetInnerHTML={{
              __html:
                "if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(reg){reg.unregister();});});}"
            }}
          />
        ) : null}
        <LayoutWrapper>{children}</LayoutWrapper>
        <SiteChatbot />
      </body>
    </html>
  );
}
