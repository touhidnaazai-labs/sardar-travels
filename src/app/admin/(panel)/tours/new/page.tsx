import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { TourForm } from "@/components/admin/tour-form";
import { requireUser } from "@/lib/auth";
import { getAllDestinations, getMediaOptions } from "@/lib/admin-data";

export const metadata: Metadata = { title: "New tour" };

export default async function NewTour() {
  await requireUser("admin");
  const [media, destinations] = await Promise.all([getMediaOptions(), getAllDestinations()]);
  return (
    <>
      <PageHeader back={{ href: "/admin/tours", label: "Tours" }} title="New tour" description="New tours are saved as drafts until you tick “Published”." />
      <TourForm media={media} destinations={destinations} selectedDestinations={[]} />
    </>
  );
}
