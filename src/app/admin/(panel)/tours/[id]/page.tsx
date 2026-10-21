import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Copy, ExternalLink } from "lucide-react";
import { db, schema } from "@/db";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, PageHeader } from "@/components/admin/ui";
import { TourForm } from "@/components/admin/tour-form";
import { deleteTour, duplicateTour } from "@/app/actions/admin/tours";
import { requireUser } from "@/lib/auth";
import { getAllDestinations, getMediaOptions } from "@/lib/admin-data";
import { isUuid } from "@/lib/admin-action";

export const metadata: Metadata = { title: "Edit tour" };

export default async function EditTour(props: PageProps<"/admin/tours/[id]">) {
  await requireUser("admin");
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const [[tour], links, media, destinations] = await Promise.all([
    db.select().from(schema.tours).where(eq(schema.tours.id, id)),
    db.select().from(schema.tourDestinations).where(eq(schema.tourDestinations.tourId, id)),
    getMediaOptions(),
    getAllDestinations(),
  ]);
  if (!tour) notFound();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/tours", label: "Tours" }}
        title={tour.title}
        description={<Badge tone={tour.published ? "published" : "draft"}>{tour.published ? "Published" : "Draft"}</Badge>}
        actions={
          <>
            {tour.published && (
              <Link href={`/tours/${tour.slug}`} target="_blank" className="btn btn-ghost !py-2"><ExternalLink className="size-4" /> View</Link>
            )}
            <form action={duplicateTour.bind(null, tour.id)}>
              <button className="btn btn-ghost !py-2"><Copy className="size-4" /> Duplicate</button>
            </form>
            <ConfirmButton action={deleteTour.bind(null, tour.id)} label="Delete tour" />
          </>
        }
      />
      <TourForm tour={tour} media={media} destinations={destinations} selectedDestinations={links.map((l) => l.destinationId)} />
    </>
  );
}
