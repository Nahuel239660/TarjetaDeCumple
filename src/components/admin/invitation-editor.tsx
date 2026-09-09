"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useEvent } from "@/components/event-provider";
import type { CustomContentBlock, EventContent, EventStopContent } from "@/lib/models";

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "form-field form-field--wide" : "form-field"}><span>{label}</span>{children}</label>;
}

function EditorSection({ number, id, title, children }: { number: string; id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="editor-section" id={id}>
      <div className="editor-section__heading"><span>{number}</span><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function InvitationEditorReady() {
  const { state, updateContent } = useEvent();
  const [content, setContent] = useState<EventContent>(() => structuredClone(state.content));
  const [blocks, setBlocks] = useState<CustomContentBlock[]>(() => structuredClone(state.customBlocks));
  const [saved, setSaved] = useState(false);

  function setHero<K extends keyof EventContent>(key: K, value: EventContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function setStop(stop: "peatonal" | "key", patch: Partial<EventStopContent>) {
    setContent((current) => ({ ...current, [stop]: { ...current[stop], ...patch } }));
    setSaved(false);
  }

  function setBlock(id: string, patch: Partial<CustomContentBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
    setSaved(false);
  }

  function addBlock() {
    setBlocks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: "Nuevo bloque", content: "", visible: true, ctaLabel: "", ctaUrl: "" },
    ]);
    setSaved(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized: EventContent = {
      ...content,
      peatonal: {
        ...content.peatonal,
        timeLabel: content.peatonal.endTime
          ? `${content.peatonal.startTime} — ${content.peatonal.endTime} hs`
          : `${content.peatonal.startTime} hs`,
      },
      key: {
        ...content.key,
        timeLabel: content.key.endTime
          ? `${content.key.startTime} — ${content.key.endTime} hs`
          : `${content.key.startTime} hs en adelante`,
      },
    };
    setContent(normalized);
    updateContent(normalized, blocks);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div className="admin-page editor-page">
      <div className="admin-title-row">
        <div><p className="admin-eyebrow">Contenido público</p><h1>Editor de Contenido de Invitación</h1></div>
        <div className="title-actions"><Link href="/" target="_blank" className="button button--quiet">Vista previa</Link><button type="submit" form="invitation-editor-form" className="button button--primary">Guardar cambios</button></div>
      </div>

      <div className="editor-layout">
        <aside className="editor-index">
          <p>Secciones</p>
          <a href="#intro">1. Intro & Hero</a>
          <a href="#peatonal">2. Peatonal</a>
          <a href="#key">3. Key</a>
          <a href="#rsvp-editor">4. RSVP</a>
          <a href="#custom-blocks">5. Bloques</a>
        </aside>

        <form id="invitation-editor-form" className="editor-form" onSubmit={save}>
          <EditorSection number="01" id="intro" title="Sección Intro & Hero">
            <div className="form-grid">
              <Field label="Label"><input value={content.heroLabel} onChange={(event) => setHero("heroLabel", event.target.value)} /></Field>
              <Field label="Título"><input value={content.heroTitle} onChange={(event) => setHero("heroTitle", event.target.value)} /></Field>
              <Field label="Texto principal" wide><textarea rows={4} value={content.heroBody} onChange={(event) => setHero("heroBody", event.target.value)} /></Field>
              <Field label="CTA principal"><input value={content.heroPrimaryCta} onChange={(event) => setHero("heroPrimaryCta", event.target.value)} /></Field>
              <Field label="CTA secundario"><input value={content.heroSecondaryCta} onChange={(event) => setHero("heroSecondaryCta", event.target.value)} /></Field>
            </div>
          </EditorSection>

          <EditorSection number="02" id="peatonal" title="Sección Peatonal (Primera Parada)">
            <div className="form-grid">
              <Field label="Título"><input value={content.peatonal.title} onChange={(event) => setStop("peatonal", { title: event.target.value })} /></Field>
              <Field label="Fecha"><input value={content.peatonal.dateLabel} onChange={(event) => setStop("peatonal", { dateLabel: event.target.value })} /></Field>
              <Field label="Texto" wide><textarea rows={3} value={content.peatonal.copy} onChange={(event) => setStop("peatonal", { copy: event.target.value })} /></Field>
              <Field label="Hora de inicio"><input type="time" value={content.peatonal.startTime} onChange={(event) => setStop("peatonal", { startTime: event.target.value })} /></Field>
              <Field label="Hora de cierre"><input type="time" value={content.peatonal.endTime} onChange={(event) => setStop("peatonal", { endTime: event.target.value })} /></Field>
              <Field label="Lugar"><input value={content.peatonal.venue} onChange={(event) => setStop("peatonal", { venue: event.target.value })} /></Field>
              <Field label="Dirección"><input value={content.peatonal.address} onChange={(event) => setStop("peatonal", { address: event.target.value })} /></Field>
              <Field label="Texto del botón"><input value={content.peatonal.directionsLabel} onChange={(event) => setStop("peatonal", { directionsLabel: event.target.value })} /></Field>
              <label className="switch-row"><span>Vista previa de mapa</span><input type="checkbox" checked={content.peatonal.showMap} onChange={(event) => setStop("peatonal", { showMap: event.target.checked })} /></label>
            </div>
          </EditorSection>

          <EditorSection number="03" id="key" title="Sección Key (After Club)">
            <div className="form-grid">
              <Field label="Título"><input value={content.key.title} onChange={(event) => setStop("key", { title: event.target.value })} /></Field>
              <Field label="Horario aproximado"><input type="time" value={content.key.startTime} onChange={(event) => setStop("key", { startTime: event.target.value })} /></Field>
              <Field label="Texto" wide><textarea rows={3} value={content.key.copy} onChange={(event) => setStop("key", { copy: event.target.value })} /></Field>
              <Field label="Lugar"><input value={content.key.venue} onChange={(event) => setStop("key", { venue: event.target.value })} /></Field>
              <Field label="Dirección"><input value={content.key.address} onChange={(event) => setStop("key", { address: event.target.value })} /></Field>
              <label className="switch-row"><span>Mostrar sección Key</span><input type="checkbox" checked={content.key.visible} onChange={(event) => setStop("key", { visible: event.target.checked })} /></label>
            </div>
          </EditorSection>

          <EditorSection number="04" id="rsvp-editor" title="Sección RSVP (Confirmación)">
            <div className="form-grid">
              <Field label="Título"><input value={content.rsvpTitle} onChange={(event) => setHero("rsvpTitle", event.target.value)} /></Field>
              <Field label="Texto del botón"><input value={content.rsvpSubmitLabel} onChange={(event) => setHero("rsvpSubmitLabel", event.target.value)} /></Field>
              <Field label="Texto de ayuda" wide><input value={content.rsvpHelper} onChange={(event) => setHero("rsvpHelper", event.target.value)} /></Field>
              <Field label="Mensaje principal de éxito"><input value={content.rsvpSuccessTitle} onChange={(event) => setHero("rsvpSuccessTitle", event.target.value)} /></Field>
              <Field label="Mensaje secundario"><input value={content.rsvpSuccessBody} onChange={(event) => setHero("rsvpSuccessBody", event.target.value)} /></Field>
            </div>
          </EditorSection>

          <EditorSection number="05" id="custom-blocks" title="Bloques Dinámicos Personalizados">
            <div className="custom-block-heading"><p>Agregá información auxiliar sin alterar la estructura principal de la invitación.</p><button type="button" className="button button--quiet" onClick={addBlock}>+ Agregar bloque</button></div>
            <div className="custom-block-list">
              {blocks.map((block, index) => (
                <article key={block.id}>
                  <div className="custom-block-toolbar"><span>Bloque {String(index + 1).padStart(2, "0")}</span><label className="inline-toggle">Visible <input type="checkbox" checked={block.visible} onChange={(event) => setBlock(block.id, { visible: event.target.checked })} /></label><button type="button" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))}>Eliminar</button></div>
                  <div className="form-grid">
                    <Field label="Título"><input value={block.title} onChange={(event) => setBlock(block.id, { title: event.target.value })} /></Field>
                    <Field label="Contenido"><input value={block.content} onChange={(event) => setBlock(block.id, { content: event.target.value })} /></Field>
                    <Field label="CTA opcional"><input value={block.ctaLabel} onChange={(event) => setBlock(block.id, { ctaLabel: event.target.value })} placeholder="Ej: Ver menú" /></Field>
                    <Field label="URL opcional"><input type="url" value={block.ctaUrl} onChange={(event) => setBlock(block.id, { ctaUrl: event.target.value })} placeholder="https://" /></Field>
                  </div>
                </article>
              ))}
            </div>
          </EditorSection>

          <div className="editor-save-bar"><span>{saved ? "Cambios guardados" : "Los cambios quedan en este navegador"}</span><button className="button button--primary" type="submit">Guardar y publicar</button></div>
        </form>
      </div>
    </div>
  );
}

export function InvitationEditor() {
  const { ready } = useEvent();

  if (!ready) {
    return <div className="admin-page"><p className="admin-eyebrow">Cargando contenido…</p></div>;
  }

  return <InvitationEditorReady />;
}
