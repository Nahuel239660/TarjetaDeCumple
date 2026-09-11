"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  deleteGuestAction,
  submitPublicRsvp,
  updateContentAction,
  updateGuestAction,
  updateImageMetadataAction,
  updateSettingsAction,
  updateImageAction,
  type PublicRsvpResult,
} from "@/app/actions";
import type {
  CustomContentBlock,
  EventContent,
  EventSettings,
  EventState,
  Guest,
  ImageSlot,
  PublicEventState,
} from "@/lib/models";

interface EventContextValue {
  state: EventState;
  ready: true;
  saving: boolean;
  error: string;
  clearError(): void;
  updateGuest(guest: Guest): Promise<boolean>;
  deleteGuest(id: string): Promise<boolean>;
  updateContent(content: EventContent, customBlocks: CustomContentBlock[]): Promise<boolean>;
  updateSettings(settings: EventSettings): Promise<boolean>;
  updateImage(image: ImageSlot, file?: File): Promise<boolean>;
}

interface PublicEventContextValue {
  state: PublicEventState;
  submitRsvp(input: {
    fullName: string;
    attendingPeatonal: boolean;
    attendingKey: "yes" | "no" | "maybe";
    hasPlusOne: boolean;
    plusOneName: string;
    comment: string;
    confirmDuplicate?: boolean;
  }): Promise<PublicRsvpResult>;
}

const EventContext = createContext<EventContextValue | null>(null);
const PublicEventContext = createContext<PublicEventContextValue | null>(null);

function messageFor(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "No se pudieron guardar los cambios.";
}

export function EventProvider({ children, initialState }: { children: ReactNode; initialState: EventState }) {
  const [state, setState] = useState<EventState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const commit = useCallback(async (mutation: () => Promise<EventState>): Promise<boolean> => {
    setSaving(true);
    setError("");
    try {
      setState(await mutation());
      return true;
    } catch (caught) {
      setError(messageFor(caught));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<EventContextValue>(() => ({
    state,
    ready: true,
    saving,
    error,
    clearError: () => setError(""),
    updateGuest: (guest) => commit(() => updateGuestAction(guest)),
    deleteGuest: (id) => commit(() => deleteGuestAction(id)),
    updateContent: (content, customBlocks) => commit(() => updateContentAction({ content, customBlocks })),
    updateSettings: (settings) => commit(() => updateSettingsAction(settings)),
    updateImage: (image, file) => commit(() => {
      if (!file) return updateImageMetadataAction({
        id: image.id,
        title: image.title,
        caption: image.caption,
        visible: image.visible,
      });
      const formData = new FormData();
      formData.set("id", image.id);
      formData.set("title", image.title);
      formData.set("caption", image.caption);
      formData.set("visible", String(image.visible));
      formData.set("file", file);
      return updateImageAction(formData);
    }),
  }), [commit, error, saving, state]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function PublicEventProvider({ children, initialState }: { children: ReactNode; initialState: PublicEventState }) {
  const value = useMemo<PublicEventContextValue>(() => ({ state: initialState, submitRsvp: submitPublicRsvp }), [initialState]);
  return <PublicEventContext.Provider value={value}>{children}</PublicEventContext.Provider>;
}

export function useEvent(): EventContextValue {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent debe usarse dentro de EventProvider.");
  return context;
}

export function usePublicEvent(): PublicEventContextValue {
  const context = useContext(PublicEventContext);
  if (!context) throw new Error("usePublicEvent debe usarse dentro de PublicEventProvider.");
  return context;
}
