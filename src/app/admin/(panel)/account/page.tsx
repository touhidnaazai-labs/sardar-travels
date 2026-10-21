import type { Metadata } from "next";
import { AdminForm, SubmitButton, TextField } from "@/components/admin/form";
import { Card, PageHeader } from "@/components/admin/ui";
import { changePassword } from "@/app/actions/admin/auth";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`${me.name} · ${me.email} · ${me.role}`} />
      <Card title="Change password" className="max-w-xl">
        <AdminForm action={changePassword} resetOnSuccess className="space-y-4">
          <TextField name="current" label="Current password" type="password" required />
          <TextField name="password" label="New password" type="password" required help="At least 10 characters" />
          <TextField name="confirm" label="Confirm new password" type="password" required />
          <SubmitButton>Update password</SubmitButton>
        </AdminForm>
      </Card>
    </>
  );
}
