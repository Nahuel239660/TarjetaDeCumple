import { InvitationEditor } from "@/components/admin/invitation-editor";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";

export const dynamic = "force-dynamic";

export default async function InvitationEditorPage() {
  return <AdminPageFrame><InvitationEditor /></AdminPageFrame>;
}
