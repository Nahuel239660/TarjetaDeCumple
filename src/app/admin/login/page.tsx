import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { hasAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <main className="admin-login-site">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <p className="admin-eyebrow">Acceso privado</p>
        <h1 id="admin-login-title">Backstage</h1>
        <p>Ingresá la contraseña para administrar la invitación y las confirmaciones.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
