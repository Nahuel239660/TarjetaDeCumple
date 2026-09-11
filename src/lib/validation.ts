import { z } from "zod";

const text = (maximum: number) => z.string().trim().max(maximum);
const requiredName = text(160).min(2, "Escribí tu nombre y apellido.");

export const keyAttendanceSchema = z.enum(["yes", "no", "maybe"]);
export const directionsProviderSchema = z.enum(["google", "waze", "custom"]);
export const imageSlotKeySchema = z.enum(["nahuel", "fernet", "kevin"]);

export const publicRsvpSchema = z.object({
  fullName: requiredName,
  attendingPeatonal: z.boolean(),
  attendingKey: keyAttendanceSchema,
  hasPlusOne: z.boolean(),
  plusOneName: text(160),
  comment: text(1_000),
  confirmDuplicate: z.boolean().optional().default(false),
}).superRefine((value, context) => {
  if (value.hasPlusOne && value.plusOneName.length < 2) {
    context.addIssue({ code: "custom", path: ["plusOneName"], message: "Escribí el nombre de tu +1." });
  }
});

export const adminGuestUpdateSchema = z.object({
  id: z.uuid(),
  fullName: requiredName,
  attendingPeatonal: z.boolean().nullable(),
  attendingKey: keyAttendanceSchema.nullable(),
  hasPlusOne: z.boolean(),
  plusOneName: text(160),
  comment: text(1_000),
}).superRefine((value, context) => {
  if (value.hasPlusOne && value.plusOneName.length < 2) {
    context.addIssue({ code: "custom", path: ["plusOneName"], message: "Escribí el nombre de tu +1." });
  }
});

const stopSchema = z.object({
  title: text(160),
  copy: text(2_000),
  dateLabel: text(120),
  startTime: text(32),
  endTime: text(32),
  timeLabel: text(80),
  venue: text(160),
  address: text(300),
  showMap: z.boolean(),
  directionsLabel: text(100),
  visible: z.boolean(),
});

export const eventContentSchema = z.object({
  heroLabel: text(120),
  heroTitle: text(240),
  heroBody: text(3_000),
  heroPrimaryCta: text(100),
  heroSecondaryCta: text(100),
  peatonal: stopSchema,
  key: stopSchema,
  rsvpTitle: text(160),
  rsvpHelper: text(1_000),
  rsvpSubmitLabel: text(100),
  rsvpSuccessTitle: text(240),
  rsvpSuccessBody: text(1_000),
});

const locationSchema = z.object({
  venue: text(160),
  address: text(300),
  latitude: text(48),
  longitude: text(48),
  showMap: z.boolean(),
  directionsLabel: text(100),
  directionsProvider: directionsProviderSchema,
  customDirectionsUrl: text(500),
});

const entranceAnimationSchema = z.object({
  enabled: z.boolean(),
  type: z.literal("clam"),
  frequency: z.enum(["session", "always", "device"]),
  durationMs: z.number().int().min(500).max(10_000),
  allowSkip: z.boolean(),
  primaryText: text(80),
  secondaryText: text(120),
  showDate: z.boolean(),
});

export const eventSettingsSchema = z.object({
  eventName: text(180),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cityLabel: text(100),
  timezone: text(100),
  peatonal: locationSchema,
  key: locationSchema,
  qrEnabled: z.boolean(),
  entranceAnimation: entranceAnimationSchema,
});

export const customContentBlockSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(160),
  content: text(3_000),
  visible: z.boolean(),
  ctaLabel: text(120),
  ctaUrl: text(500),
});

export const imageMetadataSchema = z.object({
  id: imageSlotKeySchema,
  title: text(160),
  caption: text(300),
  visible: z.boolean(),
});
