import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SubmitButton, TextArea, TextField, Toggle } from "@/components/admin/form";
import { ImagePicker } from "@/components/admin/editors";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { deleteBusRoute, deleteVehicle, saveBusRoute, saveVehicle } from "@/app/actions/admin/content";
import { saveServicesSettings } from "@/app/actions/admin/settings";
import { requireUser } from "@/lib/auth";
import { getMediaOptions } from "@/lib/admin-data";
import { getServicesSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Services & vehicles" };

export default async function ServicesAdmin() {
  await requireUser("admin");
  const [svc, vehicles, routes, media] = await Promise.all([
    getServicesSettings(),
    db.select().from(schema.vehicles).orderBy(asc(schema.vehicles.sortOrder)),
    db.select().from(schema.busRoutes).orderBy(asc(schema.busRoutes.operator), asc(schema.busRoutes.sortOrder)),
    getMediaOptions(),
  ]);

  return (
    <>
      <PageHeader title="Services & vehicles" description="Configure vehicle hire, hotels, train, flight, visa and international package enquiries, and the optional intercity bus module." />

      <AdminForm action={saveServicesSettings} className="space-y-6">
        <Card title="Vehicle hire">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="vehicle.enabled" label="Offer vehicle hire on the website" defaultChecked={svc.vehicle.enabled} /></div>
            <TextField name="vehicle.heading" label="Page heading" defaultValue={svc.vehicle.heading} />
            <div />
            <TextArea name="vehicle.intro" label="Introduction" defaultValue={svc.vehicle.intro} rows={3} className="md:col-span-2" />
            <TextArea name="vehicle.serviceAreas" label="Service areas (one per line)" defaultValue={svc.vehicle.serviceAreas.join("\n")} rows={4} />
            <TextArea name="vehicle.categoryOptions" label="Vehicle types customers can request (one per line)" defaultValue={svc.vehicle.categoryOptions.join("\n")} rows={4} help="These are preferences in the enquiry form, not a claim of availability." />
            <div className="md:col-span-2"><ImagePicker name="vehicle.imageId" label="Image" media={media} value={svc.vehicle.imageId} /></div>
          </div>
        </Card>
        <Card title="Hotel reservations">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="hotel.enabled" label="Accept hotel reservation enquiries" defaultChecked={svc.hotel.enabled} /></div>
            <TextField name="hotel.heading" label="Page heading" defaultValue={svc.hotel.heading} />
            <div />
            <TextArea name="hotel.intro" label="Introduction" defaultValue={svc.hotel.intro} rows={3} className="md:col-span-2" />
            <TextArea name="hotel.destinations" label="Destinations (one per line)" defaultValue={svc.hotel.destinations.join("\n")} rows={4} />
            <TextArea name="hotel.budgetOptions" label="Budget options (one per line)" defaultValue={svc.hotel.budgetOptions.join("\n")} rows={4} />
            <div className="md:col-span-2"><ImagePicker name="hotel.imageId" label="Image" media={media} value={svc.hotel.imageId} /></div>
          </div>
        </Card>
        <Card title="Train ticket booking">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="train.enabled" label="Accept train booking enquiries" defaultChecked={svc.train.enabled} /></div>
            <TextField name="train.heading" label="Page heading" defaultValue={svc.train.heading} />
            <div />
            <TextArea name="train.intro" label="Introduction" defaultValue={svc.train.intro} rows={3} className="md:col-span-2" />
            <TextArea name="train.classOptions" label="Classes customers can request (one per line)" defaultValue={svc.train.classOptions.join("\n")} rows={4} help="Preferences in the form, not a claim of availability." className="md:col-span-2" />
            <div className="md:col-span-2"><ImagePicker name="train.imageId" label="Image" media={media} value={svc.train.imageId} /></div>
          </div>
        </Card>
        <Card title="Flight booking">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="flight.enabled" label="Accept flight booking enquiries" defaultChecked={svc.flight.enabled} /></div>
            <TextField name="flight.heading" label="Page heading" defaultValue={svc.flight.heading} />
            <div />
            <TextArea name="flight.intro" label="Introduction" defaultValue={svc.flight.intro} rows={3} className="md:col-span-2" />
            <TextArea name="flight.cabinOptions" label="Cabin options (one per line)" defaultValue={svc.flight.cabinOptions.join("\n")} rows={4} help="Preferences in the form, not a claim of availability." className="md:col-span-2" />
            <div className="md:col-span-2"><ImagePicker name="flight.imageId" label="Image" media={media} value={svc.flight.imageId} /></div>
          </div>
        </Card>
        <Card title="Visa assistance">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="visa.enabled" label="Accept visa assistance enquiries" defaultChecked={svc.visa.enabled} /></div>
            <TextField name="visa.heading" label="Page heading" defaultValue={svc.visa.heading} />
            <div />
            <TextArea name="visa.intro" label="Introduction" defaultValue={svc.visa.intro} rows={3} className="md:col-span-2" />
            <TextArea name="visa.visaTypes" label="Visa types (one per line)" defaultValue={svc.visa.visaTypes.join("\n")} rows={4} help="Shown as choices in the enquiry form." className="md:col-span-2" />
            <div className="md:col-span-2"><ImagePicker name="visa.imageId" label="Image" media={media} value={svc.visa.imageId} /></div>
          </div>
        </Card>
        <Card title="International packages">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="international.enabled" label="Accept international package enquiries" defaultChecked={svc.international.enabled} /></div>
            <TextField name="international.heading" label="Page heading" defaultValue={svc.international.heading} />
            <div />
            <TextArea name="international.intro" label="Introduction" defaultValue={svc.international.intro} rows={3} className="md:col-span-2" />
            <div className="md:col-span-2"><ImagePicker name="international.imageId" label="Image" media={media} value={svc.international.imageId} /></div>
          </div>
        </Card>
        <Card title="Intercity bus module" description="Only enable this if the business confirms it arranges these services. Operators are shown as independent, never as Sardar Travels-owned.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Toggle name="intercity.enabled" label="Enable intercity route enquiries" defaultChecked={svc.intercity.enabled} help="Adds the Intercity page, navigation link and planner tab." /></div>
            <TextField name="intercity.heading" label="Page heading" defaultValue={svc.intercity.heading} />
            <div />
            <TextArea name="intercity.intro" label="Introduction" defaultValue={svc.intercity.intro} rows={3} />
            <TextArea name="intercity.disclaimer" label="Operator disclaimer" defaultValue={svc.intercity.disclaimer} rows={3} />
            <div className="md:col-span-2"><ImagePicker name="intercity.imageId" label="Image" media={media} value={svc.intercity.imageId} /></div>
          </div>
        </Card>
        <div className="flex justify-end"><SubmitButton>Save services</SubmitButton></div>
      </AdminForm>

      <Card className="mt-10" title="Fleet" description="Vehicles appear on the Vehicle hire page only when marked both Verified and Published. Add only vehicles the business actually operates.">
        <ul className="space-y-4">
          {vehicles.map((v) => (
            <li key={v.id} className="rounded-xl border border-line p-4">
              <AdminForm action={saveVehicle} className="grid gap-3 md:grid-cols-6">
                <input type="hidden" name="id" value={v.id} />
                <TextField name="name" label="Name" defaultValue={v.name} required className="md:col-span-2" />
                <TextField name="category" label="Category" defaultValue={v.category} className="md:col-span-2" />
                <TextField name="seats" label="Seats" defaultValue={v.seats} className="md:col-span-1" />
                <TextField name="sortOrder" label="Order" type="number" defaultValue={v.sortOrder} className="md:col-span-1" />
                <TextArea name="description" label="Description" defaultValue={v.description} rows={2} className="md:col-span-3" />
                <TextArea name="features" label="Features (one per line)" defaultValue={v.features.join("\n")} rows={2} className="md:col-span-3" />
                <div className="md:col-span-6"><ImagePicker name="imageId" label="Photo" media={media} value={v.imageId} /></div>
                <div className="flex flex-wrap items-center gap-3 md:col-span-6">
                  <Toggle name="verified" label="Verified by the business" defaultChecked={v.verified} />
                  <Toggle name="published" label="Published" defaultChecked={v.published} />
                  <span className="ml-auto flex items-center gap-2">
                    <ConfirmButton action={deleteVehicle.bind(null, v.id)} />
                    <SubmitButton variant="dark">Save</SubmitButton>
                  </span>
                </div>
              </AdminForm>
            </li>
          ))}
        </ul>
        <details className="mt-4 rounded-xl border border-dashed border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">+ Add a vehicle</summary>
          <AdminForm action={saveVehicle} resetOnSuccess className="mt-4 grid gap-3 md:grid-cols-3">
            <TextField name="name" label="Name" required />
            <TextField name="category" label="Category" placeholder="e.g. Sedan" />
            <TextField name="seats" label="Seats" placeholder="e.g. 4 + driver" />
            <TextArea name="description" label="Description" rows={2} className="md:col-span-3" />
            <div className="flex items-center gap-3 md:col-span-3">
              <Toggle name="verified" label="Verified" />
              <Toggle name="published" label="Published" />
              <SubmitButton className="ml-auto" variant="dark">Add vehicle</SubmitButton>
            </div>
          </AdminForm>
        </details>
      </Card>

      <Card className="mt-6" title="Intercity routes" description="Destinations listed on the brochure. Never add schedules, fares or seat counts unless confirmed by the operator.">
        <ul className="divide-y divide-line">
          {routes.map((r) => (
            <li key={r.id} className="py-3">
              <AdminForm action={saveBusRoute} className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1fr_5rem_auto]">
                <input type="hidden" name="id" value={r.id} />
                <TextField name="operator" label="Operator" defaultValue={r.operator} />
                <TextField name="origin" label="From" defaultValue={r.origin} />
                <TextField name="destination" label="To" defaultValue={r.destination} />
                <TextField name="sortOrder" label="Order" type="number" defaultValue={r.sortOrder} />
                <div className="flex items-center gap-2 pb-1">
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="published" defaultChecked={r.published} /> Live</label>
                  <SubmitButton variant="ghost" className="!px-3">Save</SubmitButton>
                  <ConfirmButton action={deleteBusRoute.bind(null, r.id)} label="" confirmLabel="Delete?" />
                </div>
              </AdminForm>
            </li>
          ))}
        </ul>
        <AdminForm action={saveBusRoute} resetOnSuccess className="mt-4 grid items-end gap-3 rounded-xl bg-paper p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <TextField name="operator" label="Operator" required />
          <TextField name="origin" label="From" />
          <TextField name="destination" label="To" required />
          <input type="hidden" name="published" value="on" />
          <SubmitButton variant="dark">Add route</SubmitButton>
        </AdminForm>
        <p className="mt-3 text-xs text-muted">Routes show publicly only when the intercity module is enabled above. <Badge tone="draft">Currently {svc.intercity.enabled ? "enabled" : "disabled"}</Badge></p>
      </Card>
    </>
  );
}
