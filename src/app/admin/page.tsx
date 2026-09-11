import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return <AdminPageFrame><AdminDashboard /></AdminPageFrame>;
}
