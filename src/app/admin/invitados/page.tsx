import { GuestsAdmin } from "@/components/admin/guests-admin";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  return <AdminPageFrame><GuestsAdmin /></AdminPageFrame>;
}
