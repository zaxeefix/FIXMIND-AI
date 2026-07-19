import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();
const title = "FixMind AI — The AI Copilot for Device Repair";
const description =
  "Diagnose smartphones, tablets and laptops in seconds with AI. Receive repair guidance, cost estimates, safety advice, and professional booking.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s | FixMind AI" },
  description,
  keywords: [
    "AI device diagnosis",
    "phone repair",
    "tablet repair",
    "laptop repair",
    "repair cost estimate",
    "device troubleshooting",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "FixMind AI",
    url: siteUrl,
    images: [{ url: "/fixmind-logo.png", width: 1536, height: 1024, alt: "FixMind AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/fixmind-logo.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FixMind AI",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  description,
  url: siteUrl,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Multimodal AI device diagnosis",
    "Repair confidence and cost estimation",
    "Safety-aware repair recommendations",
    "Professional repair booking",
  ],
  creator: { "@type": "Person", name: "Atam Isaiah Msughter" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
