import type { MetadataRoute } from "next";
import { getFooterPages, getPublishedDestinations, getPublishedTours, getServicesSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, pages, services] = await Promise.all([
    getPublishedTours(),
    getPublishedDestinations(),
    getFooterPages(),
    getServicesSettings(),
  ]);
  const staticPaths = [
    "/",
    "/tours",
    "/destinations",
    "/plan",
    "/contact",
    "/faq",
    ...(services.vehicle.enabled ? ["/vehicle-hire"] : []),
    ...(services.hotel.enabled ? ["/hotels"] : []),
    ...(services.intercity.enabled ? ["/intercity"] : []),
  ];
  return [
    ...staticPaths.map((p) => ({ url: siteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...tours.map((t) => ({ url: siteUrl(`/tours/${t.slug}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...destinations.map((d) => ({ url: siteUrl(`/destinations/${d.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...pages.map((p) => ({ url: siteUrl(`/info/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
