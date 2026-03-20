import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import SpaRedirectRestore from "@/components/SpaRedirectRestore";

export const metadata: Metadata = {
  title: {
    default: "CloudNest — Unified Google Drive Dashboard",
    template: "%s | CloudNest",
  },
  description:
    "Combine multiple Google Drive accounts into one dashboard. Free, open source, runs entirely in your browser.",
  metadataBase: new URL("https://encryptioner.github.io/CloudNest"),
  openGraph: {
    title: "CloudNest — Unified Google Drive Dashboard",
    description:
      "Combine multiple free Google accounts into one unified interface. No server needed.",
    url: "https://encryptioner.github.io/CloudNest",
    siteName: "CloudNest",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "CloudNest — Unified Google Drive Dashboard",
      },
    ],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://encryptioner.github.io/CloudNest",
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <SpaRedirectRestore />
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
