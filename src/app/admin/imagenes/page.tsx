import { ImageManager } from "@/components/admin/image-manager";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  return <AdminPageFrame><ImageManager /></AdminPageFrame>;
}
