import { createDefaultState } from "@/lib/default-data";
import type { EventState } from "@/lib/models";

export interface EventRepository {
  load(): EventState;
  save(state: EventState): void;
  reset(): EventState;
  subscribe(listener: (state: EventState) => void): () => void;
}

interface StoredEventState {
  version: 1;
  state: EventState;
}

const STORAGE_KEY = "nahuel-bday:event-state";

function cloneDefaultState(): EventState {
  return structuredClone(createDefaultState());
}

export class LocalStorageEventRepository implements EventRepository {
  load(): EventState {
    if (typeof window === "undefined") return cloneDefaultState();

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaultState();
      const stored = JSON.parse(raw) as StoredEventState;
      return stored.version === 1 ? stored.state : cloneDefaultState();
    } catch {
      return cloneDefaultState();
    }
  }

  save(state: EventState): void {
    if (typeof window === "undefined") return;
    const payload: StoredEventState = { version: 1, state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  reset(): EventState {
    const state = cloneDefaultState();
    this.save(state);
    return state;
  }

  subscribe(listener: (state: EventState) => void): () => void {
    if (typeof window === "undefined") return () => undefined;

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener(this.load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }
}
