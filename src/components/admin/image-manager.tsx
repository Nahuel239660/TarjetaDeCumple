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

async function imageFileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await image.decode();
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo procesar la imagen.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ImageManager() {
  const { state, updateImage } = useEvent();
  const [feedback, setFeedback] = useState("");

  function changeSlot(slot: ImageSlot, patch: Partial<ImageSlot>) {
    try {
      updateImage({ ...slot, ...patch });
      setFeedback("");
    } catch {
      setFeedback("No hay espacio suficiente en el navegador para guardar esta imagen.");
    }
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

    try {
      const src = await imageFileToDataUrl(file);
      changeSlot(slot, { src, visible: true });
      setFeedback(`${slotMeta[slot.id].heading}: imagen reemplazada.`);
    } catch {
      setFeedback("No se pudo procesar esa imagen.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="admin-page images-page">
      <div className="admin-title-row">
        <div><p className="admin-eyebrow">Biblioteca visual</p><h1>Gestor de Imágenes de la Invitación</h1><p className="admin-lead">Tres slots independientes. Cada imagen mantiene su función y encuadre dentro de la invitación.</p></div>
        <div className="title-actions"><Link href="/" target="_blank" className="button button--quiet">Vista previa</Link><button type="button" className="button button--primary" onClick={() => setFeedback("Cambios de galería guardados.")}>Guardar cambios</button></div>
      </div>

      <div className="image-slot-list">
        {state.images.map((slot, index) => (
          <section className="image-slot-card" key={slot.id}>
            <div className="image-slot-card__header">
              <div><span className="slot-number">0{index + 1}</span><h2>{slotMeta[slot.id].heading}</h2><p>Usado en: {slotMeta[slot.id].destination}</p></div>
              <label className="switch-row switch-row--compact"><span>{slot.visible ? "Visible" : "Oculta"}</span><input type="checkbox" checked={slot.visible} onChange={(event) => changeSlot(slot, { visible: event.target.checked })} /></label>
            </div>
            <div className={`image-slot-preview image-slot-preview--${slot.aspectRatio}`}>
              <EventImage src={slot.src} alt={`Vista previa de ${slotMeta[slot.id].heading}`} priority={index === 0} sizes={slot.aspectRatio === "portrait" ? "320px" : "720px"} />
            </div>
            <div className="image-slot-fields">
              <label>Título<input value={slot.title} onChange={(event) => changeSlot(slot, { title: event.target.value })} /></label>
              <label>Caption<input value={slot.caption} onChange={(event) => changeSlot(slot, { caption: event.target.value })} /></label>
            </div>
            <div className="image-slot-actions">
              <label className="button button--quiet">Reemplazar imagen<input className="sr-only" type="file" accept="image/*" onChange={(event) => void replaceImage(event, slot)} /></label>
              <Link href="/" target="_blank" className="button button--quiet">Vista previa</Link>
              <button type="button" className="button button--text-danger" onClick={() => changeSlot(slot, { src: "", visible: false })}>Eliminar</button>
            </div>
          </section>
        ))}
      </div>
      <p className="upload-note">Formatos admitidos: PNG, JPEG o WebP. Máximo 2,5 MB. Las imágenes nuevas se optimizan y guardan en este navegador.</p>
      {feedback && <div className="admin-toast" role="status">{feedback}</div>}
    </div>
  );
}
