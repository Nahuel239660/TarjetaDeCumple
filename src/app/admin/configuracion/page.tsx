import { EventSettingsAdmin } from "@/components/admin/event-settings-admin";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  return <AdminPageFrame><EventSettingsAdmin /></AdminPageFrame>;
}
