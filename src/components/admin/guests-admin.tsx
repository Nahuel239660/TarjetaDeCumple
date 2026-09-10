"use client";

import { type FormEvent, useDeferredValue, useMemo, useState } from "react";
import { useEvent } from "@/components/event-provider";
import { formatGuestNumber, getGuestMetrics } from "@/lib/metrics";
import type { Guest, KeyAttendance } from "@/lib/models";

type Filter = "all" | "confirmed" | "declined" | "pending" | "key" | "plus";
type SortKey = "guestNumber" | "fullName" | "attendingPeatonal" | "attendingKey" | "hasPlusOne" | "respondedAt";
type SortDirection = "asc" | "desc";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "confirmed", label: "Confirmados" },
  { id: "pending", label: "Pendientes" },
  { id: "declined", label: "No vienen" },
  { id: "key", label: "Key" },
  { id: "plus", label: "Con +1" },
];

function attendanceText(value: boolean | null): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "Pendiente";
}

function keyText(value: KeyAttendance): string {
  if (value === "yes") return "Sí";
  if (value === "no") return "No";
  if (value === "maybe") return "Duda";
  return "—";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function csvCell(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(guests: Guest[]) {
  const header = ["Número", "Nombre", "Peatonal", "Key", "+1", "Nombre +1", "Comentario", "Respuesta"];
  const rows = guests.map((guest) => [
    formatGuestNumber(guest.guestNumber),
    guest.fullName,
    attendanceText(guest.attendingPeatonal),
    keyText(guest.attendingKey),
    guest.hasPlusOne ? "Sí" : "No",
    guest.plusOneName,
    guest.comment,
    guest.respondedAt ?? "",
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "invitados-nahuel-bday.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function matchesFilter(guest: Guest, filter: Filter): boolean {
  if (filter === "confirmed") return guest.attendingPeatonal === true;
  if (filter === "declined") return guest.attendingPeatonal === false;
  if (filter === "pending") return guest.attendingPeatonal === null;
  if (filter === "key") return guest.attendingKey === "yes";
  if (filter === "plus") return guest.hasPlusOne;
  return true;
}

function compareGuests(a: Guest, b: Guest, key: SortKey): number {
  if (key === "guestNumber") return a.guestNumber - b.guestNumber;
  if (key === "fullName") return a.fullName.localeCompare(b.fullName, "es");
  if (key === "hasPlusOne") return Number(a.hasPlusOne) - Number(b.hasPlusOne);
  return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "es");
}

export function GuestsAdmin() {
  const { state, updateGuest, deleteGuest } = useEvent();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("guestNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [deleting, setDeleting] = useState<Guest | null>(null);
  const metrics = useMemo(() => getGuestMetrics(state.guests), [state.guests]);

  const visibleGuests = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase("es");
    return state.guests
      .filter((guest) => {
        const matchesQuery = !query || [guest.fullName, guest.plusOneName, formatGuestNumber(guest.guestNumber)]
          .some((value) => value.toLocaleLowerCase("es").includes(query));
        return matchesQuery && matchesFilter(guest, filter);
      })
      .toSorted((a, b) => {
        const comparison = compareGuests(a, b, sortKey);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [deferredSearch, filter, sortDirection, sortKey, state.guests]);

  function chooseSort(key: SortKey) {
    if (key === sortKey) setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function saveGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    updateGuest({ ...editing, plusOneName: editing.hasPlusOne ? editing.plusOneName : "" });
    setEditing(null);
  }

  function sortHeader(label: string, key: SortKey) {
    const active = sortKey === key;
    return (
      <button type="button" className="table-sort" onClick={() => chooseSort(key)}>
        {label}<span aria-hidden="true">{active ? (sortDirection === "asc" ? " ↑" : " ↓") : " ↕"}</span>
      </button>
    );
  }

  return (
    <div className="admin-page guests-page">
      <div className="admin-title-row guests-title-row">
        <div>
          <h1 className="admin-sans-title">Panel de Confirmaciones</h1>
          <div className="guest-metrics-line">
            <strong>{metrics.realPeople}</strong><span>personas</span><i />
            <span><b>{metrics.confirmed}</b> confirmados</span><span>·</span>
            <span><b>{metrics.declined}</b> no vienen</span><span>·</span>
            <span><b>{metrics.pending}</b> pendientes</span><span>·</span>
            <span><b>{metrics.key}</b> van a Key</span><span>·</span>
            <span><b>{metrics.plusOnes}</b> +1</span>
          </div>
        </div>
        <button type="button" className="button button--quiet" onClick={() => downloadCsv(visibleGuests)}>↓ CSV</button>
      </div>

      <div className="guest-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Buscar invitados</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, +1 o número..." />
        </label>
        <div className="filter-tabs" role="group" aria-label="Filtrar invitados">
          {filters.map((item) => (
            <button key={item.id} type="button" className={filter === item.id ? "is-active" : undefined} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="result-count">Mostrando {visibleGuests.length} de {state.guests.length} invitados</p>
      </div>

      <div className="guest-table-wrap">
        <table className="guest-table">
          <thead>
            <tr>
              <th aria-sort={sortKey === "guestNumber" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>{sortHeader("#", "guestNumber")}</th>
              <th aria-sort={sortKey === "fullName" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>{sortHeader("Nombre", "fullName")}</th>
              <th>{sortHeader("Peatonal", "attendingPeatonal")}</th>
              <th>{sortHeader("Key", "attendingKey")}</th>
              <th>{sortHeader("+1", "hasPlusOne")}</th>
              <th>Nombre +1</th>
              <th>Comentario</th>
              <th>{sortHeader("Respuesta", "respondedAt")}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleGuests.map((guest) => (
              <tr key={guest.id} className={guest.attendingPeatonal === false ? "is-declined" : undefined}>
                <td className="guest-number">{formatGuestNumber(guest.guestNumber)}</td>
                <td className="guest-name">{guest.fullName}</td>
                <td><span className={`attendance attendance--${guest.attendingPeatonal === true ? "yes" : guest.attendingPeatonal === false ? "no" : "pending"}`}>{attendanceText(guest.attendingPeatonal)}</span></td>
                <td><span className={`attendance attendance--${guest.attendingKey === "yes" ? "yes" : guest.attendingKey === "maybe" ? "pending" : guest.attendingKey === "no" ? "no" : "neutral"}`}>{keyText(guest.attendingKey)}</span></td>
                <td>{guest.hasPlusOne ? <span className="status-badge">Sí</span> : <span className="muted">No</span>}</td>
                <td>{guest.plusOneName || <span className="muted">—</span>}</td>
                <td className="guest-comment">{guest.comment || <em>Sin comentario</em>}</td>
                <td className="response-date">{formatDate(guest.respondedAt)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditing({ ...guest })} aria-label={`Editar a ${guest.fullName}`}>Editar</button>
                    <button type="button" onClick={() => setDeleting(guest)} aria-label={`Eliminar a ${guest.fullName}`}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleGuests.length === 0 && (
              <tr><td colSpan={9} className="empty-table">No hay invitados que coincidan con esta búsqueda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}>
          <aside className="edit-drawer" role="dialog" aria-modal="true" aria-labelledby="edit-guest-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div><p className="admin-eyebrow">{formatGuestNumber(editing.guestNumber)}</p><h2 id="edit-guest-title">Editar invitado</h2></div>
              <button type="button" className="icon-button" onClick={() => setEditing(null)} aria-label="Cerrar editor">×</button>
            </div>
            <form className="admin-form" onSubmit={saveGuest}>
              <label>Nombre<input required value={editing.fullName} onChange={(event) => setEditing({ ...editing, fullName: event.target.value })} /></label>
              <label>Peatonal<select value={editing.attendingPeatonal === null ? "pending" : String(editing.attendingPeatonal)} onChange={(event) => setEditing({ ...editing, attendingPeatonal: event.target.value === "pending" ? null : event.target.value === "true" })}><option value="true">Sí</option><option value="false">No</option><option value="pending">Pendiente</option></select></label>
              <label>Key<select value={editing.attendingKey ?? "pending"} onChange={(event) => setEditing({ ...editing, attendingKey: event.target.value === "pending" ? null : event.target.value as KeyAttendance })}><option value="yes">Sí</option><option value="no">No</option><option value="maybe">Todavía no sé</option><option value="pending">Pendiente</option></select></label>
              <label className="switch-row"><span>Viene con +1</span><input type="checkbox" checked={editing.hasPlusOne} onChange={(event) => setEditing({ ...editing, hasPlusOne: event.target.checked })} /></label>
              {editing.hasPlusOne && <label>Nombre +1<input required value={editing.plusOneName} onChange={(event) => setEditing({ ...editing, plusOneName: event.target.value })} /></label>}
              <label>Comentario<textarea rows={4} value={editing.comment} onChange={(event) => setEditing({ ...editing, comment: event.target.value })} /></label>
              <div className="form-actions"><button type="button" className="button button--quiet" onClick={() => setEditing(null)}>Cancelar</button><button className="button button--primary" type="submit">Guardar cambios</button></div>
            </form>
          </aside>
        </div>
      )}

      {deleting && (
        <div className="dialog-backdrop">
          <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-body">
            <p className="admin-eyebrow admin-eyebrow--red">Eliminar invitado</p>
            <h2 id="delete-title">¿Eliminar a {deleting.fullName}?</h2>
            <p id="delete-body">El número {formatGuestNumber(deleting.guestNumber)} no se reasignará a otro invitado.</p>
            <div className="form-actions"><button type="button" className="button button--quiet" onClick={() => setDeleting(null)}>Cancelar</button><button type="button" className="button button--danger" onClick={() => { deleteGuest(deleting.id); setDeleting(null); }}>Eliminar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
