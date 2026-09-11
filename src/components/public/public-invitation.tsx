"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventImage } from "@/components/event-image";
import { usePublicEvent } from "@/components/event-provider";
import { MapPreview } from "@/components/map-preview";
import { EntranceAnimation } from "@/components/public/entrance-animation";
import { getDirectionsUrl } from "@/lib/directions";
import type { ImageSlot, KeyAttendance } from "@/lib/models";

const SHORT_MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const LONG_MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`choice-button${active ? " is-active" : ""}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

function getImage(images: ImageSlot[], id: ImageSlot["id"]): ImageSlot | undefined {
  return images.find((image) => image.id === id);
}

export function PublicInvitation() {
  const { state, submitRsvp } = usePublicEvent();
  const { content, settings, images, customBlocks } = state;
  const nahuel = getImage(images, "nahuel");
  const fernet = getImage(images, "fernet");
  const kevin = getImage(images, "kevin");
  const peatonalDirections = getDirectionsUrl(settings.peatonal);
  const keyDirections = getDirectionsUrl(settings.key);
  const [heroAccent, ...heroLabelRest] = content.heroLabel.trim().split(/\s+/);

  const [fullName, setFullName] = useState("");
  const [attendingPeatonal, setAttendingPeatonal] = useState<boolean>(true);
  const [attendingKey, setAttendingKey] = useState<KeyAttendance>("maybe");
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [needsDuplicateConfirmation, setNeedsDuplicateConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    fullName: string;
    attendingPeatonal: boolean;
    attendingKey: KeyAttendance;
    hasPlusOne: boolean;
    plusOneName: string;
  } | null>(null);

  const eventDate = useMemo(() => {
    const date = new Date(`${settings.eventDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return { short: "19 SEP", long: "19 de septiembre" };
    return {
      short: `${String(date.getDate()).padStart(2, "0")} ${SHORT_MONTHS[date.getMonth()]}`,
      long: `${date.getDate()} de ${LONG_MONTHS[date.getMonth()]}`,
    };
  }, [settings.eventDate]);

  async function submitRsvpForm(event: { preventDefault(): void }, confirmDuplicate = false) {
    event.preventDefault();
    const cleanName = fullName.trim();
    const cleanPlusOne = plusOneName.trim();
    if (!cleanName) {
      setError("Escribí tu nombre y apellido para confirmar.");
      return;
    }
    if (hasPlusOne && !cleanPlusOne) {
      setError("Escribí el nombre de tu +1.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitRsvp({
      fullName: cleanName,
      attendingPeatonal,
      attendingKey: attendingKey ?? "maybe",
      hasPlusOne,
      plusOneName: hasPlusOne ? cleanPlusOne : "",
      comment: comment.trim(),
      confirmDuplicate,
    });
    setIsSubmitting(false);
    if (result.status === "possible-duplicate") {
      setNeedsDuplicateConfirmation(true);
      setError("");
      return;
    }
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setError("");
    setNeedsDuplicateConfirmation(false);
    setSubmitted({ fullName: cleanName, attendingPeatonal, attendingKey, hasPlusOne, plusOneName: cleanPlusOne });
  }

  function resetForm() {
    setSubmitted(null);
  }

  return (
    <div className="public-site" id="top">
      <EntranceAnimation config={settings.entranceAnimation} eventDate={settings.eventDate} />
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <header className="public-header">
        <div className="public-header__inner">
          <Link href="#top" className="public-wordmark">Nahuel /<br />Bday</Link>
          <div className="public-header__meta">
            <span>{eventDate.short} · {settings.cityLabel}</span>
            <a href="#rsvp">RSVP</a>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="public-hero">
          <div className="hero-copy">
            <p className="public-kicker"><span />{eventDate.short} · {settings.cityLabel}</p>
            <h1>
              <span>Nahuel</span>
              <em>{heroAccent || "Birthday"}</em>
              {heroLabelRest.length > 0 && <span>{heroLabelRest.join(" ")}</span>}
            </h1>
            <p className="hero-quote">“{content.heroTitle.replace(" 🎉", "")}”</p>
            <p className="hero-body">{content.heroBody}</p>
            <div className="hero-actions">
              <a className="public-button public-button--primary" href="#rsvp">{content.heroPrimaryCta}</a>
              <a className="public-button public-button--secondary" href="#plan">{content.heroSecondaryCta} ↘</a>
            </div>
          </div>
          <div className="hero-media">
            {nahuel?.visible && <EventImage src={nahuel.src} alt="Nahuel en su cumpleaños" priority sizes="(max-width: 760px) 84vw, 360px" />}
            <span className="media-label">Host · {eventDate.short}</span>
          </div>
        </section>

        <div className="event-strip" aria-label="Resumen del plan">
          <span><strong>{content.peatonal.startTime} — {content.peatonal.endTime}</strong> {settings.peatonal.venue} · pizzas & birras</span>
          {content.key.visible && <span>/</span>}
          {content.key.visible && <span><strong>{content.key.startTime} → tarde</strong> {settings.key.venue} · after</span>}
        </div>

        <section className="public-section public-section--peatonal" id="plan">
          <div className="section-heading-row">
            <div>
              <p className="public-kicker">01 · Primera parada</p>
              <h2>{content.peatonal.title.replace("Primera parada: ", "")}</h2>
            </div>
            <p className="section-time">{content.peatonal.timeLabel}</p>
          </div>

          <div className="stop-grid">
            <div>
              <blockquote>“{content.peatonal.copy}”</blockquote>
              <p>La idea es juntarnos temprano, picar algo rico, tomar unas birras y charlar. Podés caer directo a la hora que te quede cómodo dentro de esa franja.</p>
              <div className="location-line">
                <span><small>Ubicación</small>{settings.peatonal.venue} · {settings.peatonal.address}</span>
                {peatonalDirections && <a href={peatonalDirections} target="_blank" rel="noreferrer">Abrir mapa ↗</a>}
              </div>
              {content.peatonal.showMap && settings.peatonal.showMap && (
                <div className="public-map-wrap">
                  <MapPreview location={settings.peatonal} compact />
                  <div className="public-map-caption">
                    <span>{settings.peatonal.address}</span>
                    {peatonalDirections && <a href={peatonalDirections} target="_blank" rel="noreferrer">{content.peatonal.directionsLabel} ↗</a>}
                  </div>
                </div>
              )}
            </div>
            <aside className="stop-note">
              <p className="public-kicker">Lineup & acceso</p>
              <p>Podés sumarte directo sin pasar por Peatonal si preferís caer más tarde.</p>
              <a className="public-button public-button--secondary" href="#rsvp">Anotarme para Key →</a>
            </aside>
          </div>

          {fernet?.visible && (
            <figure className="wide-photo">
              <div className="wide-photo__frame"><EventImage src={fernet.src} alt="Fernet con cola servido para el brindis" sizes="(max-width: 900px) 100vw, 900px" /></div>
              <figcaption><span>{fernet.caption}</span><em>Fernet & cócteles</em></figcaption>
            </figure>
          )}
        </section>

        {content.key.visible && (
          <section className="public-section public-section--key">
            <div className="section-heading-row">
              <div>
                <p className="public-kicker">02 · Después</p>
                <h2>{content.key.title.replace("Después: ", "")}</h2>
              </div>
              <p className="section-time section-time--orange">{content.key.timeLabel}</p>
            </div>
            <div className="stop-grid">
              <div>
                <blockquote>“{content.key.copy.split(":")[0]}.”</blockquote>
                <p>{content.key.copy}</p>
                <div className="music-note"><span>Música de la noche</span>Melodic Techno & House. Kevin de Vries en cabina.</div>
              </div>
              <aside className="stop-note">
                <a className="public-button public-button--secondary" href="#rsvp">Anotarme para Key →</a>
                {keyDirections && <a className="text-link" href={keyDirections} target="_blank" rel="noreferrer">{content.key.directionsLabel}</a>}
              </aside>
            </div>
            {kevin?.visible && (
              <figure className="wide-photo">
                <div className="wide-photo__frame"><EventImage src={kevin.src} alt="Kevin de Vries tocando en una noche de melodic techno" sizes="(max-width: 900px) 100vw, 900px" /></div>
                <figcaption><span>{kevin.caption}</span><em>Melodic techno</em></figcaption>
              </figure>
            )}
          </section>
        )}

        {customBlocks.some((block) => block.visible) && (
          <section className="public-extras" aria-label="Información adicional">
            {customBlocks.filter((block) => block.visible).map((block) => (
              <article key={block.id}>
                <h3>{block.title}</h3>
                <p>{block.content}</p>
                {block.ctaLabel && block.ctaUrl && <a href={block.ctaUrl}>{block.ctaLabel} ↗</a>}
              </article>
            ))}
          </section>
        )}

        <section className="rsvp-section" id="rsvp">
          {submitted ? (
            <div className="rsvp-success" role="status">
              <p className="public-kicker">RSVP recibido</p>
              <h2>{content.rsvpSuccessTitle}</h2>
              <p>{content.rsvpSuccessBody}</p>
              <dl>
                <div><dt>Nombre</dt><dd>{submitted.fullName}</dd></div>
                <div><dt>Peatonal</dt><dd>{submitted.attendingPeatonal ? "Sí" : "No"}</dd></div>
                <div><dt>Key</dt><dd>{submitted.attendingKey === "yes" ? "Sí" : submitted.attendingKey === "no" ? "No" : "Todavía no sé"}</dd></div>
                <div><dt>+1</dt><dd>{submitted.hasPlusOne ? submitted.plusOneName : "No"}</dd></div>
              </dl>
              <button type="button" className="public-button public-button--secondary" onClick={resetForm}>Modificar mi respuesta</button>
            </div>
          ) : (
            <form onSubmit={submitRsvpForm} noValidate>
              <p className="public-kicker">RSVP</p>
              <h2>{content.rsvpTitle}</h2>
              <p className="rsvp-helper">{content.rsvpHelper}</p>

              <label className="field-label" htmlFor="full-name">Nombre y apellido <span>*</span></label>
              <input id="full-name" className="public-input" value={fullName} onChange={(event) => { setFullName(event.target.value); setNeedsDuplicateConfirmation(false); }} placeholder="Tu nombre completo" autoComplete="name" required />

              <fieldset>
                <legend>¿Venís a Peatonal? <span>*</span></legend>
                <div className="choice-grid choice-grid--two">
                  <ChoiceButton active={attendingPeatonal} onClick={() => setAttendingPeatonal(true)}>Sí, voy</ChoiceButton>
                  <ChoiceButton active={!attendingPeatonal} onClick={() => setAttendingPeatonal(false)}>No puedo</ChoiceButton>
                </div>
              </fieldset>

              <fieldset>
                <legend>¿Vas a Key? <span>*</span></legend>
                <div className="choice-grid choice-grid--three">
                  <ChoiceButton active={attendingKey === "yes"} onClick={() => setAttendingKey("yes")}>Sí</ChoiceButton>
                  <ChoiceButton active={attendingKey === "no"} onClick={() => setAttendingKey("no")}>No</ChoiceButton>
                  <ChoiceButton active={attendingKey === "maybe"} onClick={() => setAttendingKey("maybe")}>Todavía no sé</ChoiceButton>
                </div>
              </fieldset>

              <fieldset>
                <legend>¿Venís con +1? <span>*</span></legend>
                <div className="choice-grid choice-grid--two">
                  <ChoiceButton active={!hasPlusOne} onClick={() => { setHasPlusOne(false); setPlusOneName(""); }}>Solo yo</ChoiceButton>
                  <ChoiceButton active={hasPlusOne} onClick={() => setHasPlusOne(true)}>Sí, voy con alguien</ChoiceButton>
                </div>
              </fieldset>

              {hasPlusOne && (
                <div className="conditional-field">
                  <label className="field-label" htmlFor="plus-one-name">Nombre de tu +1 <span>*</span></label>
                  <input id="plus-one-name" className="public-input" value={plusOneName} onChange={(event) => setPlusOneName(event.target.value)} placeholder="Nombre completo" required />
                </div>
              )}

              <label className="field-label" htmlFor="comment">Comentario (opcional)</label>
              <textarea id="comment" className="public-input public-textarea" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ej: dieta vegetariana, celiaquía o aviso de horario..." />
              {error && <p className="form-error" role="alert">{error}</p>}
              {needsDuplicateConfirmation && (
                <div className="duplicate-warning" role="alert">
                  <p>Ya existe una confirmación parecida para {fullName.trim()}.</p>
                  <div><button type="button" className="public-button public-button--secondary" onClick={() => setNeedsDuplicateConfirmation(false)}>Revisar datos</button><button type="button" className="public-button public-button--primary" onClick={(event) => void submitRsvpForm(event, true)} disabled={isSubmitting}>Confirmar igualmente</button></div>
                </div>
              )}
              <button className="public-button public-button--primary public-submit" type="submit" disabled={isSubmitting || needsDuplicateConfirmation}>{isSubmitting ? "Confirmando…" : content.rsvpSubmitLabel}</button>
            </form>
          )}
        </section>
      </main>

      <footer className="public-footer">
        <span>Nahuel · {eventDate.long} · Nos vemos ahí</span>
        <nav className="public-footer__actions" aria-label="Acciones de la invitación">
          <a href="#top">Volver arriba ↑</a>
          <a className="public-footer__admin" href="/admin">Administrar</a>
        </nav>
      </footer>
    </div>
  );
}
