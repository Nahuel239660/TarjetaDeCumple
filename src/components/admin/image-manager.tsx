"use client";

import Link from "next/link";
import { type ChangeEvent, useState } from "react";
import { EventImage } from "@/components/event-image";
import { useEvent } from "@/components/event-provider";
import type { ImageSlot } from "@/lib/models";

const slotMeta: Record<ImageSlot["id"], { heading: string; destination: string }> = {
  nahuel: { heading: "Nahuel (Retrato Anfitrión)", destination: "Hero de la invitación" },
  fernet: { heading: "Fernet & Barra", destination: "Primera parada · Peatonal" },
  kevin: { heading: "Kevin de Vries (DJ & After)", destination: "Segunda parada · Key Club" },
};

export function ImageManager() {
  const { state, updateImage, error, saving } = useEvent();
  const [drafts, setDrafts] = useState<Record<ImageSlot["id"], ImageSlot>>(() => Object.fromEntries(state.images.map((image) => [image.id, { ...image }])) as Record<ImageSlot["id"], ImageSlot>);
  const [localPreviews, setLocalPreviews] = useState<Partial<Record<ImageSlot["id"], string>>>({});
  const [feedback, setFeedback] = useState("");

  function changeSlot(slot: ImageSlot, patch: Partial<ImageSlot>) {
    setDrafts((current) => ({ ...current, [slot.id]: { ...(current[slot.id] ?? slot), ...patch } }));
    setFeedback("");
  }

  async function replaceImage(event: ChangeEvent<HTMLInputElement>, slot: ImageSlot) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback("Elegí un archivo de imagen válido.");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setFeedback("La imagen supera el máximo de 2,5 MB.");
      return;
    }

    setLocalPreviews((current) => ({ ...current, [slot.id]: URL.createObjectURL(file) }));
    changeSlot(slot, { visible: true });
    setFeedback(`${slotMeta[slot.id].heading}: vista previa local activada. La carga permanente se incorpora en una fase posterior.`);
    event.target.value = "";
  }

  async function saveChanges() {
    let savedAll = true;
    for (const slot of state.images) {
      const draft = drafts[slot.id] ?? slot;
      if (!await updateImage(draft)) savedAll = false;
    }
    if (savedAll) setFeedback("Metadatos de galería guardados.");
  }

  return (
    <div className="admin-page images-page">
      <div className="admin-title-row">
        <div><p className="admin-eyebrow">Biblioteca visual</p><h1>Gestor de Imágenes de la Invitación</h1><p className="admin-lead">Tres slots independientes. Cada imagen mantiene su función y encuadre dentro de la invitación.</p></div>
        <div className="title-actions"><Link href="/" target="_blank" className="button button--quiet">Vista previa</Link><button type="button" className="button button--primary" onClick={() => void saveChanges()} disabled={saving}>Guardar cambios</button></div>
      </div>

      <div className="image-slot-list">
        {state.images.map((slot, index) => {
          const draft = drafts[slot.id] ?? slot;
          const previewSrc = localPreviews[slot.id] ?? draft.src;
          return (
            <section className="image-slot-card" key={slot.id}>
              <div className="image-slot-card__header">
                <div><span className="slot-number">0{index + 1}</span><h2>{slotMeta[slot.id].heading}</h2><p>Usado en: {slotMeta[slot.id].destination}</p></div>
                <label className="switch-row switch-row--compact"><span>{draft.visible ? "Visible" : "Oculta"}</span><input type="checkbox" checked={draft.visible} onChange={(event) => changeSlot(slot, { visible: event.target.checked })} /></label>
              </div>
              <div className={`image-slot-preview image-slot-preview--${slot.aspectRatio}`}>
                <EventImage src={previewSrc} alt={`Vista previa de ${slotMeta[slot.id].heading}`} priority={index === 0} sizes={slot.aspectRatio === "portrait" ? "320px" : "720px"} />
              </div>
              <div className="image-slot-fields">
                <label>Título<input value={draft.title} onChange={(event) => changeSlot(slot, { title: event.target.value })} /></label>
                <label>Caption<input value={draft.caption} onChange={(event) => changeSlot(slot, { caption: event.target.value })} /></label>
              </div>
              <div className="image-slot-actions">
                <label className="button button--quiet">Reemplazar imagen<input className="sr-only" type="file" accept="image/*" onChange={(event) => void replaceImage(event, slot)} /></label>
                <Link href="/" target="_blank" className="button button--quiet">Vista previa</Link>
                <button type="button" className="button button--text-danger" onClick={() => changeSlot(slot, { visible: false })}>Ocultar</button>
              </div>
            </section>
          );
        })}
      </div>
      <p className="upload-note">Las imágenes de producción viven en el repositorio. La vista previa de reemplazo es local y temporal; la carga permanente está diferida.</p>
      {(feedback || error) && <div className="admin-toast" role={error ? "alert" : "status"}>{error || feedback}</div>}
    </div>
  );
}
