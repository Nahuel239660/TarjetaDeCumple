import { asc, count, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { randomUUID } from "node:crypto";
import { createDefaultState } from "@/lib/default-data";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";
import { customContentBlocks, eventConfigurations, guests, imageSlots } from "@/lib/db/schema";
import { normalizeComparableName } from "@/lib/name-normalization";
import type {
  CustomContentBlock,
  EventContent,
  EventSettings,
  EventState,
  Guest,
  ImageSlot,
  KeyAttendance,
  PublicEventState,
} from "@/lib/models";

function fallbackState(): EventState {
  return structuredClone(createDefaultState());
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function asKeyAttendance(value: string | null): KeyAttendance {
  return value === "yes" || value === "no" || value === "maybe" ? value : null;
}

function mapGuest(row: typeof guests.$inferSelect): Guest {
  return {
    id: row.id,
    guestNumber: row.guestNumber,
    fullName: row.fullName,
    attendingPeatonal: row.attendingPeatonal,
    attendingKey: asKeyAttendance(row.attendingKey),
    hasPlusOne: row.hasPlusOne,
    plusOneName: row.plusOneName,
    comment: row.comment,
    respondedAt: toIso(row.respondedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapBlock(row: typeof customContentBlocks.$inferSelect): CustomContentBlock {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    visible: row.visible,
    ctaLabel: row.ctaLabel,
    ctaUrl: row.ctaUrl,
  };
}

function mapImage(row: typeof imageSlots.$inferSelect): ImageSlot {
  const aspectRatio = row.aspectRatio === "portrait" ? "portrait" : "landscape";
  return { id: row.id as ImageSlot["id"], title: row.title, caption: row.caption, src: row.src, visible: row.visible, aspectRatio };
}

function withPossibleDuplicateFlags(items: Guest[]): Guest[] {
  const counts = new Map<string, number>();
  for (const guest of items) {
    const normalized = normalizeComparableName(guest.fullName);
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return items.map((guest) => ({ ...guest, possibleDuplicate: (counts.get(normalizeComparableName(guest.fullName)) ?? 0) > 1 }));
}

async function seedConfiguration() {
  const db = getDatabase();
  const seed = fallbackState();

  await db.insert(eventConfigurations).values({ id: 1, content: seed.content, settings: seed.settings }).onConflictDoNothing();
  await db.insert(imageSlots).values(seed.images.map((image) => ({
    id: image.id,
    title: image.title,
    caption: image.caption,
    src: image.src,
    visible: image.visible,
    aspectRatio: image.aspectRatio,
  }))).onConflictDoNothing();
  await db.insert(customContentBlocks).values(seed.customBlocks.map((block, index) => ({
    ...block,
    sortOrder: index + 1,
  }))).onConflictDoNothing();
}

/**
 * Initializes only the singleton event configuration and local image metadata.
 * This is safe to run against production: it never creates guest RSVP records.
 */
export async function seedDatabaseForProduction() {
  if (!isDatabaseConfigured()) throw new Error("Definí DATABASE_URL antes de inicializar la base de datos.");
  await seedConfiguration();
}

/**
 * Adds the Phase 1 sample RSVP list to an otherwise empty development database.
 * This intentionally refuses to run in production or on a database that already
 * contains guests, so real RSVP data cannot be mixed with demo data.
 */
export async function seedDatabaseForDevelopment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Los datos de muestra no se pueden cargar en producción.");
  }
  if (!isDatabaseConfigured()) throw new Error("Definí DATABASE_URL antes de cargar datos de muestra.");

  await seedConfiguration();

  const db = getDatabase();
  const [{ guestCount }] = await db.select({ guestCount: count() }).from(guests);
  if (guestCount > 0) {
    throw new Error("La base ya tiene invitados. No se mezclaron datos de muestra con RSVP existentes.");
  }

  const seed = fallbackState();
  await db.insert(guests).values(seed.guests.map((guest) => ({
    id: guest.id,
    guestNumber: guest.guestNumber,
    fullName: guest.fullName,
    normalizedName: normalizeComparableName(guest.fullName),
    attendingPeatonal: guest.attendingPeatonal,
    attendingKey: guest.attendingKey,
    hasPlusOne: guest.hasPlusOne,
    plusOneName: guest.plusOneName,
    comment: guest.comment,
    respondedAt: guest.respondedAt ? new Date(guest.respondedAt) : null,
    createdAt: new Date(guest.createdAt),
    updatedAt: new Date(guest.updatedAt),
  }))).onConflictDoNothing();
  await db.execute(sql`SELECT setval(
    pg_get_serial_sequence('guests', 'guest_number'),
    GREATEST((SELECT max(guest_number) FROM guests), (SELECT last_value FROM guests_guest_number_seq)),
    true
  )`);
}

async function ensureSeeded() {
  const db = getDatabase();
  const [existing] = await db.select({ id: eventConfigurations.id }).from(eventConfigurations).limit(1);
  if (!existing) await seedConfiguration();
}

async function readEventState(includeGuests: boolean): Promise<EventState> {
  await ensureSeeded();
  const db = getDatabase();
  const configQuery = db.select().from(eventConfigurations).orderBy(asc(eventConfigurations.id)).limit(1);
  const imagesQuery = db.select().from(imageSlots).orderBy(asc(imageSlots.id));
  const blocksQuery = db.select().from(customContentBlocks).orderBy(asc(customContentBlocks.sortOrder));
  const guestQuery = includeGuests
    ? db.select().from(guests).orderBy(asc(guests.guestNumber))
    : Promise.resolve([] as (typeof guests.$inferSelect)[]);
  const [[configuration], storedImages, storedBlocks, storedGuests] = await Promise.all([configQuery, imagesQuery, blocksQuery, guestQuery]);
  if (!configuration) throw new Error("No se pudo cargar la configuración del evento.");

  return {
    content: configuration.content,
    settings: configuration.settings,
    images: storedImages.map(mapImage),
    customBlocks: storedBlocks.map(mapBlock),
    guests: includeGuests ? withPossibleDuplicateFlags(storedGuests.map(mapGuest)) : [],
  };
}

export const getPublicEventState = cache(async (): Promise<PublicEventState> => {
  if (!isDatabaseConfigured()) {
    const state = fallbackState();
    return { content: state.content, settings: state.settings, images: state.images, customBlocks: state.customBlocks };
  }
  const state = await readEventState(false);
  return { content: state.content, settings: state.settings, images: state.images, customBlocks: state.customBlocks };
});

export const getAdminEventState = cache(async (): Promise<EventState> => {
  if (!isDatabaseConfigured()) return fallbackState();
  return readEventState(true);
});

export async function createPublicGuest(input: {
  fullName: string;
  attendingPeatonal: boolean;
  attendingKey: Exclude<KeyAttendance, null>;
  hasPlusOne: boolean;
  plusOneName: string;
  comment: string;
}) {
  const db = getDatabase();
  const [guest] = await db.insert(guests).values({
    id: randomUUID(),
    fullName: input.fullName,
    normalizedName: normalizeComparableName(input.fullName),
    attendingPeatonal: input.attendingPeatonal,
    attendingKey: input.attendingKey,
    hasPlusOne: input.hasPlusOne,
    plusOneName: input.hasPlusOne ? input.plusOneName : "",
    comment: input.comment,
    respondedAt: new Date(),
  }).returning();
  return mapGuest(guest);
}

export async function hasPossiblePublicDuplicate(fullName: string): Promise<boolean> {
  const db = getDatabase();
  const normalizedName = normalizeComparableName(fullName);
  const [match] = await db.select({ id: guests.id }).from(guests).where(eq(guests.normalizedName, normalizedName)).limit(1);
  return Boolean(match);
}

export async function updateAdminGuest(input: Omit<Guest, "guestNumber" | "respondedAt" | "createdAt" | "updatedAt" | "possibleDuplicate">) {
  const db = getDatabase();
  await db.update(guests).set({
    fullName: input.fullName,
    normalizedName: normalizeComparableName(input.fullName),
    attendingPeatonal: input.attendingPeatonal,
    attendingKey: input.attendingKey,
    hasPlusOne: input.hasPlusOne,
    plusOneName: input.hasPlusOne ? input.plusOneName : "",
    comment: input.comment,
    updatedAt: new Date(),
  }).where(eq(guests.id, input.id));
}

export async function removeAdminGuest(id: string) {
  const db = getDatabase();
  await db.delete(guests).where(eq(guests.id, id));
}

function syncContentWithSettings(content: EventContent, settings: EventSettings): EventSettings {
  return {
    ...settings,
    peatonal: {
      ...settings.peatonal,
      venue: content.peatonal.venue,
      address: content.peatonal.address,
      showMap: content.peatonal.showMap,
      directionsLabel: content.peatonal.directionsLabel,
    },
    key: {
      ...settings.key,
      venue: content.key.venue,
      address: content.key.address,
      showMap: content.key.showMap,
      directionsLabel: content.key.directionsLabel,
    },
  };
}

function syncSettingsWithContent(settings: EventSettings, content: EventContent): EventContent {
  return {
    ...content,
    peatonal: {
      ...content.peatonal,
      venue: settings.peatonal.venue,
      address: settings.peatonal.address,
      showMap: settings.peatonal.showMap,
      directionsLabel: settings.peatonal.directionsLabel,
    },
    key: {
      ...content.key,
      venue: settings.key.venue,
      address: settings.key.address,
      showMap: settings.key.showMap,
      directionsLabel: settings.key.directionsLabel,
    },
  };
}

async function getConfiguration() {
  await ensureSeeded();
  const db = getDatabase();
  const [configuration] = await db.select().from(eventConfigurations).orderBy(asc(eventConfigurations.id)).limit(1);
  if (!configuration) throw new Error("No se pudo cargar la configuración del evento.");
  return configuration;
}

export async function saveAdminContent(content: EventContent, blocks: CustomContentBlock[]) {
  const db = getDatabase();
  const configuration = await getConfiguration();
  const settings = syncContentWithSettings(content, configuration.settings);
  await db.update(eventConfigurations).set({ content, settings, updatedAt: new Date() }).where(eq(eventConfigurations.id, configuration.id));
  await db.delete(customContentBlocks);
  if (blocks.length > 0) {
    await db.insert(customContentBlocks).values(blocks.map((block, index) => ({
      id: block.id && /^[0-9a-f-]{36}$/i.test(block.id) ? block.id : randomUUID(),
      title: block.title,
      content: block.content,
      visible: block.visible,
      ctaLabel: block.ctaLabel,
      ctaUrl: block.ctaUrl,
      sortOrder: index + 1,
    })));
  }
}

export async function saveAdminSettings(settings: EventSettings) {
  const db = getDatabase();
  const configuration = await getConfiguration();
  const content = syncSettingsWithContent(settings, configuration.content);
  await db.update(eventConfigurations).set({ content, settings, updatedAt: new Date() }).where(eq(eventConfigurations.id, configuration.id));
}

export async function saveAdminImageMetadata(input: Pick<ImageSlot, "id" | "title" | "caption" | "visible">) {
  const db = getDatabase();
  await db.update(imageSlots).set({ title: input.title, caption: input.caption, visible: input.visible, updatedAt: new Date() }).where(eq(imageSlots.id, input.id));
}
