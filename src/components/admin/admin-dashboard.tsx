"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEvent } from "@/components/event-provider";
import { formatGuestNumber, getGuestMetrics } from "@/lib/metrics";

function statusLabel(value: boolean | null) {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "Pendiente";
}

export function AdminDashboard() {
  const { state } = useEvent();
  const metrics = useMemo(() => getGuestMetrics(state.guests), [state.guests]);
  const recent = useMemo(
    () => state.guests
      .filter((guest) => guest.respondedAt)
      .toSorted((a, b) => (b.respondedAt ?? "").localeCompare(a.respondedAt ?? ""))
      .slice(0, 3),
    [state.guests],
  );
  const capacity = 70;
  const occupancy = Math.min(100, Math.round((metrics.realPeople / capacity) * 100));

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-title-row">
        <div>
          <p className="admin-eyebrow"><span className="status-dot status-dot--cyan" /> Evento en curso · lista activa</p>
          <h1>Resumen del Evento</h1>
        </div>
        <p className="sync-note">Última actualización: ahora</p>
      </div>

      <section className="headcount-panel">
        <div>
          <p className="admin-eyebrow admin-eyebrow--orange">Headcount operativo total</p>
          <p className="headcount-number"><strong>{metrics.realPeople}</strong> personas</p>
          <p>Total real calculado para catering y reservas: <b>{metrics.confirmed} confirmados directos + {metrics.plusOnes} acompañantes.</b></p>
        </div>
        <div className="metric-pills" aria-label="Resumen de respuestas">
          <span><i className="status-dot status-dot--cyan" />{metrics.confirmed} confirmados</span>
          <span><i className="status-dot status-dot--red" />{metrics.declined} no vienen</span>
          <span><i className="status-dot status-dot--orange" />{metrics.pending} pendientes</span>
          <span><i className="status-dot status-dot--violet" />{metrics.key} van a Key</span>
          <span><i className="status-dot" />{metrics.plusOnes} con +1</span>
        </div>
        <div className="capacity-bar" aria-label={`Ocupación actual ${occupancy}%`}>
          <span style={{ width: `${occupancy}%` }} />
        </div>
        <div className="capacity-labels"><span>Capacidad objetivo salón: {capacity} pax max</span><span>Ocupación actual: {occupancy}%</span></div>
      </section>

      <section className="event-summary-grid">
        <article className="event-summary-card">
          <p className="admin-eyebrow admin-eyebrow--orange">Hito inicial · cena</p>
          <h2>{state.settings.peatonal.venue}</h2>
          <p>{state.settings.peatonal.address}</p>
          <dl>
            <div><dt>Horario</dt><dd>{state.content.peatonal.timeLabel}</dd></div>
            <div><dt>Asistentes</dt><dd className="cyan-text">{metrics.confirmed}</dd></div>
            <div><dt>Modalidad</dt><dd>Sector reservado</dd></div>
          </dl>
        </article>
        <article className="event-summary-card">
          <p className="admin-eyebrow admin-eyebrow--violet">After & club</p>
          <h2>{state.settings.key.venue}</h2>
          <p>Kevin de Vries DJ set</p>
          <dl>
            <div><dt>Horario ingreso</dt><dd>{state.content.key.timeLabel}</dd></div>
            <div><dt>Lista especial</dt><dd className="violet-text">{metrics.key} van directo</dd></div>
            <div><dt>Estado</dt><dd>{state.content.key.visible ? "Visible" : "Oculto"}</dd></div>
          </dl>
        </article>
        <article className="event-summary-card">
          <p className="admin-eyebrow">Control de acceso</p>
          <h2>Credencial QR <span className="status-badge">{state.settings.qrEnabled ? "ON" : "OFF"}</span></h2>
          <p>El QR es opcional y está {state.settings.qrEnabled ? "activado" : "desactivado"} para este evento.</p>
          <div className="inline-notice">El ingreso se gestiona por nombre en la lista de recepción.</div>
          <Link href="/admin/configuracion" className="button button--quiet button--block">Configurar credencial QR</Link>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <div>
          <div className="section-title-row">
            <h2>Últimas Confirmaciones <span className="status-dot status-dot--cyan" /></h2>
            <Link href="/admin/invitados">Ver todas ({state.guests.length}) →</Link>
          </div>
          <div className="recent-list">
            {recent.map((guest) => (
              <article key={guest.id}>
                <span className="guest-number">{formatGuestNumber(guest.guestNumber)}</span>
                <span className="avatar-initials">{guest.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <span className="recent-name"><strong>{guest.fullName}</strong><small>Respondió recientemente</small></span>
                {guest.hasPlusOne && <span className="status-badge">+1 {guest.plusOneName}</span>}
                <span className="recent-status"><b>Peatonal: {statusLabel(guest.attendingPeatonal)}</b><b>Key: {guest.attendingKey === "yes" ? "Sí" : guest.attendingKey === "maybe" ? "Duda" : "No"}</b></span>
              </article>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title-row"><h2>Accesos Rápidos</h2></div>
          <nav className="quick-links" aria-label="Accesos rápidos">
            <Link href="/admin/invitados"><span>01</span><b>Ver lista completa de invitados</b><small>Estados, pases y acompañantes</small><i>→</i></Link>
            <Link href="/admin/invitacion"><span>02</span><b>Editar textos de invitación</b><small>Horarios, textos y mensajes</small><i>→</i></Link>
            <Link href="/admin/imagenes"><span>03</span><b>Gestionar imágenes del evento</b><small>Fotos de portada y visuales nocturnas</small><i>→</i></Link>
            <Link href="/admin/configuracion"><span>04</span><b>Configurar parámetros y ubicación</b><small>Coordenadas, mapas y RSVP</small><i>→</i></Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
