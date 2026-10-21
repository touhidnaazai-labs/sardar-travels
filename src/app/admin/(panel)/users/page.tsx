import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { AdminForm, SelectField, SubmitButton, TextField, Toggle } from "@/components/admin/form";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { saveUser } from "@/app/actions/admin/settings";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Team" };

const ROLES = [
  { value: "staff", label: "Staff — enquiries only" },
  { value: "admin", label: "Administrator — everything" },
];

export default async function UsersAdmin() {
  const me = await requireUser("admin");
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.createdAt));
  return (
    <>
      <PageHeader title="Team" description="Staff can view and manage enquiries and quotes. Administrators can also edit the website, tours and settings." />
      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u.id} title={u.name} description={<span className="flex gap-2">{u.email} {u.id === me.id && <Badge tone="published">You</Badge>} {!u.active && <Badge tone="cancelled">Deactivated</Badge>}</span>}>
            <AdminForm action={saveUser} className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="id" value={u.id} />
              <TextField name="name" label="Name" defaultValue={u.name} />
              <TextField name="email" label="Email" defaultValue={u.email} />
              <SelectField name="role" label="Role" defaultValue={u.role} options={ROLES} />
              <TextField name="password" label="New password" type="password" help="Leave blank to keep" />
              <div className="flex items-center gap-3 md:col-span-4">
                <Toggle name="active" label="Active" defaultChecked={u.active} />
                <span className="text-xs text-muted">Last sign-in: {u.lastLoginAt ? u.lastLoginAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "never"}</span>
                <SubmitButton className="ml-auto" variant="dark">Save</SubmitButton>
              </div>
            </AdminForm>
          </Card>
        ))}
        <Card title="Add a team member">
          <AdminForm action={saveUser} resetOnSuccess className="grid gap-3 md:grid-cols-4">
            <TextField name="name" label="Name" required />
            <TextField name="email" label="Email" required />
            <SelectField name="role" label="Role" options={ROLES} />
            <TextField name="password" label="Temporary password" type="password" required help="At least 10 characters" />
            <div className="flex justify-end md:col-span-4"><SubmitButton>Create account</SubmitButton></div>
          </AdminForm>
        </Card>
      </div>
    </>
  );
}
