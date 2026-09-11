"use client";

import { type FormEvent, useState } from "react";
import { useEvent } from "@/components/event-provider";
import { MapPreview } from "@/components/map-preview";
import { getDirectionsUrl } from "@/lib/directions";
import type { DirectionsProvider, EventSettings, LocationSettings } from "@/lib/models";

function LocationEditor({
  accent,
  location,
  title,
  onChange,
}: {
  accent: "orange" | "violet";
  location: LocationSettings;
  title: string;
  onChange: (location: LocationSettings) => void;
}) {
  const patch = (next: Partial<LocationSettings>) => onChange({ ...location, ...next });
  const directionsUrl = getDirectionsUrl(location);

  return (
    <section className={`settings-section settings-section--${accent}`}>
      <div className="settings-section__heading"><div><p className="admin-eyebrow">Ubicación</p><h2>{title}</h2></div><label className="switch-row switch-row--compact"><span>Preview en invitación</span><input type="checkbox" checked={location.showMap} onChange={(event) => patch({ showMap: event.target.checked })} /></label></div>
      <div className="form-grid">
        <label className="form-field"><span>Lugar</span><input value={location.venue} onChange={(event) => patch({ venue: event.target.value })} /></label>
        <label className="form-field"><span>Dirección</span><input value={location.address} onChange={(event) => patch({ address: event.target.value })} /></label>
        <label className="form-field"><span>Latitud</span><input className="mono-input" inputMode="decimal" value={location.latitude} onChange={(event) => patch({ latitude: event.target.value })} placeholder="Ej: -34.6037" /></label>
        <label className="form-field"><span>Longitud</span><input className="mono-input" inputMode="decimal" value={location.longitude} onChange={(event) => patch({ longitude: event.target.value })} placeholder="Ej: -58.3816" /></label>
      </div>
      <MapPreview location={location} />
      <div className="form-grid settings-directions">
        <label className="form-field"><span>Texto del botón</span><input value={location.directionsLabel} onChange={(event) => patch({ directionsLabel: event.target.value })} /></label>
        <fieldset className="provider-options"><legend>Proveedor de navegación</legend><div>
          {(["google", "waze", "custom"] as DirectionsProvider[]).map((provider) => (
            <label key={provider} className={location.directionsProvider === provider ? "is-active" : undefined}><input type="radio" name={`${title}-provider`} value={provider} checked={location.directionsProvider === provider} onChange={() => patch({ directionsProvider: provider })} />{provider === "google" ? "Google Maps" : provider === "waze" ? "Waze" : "URL propia"}</label>
          ))}
        </div></fieldset>
        {location.directionsProvider === "custom" && <label className="form-field form-field--wide"><span>URL personalizada</span><input type="url" value={location.customDirectionsUrl} onChange={(event) => patch({ customDirectionsUrl: event.target.value })} placeholder="https://" /></label>}
      </div>
      <div className="generated-link"><span>Enlace generado</span>{directionsUrl ? <a href={directionsUrl} target="_blank" rel="noreferrer">Probar dirección ↗</a> : <em>Completá la dirección o las coordenadas.</em>}</div>
    </section>
  );
}

function EventSettingsAdminReady() {
  const { state, updateSettings, error, saving } = useEvent();
  const [settings, setSettings] = useState<EventSettings>(() => structuredClone(state.settings));
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await updateSettings(settings)) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    }
  }

  return (
    <div className="admin-page settings-page">
      <div className="admin-title-row">
        <div><p className="admin-eyebrow">Parámetros del evento</p><h1>Configuración del Evento</h1><p className="admin-lead">Información general, ubicaciones y funciones opcionales.</p></div>
        <div className="title-actions"><button type="button" className="button button--quiet" onClick={() => setSettings(structuredClone(state.settings))}>Descartar</button><button form="settings-form" type="submit" className="button button--primary" disabled={saving}>Guardar cambios</button></div>
      </div>

      <form id="settings-form" className="settings-layout" onSubmit={save}>
        <div className="settings-main-column">
          <section className="settings-section">
            <div className="settings-section__heading"><div><p className="admin-eyebrow">Evento</p><h2>Parámetros Generales</h2></div></div>
            <div className="form-grid">
              <label className="form-field"><span>Nombre del evento</span><input value={settings.eventName} onChange={(event) => setSettings({ ...settings, eventName: event.target.value })} /></label>
              <label className="form-field"><span>Fecha</span><input type="date" value={settings.eventDate} onChange={(event) => setSettings({ ...settings, eventDate: event.target.value })} /></label>
              <label className="form-field"><span>Ciudad</span><input value={settings.cityLabel} onChange={(event) => setSettings({ ...settings, cityLabel: event.target.value })} /></label>
              <label className="form-field"><span>Zona horaria</span><select value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })}><option>GMT-3 (Buenos Aires / Montevideo)</option><option>GMT-3 (Brasilia)</option></select></label>
            </div>
          </section>

          <LocationEditor title="Ubicación Primaria (Peatonal)" accent="orange" location={settings.peatonal} onChange={(peatonal) => setSettings({ ...settings, peatonal })} />
          <LocationEditor title="Segunda Ubicación (Key Club)" accent="violet" location={settings.key} onChange={(key) => setSettings({ ...settings, key })} />
        </div>

        <aside className="settings-side-column">
          <section className="settings-section qr-settings">
            <div className="qr-title"><span aria-hidden="true">▦</span><div><p className="admin-eyebrow">Módulo opcional</p><h2>Credencial QR</h2></div></div>
            <label className="qr-toggle"><span><b>Activar credencial QR</b><small>Preferencia del evento</small></span><input type="checkbox" checked={settings.qrEnabled} onChange={(event) => setSettings({ ...settings, qrEnabled: event.target.checked })} /></label>
            <p>El QR está {settings.qrEnabled ? "activado como preferencia" : "desactivado"}. En esta fase no se generan ni validan credenciales.</p>
            <div className="inline-notice">Mientras esté OFF, no aparece ninguna referencia al QR en la invitación pública.</div>
          </section>

          <section className="settings-section">
            <p className="admin-eyebrow">Persistencia</p>
            <h2>Datos del evento</h2>
            <p>Los cambios se guardan de forma segura para esta invitación.</p>
            <button type="submit" className="button button--primary button--block" disabled={saving}>Guardar configuración</button>
            {saved && <p className="save-confirmation" role="status">Configuración guardada.</p>}
          </section>
        </aside>
      </form>
      {error && <div className="admin-toast" role="alert">{error}</div>}
    </div>
  );
}

export function EventSettingsAdmin() {
  const { ready } = useEvent();

  if (!ready) {
    return <div className="admin-page"><p className="admin-eyebrow">Cargando configuración…</p></div>;
  }

  return <EventSettingsAdminReady />;
}
