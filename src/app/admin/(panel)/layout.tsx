import { Suspense } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Skeleton } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";

async function SidebarWithUser() {
  const user = await getCurrentUser();
  return <Sidebar user={user} />;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div aria-hidden className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block" />}>
        <SidebarWithUser />
      </Suspense>
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <Suspense fallback={<Skeleton />}>{children}</Suspense>
        </main>
      </div>
    </>
  );
}
