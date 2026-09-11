"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import type { EntranceAnimationSettings } from "@/lib/models";

const SESSION_KEY = "birthday-intro-seen";
const DEVICE_KEY = "birthday-intro-seen-device";
const REDUCED_MOTION_DURATION_MS = 420;

function storageFor(frequency: EntranceAnimationSettings["frequency"]): Storage | null {
  if (frequency === "session") return window.sessionStorage;
  if (frequency === "device") return window.localStorage;
  return null;
}

function storageKey(frequency: EntranceAnimationSettings["frequency"]): string {
  return frequency === "device" ? DEVICE_KEY : SESSION_KEY;
}

function hasSeenIntro(frequency: EntranceAnimationSettings["frequency"]): boolean {
  try {
    const storage = storageFor(frequency);
    return storage ? storage.getItem(storageKey(frequency)) === "1" : false;
  } catch {
    return false;
  }
}

function markIntroSeen(frequency: EntranceAnimationSettings["frequency"]): void {
  try {
    storageFor(frequency)?.setItem(storageKey(frequency), "1");
  } catch {
    // Storage may be unavailable in private browsing. The intro still remains usable.
  }
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

function suppressionScript(frequency: EntranceAnimationSettings["frequency"]): string {
  if (frequency === "always") return "document.documentElement.removeAttribute('data-birthday-intro-seen');";
  const storageName = frequency === "device" ? "localStorage" : "sessionStorage";
  const key = storageKey(frequency);
  return `try{if(window.${storageName}.getItem(${JSON.stringify(key)})==='1'){document.documentElement.setAttribute('data-birthday-intro-seen','true')}}catch{}`;
}

export function EntranceAnimation({
  config,
  eventDate,
  preview = false,
  onFinish,
}: {
  config: EntranceAnimationSettings;
  eventDate: string;
  preview?: boolean;
  onFinish?: () => void;
}) {
  const shouldRender = config.enabled || preview;
  const [visible, setVisible] = useState(shouldRender);
  const timerRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (!preview) {
      markIntroSeen(config.frequency);
      document.documentElement.setAttribute("data-birthday-intro-seen", "true");
    }
    document.documentElement.classList.remove("birthday-intro-active");
    setVisible(false);
    onFinish?.();
  }, [config.frequency, onFinish, preview]);

  useEffect(() => {
    if (!shouldRender) return;
    if (!preview && hasSeenIntro(config.frequency)) {
      return;
    }

    document.documentElement.removeAttribute("data-birthday-intro-seen");
    document.documentElement.classList.add("birthday-intro-active");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion
      ? Math.min(config.durationMs, REDUCED_MOTION_DURATION_MS)
      : config.durationMs;
    timerRef.current = window.setTimeout(finish, duration + 80);

    function skipWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && (config.allowSkip || preview)) finish();
    }

    document.addEventListener("keydown", skipWithEscape);
    return () => {
      document.removeEventListener("keydown", skipWithEscape);
      document.documentElement.classList.remove("birthday-intro-active");
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [config.allowSkip, config.durationMs, config.frequency, finish, preview, shouldRender]);

  if (!shouldRender || !visible) return null;

  const duration = Math.max(500, Math.min(config.durationMs, 10_000));
  const dateLabel = config.showDate ? formatDate(eventDate) : "";
  const style = { "--intro-duration": `${duration}ms` } as CSSProperties;

  return (
    <>
      {!preview && <script dangerouslySetInnerHTML={{ __html: suppressionScript(config.frequency) }} />}
      <div
        className={`birthday-intro${preview ? " birthday-intro--preview" : ""}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-label={preview ? "Vista previa de la animación de entrada" : "Animación de entrada a la invitación"}
        data-animation-type={config.type}
      >
        <div className="birthday-intro__atmosphere" aria-hidden="true" />
        <div className="birthday-intro__stage" aria-hidden="true">
          <div className="birthday-intro__glow" />
          <div className="birthday-intro__hinge-shadow" />
          <div className="birthday-intro__copy">
            <strong>{config.primaryText}</strong>
            <span>{config.secondaryText}</span>
            {dateLabel ? <small>{dateLabel}</small> : null}
          </div>
          <div className="birthday-intro__shell-viewport">
            <Image
              className="birthday-intro__shell-frames"
              src="/images/intro/clam-shell-frames.webp"
              alt=""
              width={5760}
              height={1440}
              priority
              unoptimized
              onError={finish}
            />
          </div>
        </div>
        {config.allowSkip || preview ? (
          <button className="birthday-intro__skip" type="button" onClick={finish}>
            Saltar
          </button>
        ) : null}
      </div>
    </>
  );
}
