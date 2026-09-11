import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventProvider } from "@/components/event-provider";
import { hasAdminSession } from "@/lib/auth";
import { getAdminEventState } from "@/lib/event-repository.server";

export async function AdminPageFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!await hasAdminSession()) redirect("/admin/login");
  const initialState = await getAdminEventState();

  return (
    <EventProvider initialState={initialState}>
      <div className="admin-site">
        <a href="#admin-content" className="skip-link">Saltar al contenido</a>
        <AdminNav />
        <main id="admin-content" className="admin-main">{children}</main>
      </div>
    </EventProvider>
  );
}
