"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createDefaultState } from "@/lib/default-data";
import { LocalStorageEventRepository } from "@/lib/event-repository";
import type {
  CustomContentBlock,
  EventContent,
  EventSettings,
  EventState,
  Guest,
  ImageSlot,
} from "@/lib/models";

interface EventContextValue {
  state: EventState;
  ready: boolean;
  addGuest(guest: Omit<Guest, "id" | "guestNumber" | "respondedAt">): Guest;
  updateGuest(guest: Guest): void;
  deleteGuest(id: string): void;
  updateContent(content: EventContent, customBlocks: CustomContentBlock[]): void;
  updateSettings(settings: EventSettings): void;
  updateImage(image: ImageSlot): void;
  reset(): void;
}

const EventContext = createContext<EventContextValue | null>(null);
const repository = new LocalStorageEventRepository();

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EventState>(() => createDefaultState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(repository.load());
      setReady(true);
    });
    const unsubscribe = repository.subscribe(setState);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

  const commit = useCallback((updater: (current: EventState) => EventState) => {
    setState((current) => {
      const next = updater(current);
      repository.save(next);
      return next;
    });
  }, []);

  const value = useMemo<EventContextValue>(
    () => ({
      state,
      ready,
      addGuest(input) {
        const nextNumber = state.guests.reduce((max, guest) => Math.max(max, guest.guestNumber), 0) + 1;
        const guest: Guest = {
          ...input,
          id: crypto.randomUUID(),
          guestNumber: nextNumber,
          respondedAt: new Date().toISOString(),
        };
        commit((current) => ({ ...current, guests: [guest, ...current.guests] }));
        return guest;
      },
      updateGuest(guest) {
        commit((current) => ({
          ...current,
          guests: current.guests.map((item) => (item.id === guest.id ? guest : item)),
        }));
      },
      deleteGuest(id) {
        commit((current) => ({
          ...current,
          guests: current.guests.filter((guest) => guest.id !== id),
        }));
      },
      updateContent(content, customBlocks) {
        commit((current) => ({
          ...current,
          content,
          customBlocks,
          settings: {
            ...current.settings,
            peatonal: {
              ...current.settings.peatonal,
              venue: content.peatonal.venue,
              address: content.peatonal.address,
              showMap: content.peatonal.showMap,
              directionsLabel: content.peatonal.directionsLabel,
            },
            key: {
              ...current.settings.key,
              venue: content.key.venue,
              address: content.key.address,
              showMap: content.key.showMap,
              directionsLabel: content.key.directionsLabel,
            },
          },
        }));
      },
      updateSettings(settings) {
        commit((current) => ({
          ...current,
          settings,
          content: {
            ...current.content,
            peatonal: {
              ...current.content.peatonal,
              venue: settings.peatonal.venue,
              address: settings.peatonal.address,
              showMap: settings.peatonal.showMap,
              directionsLabel: settings.peatonal.directionsLabel,
            },
            key: {
              ...current.content.key,
              venue: settings.key.venue,
              address: settings.key.address,
              showMap: settings.key.showMap,
              directionsLabel: settings.key.directionsLabel,
            },
          },
        }));
      },
      updateImage(image) {
        commit((current) => ({
          ...current,
          images: current.images.map((item) => (item.id === image.id ? image : item)),
        }));
      },
      reset() {
        setState(repository.reset());
      },
    }),
    [commit, ready, state],
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent(): EventContextValue {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used inside EventProvider");
  return context;
}
