import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-site">
      <a href="#admin-content" className="skip-link">Saltar al contenido</a>
      <AdminNav />
      <main id="admin-content" className="admin-main">{children}</main>
    </div>
  );
}
