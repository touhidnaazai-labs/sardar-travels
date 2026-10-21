import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { getMediaMap, getSiteSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [site, media] = await Promise.all([getSiteSettings(), getMediaMap()]);
  const og = site.seo.ogImageId ? media[site.seo.ogImageId] : undefined;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: site.seo.defaultTitle, template: `%s | ${site.siteName}` },
    description: site.seo.defaultDescription,
    applicationName: site.siteName,
    openGraph: {
      type: "website",
      siteName: site.siteName,
      locale: "en_IN",
      ...(og ? { images: [{ url: og.src, width: og.width, height: og.height, alt: og.alt }] } : {}),
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f1c3a",
};

/** Inject admin-configured brand colours as CSS custom properties. */
async function BrandStyle() {
  const { colors } = await getSiteSettings();
  const safe = (v: string, fallback: string) => (/^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback);
  const css = `:root{--brand-ink:${safe(colors.ink, "#0f1c3a")};--brand-ivory:${safe(colors.ivory, "#f2f5f8")};--brand-accent:${safe(colors.accent, "#3dd6c0")};--brand-forest:${safe(colors.forest, "#0e7c86")}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} antialiased`}>
      <head>
        <BrandStyle />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
