"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/actions";

const items = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/invitados", label: "Invitados" },
  { href: "/admin/invitacion", label: "Invitación" },
  { href: "/admin/imagenes", label: "Imágenes" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <Link href="/admin" className="admin-brand" aria-label="Nahuel B-Day, resumen">
          <span className="admin-brand__mark">N</span>
          <span className="admin-brand__name">Nahuel B-Day</span>
          <span className="admin-brand__divider">·</span>
          <span className="admin-brand__mode">Backstage</span>
        </Link>

        <nav className="admin-nav" aria-label="Administración del evento">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-header__actions">
          <Link href="/" target="_blank" className="button button--quiet button--small">
            Ver invitación
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="admin-logout">Salir</button>
          </form>
        </div>
      </div>
    </header>
  );
}
