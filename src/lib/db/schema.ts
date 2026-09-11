import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import type { EventContent, EventSettings } from "@/lib/models";

export const eventConfigurations = pgTable("event_configurations", {
  id: integer("id").primaryKey(),
  content: jsonb("content").$type<EventContent>().notNull(),
  settings: jsonb("settings").$type<EventSettings>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [check("event_configurations_single_row", sql`${table.id} = 1`)]);

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey(),
  guestNumber: serial("guest_number").notNull().unique(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  normalizedName: varchar("normalized_name", { length: 160 }).notNull(),
  attendingPeatonal: boolean("attending_peatonal"),
  attendingKey: varchar("attending_key", { length: 12 }),
  hasPlusOne: boolean("has_plus_one").notNull().default(false),
  plusOneName: varchar("plus_one_name", { length: 160 }).notNull().default(""),
  comment: text("comment").notNull().default(""),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("guests_normalized_name_idx").on(table.normalizedName),
]);

export const customContentBlocks = pgTable("custom_content_blocks", {
  id: uuid("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  content: text("content").notNull(),
  visible: boolean("visible").notNull().default(true),
  ctaLabel: varchar("cta_label", { length: 120 }).notNull().default(""),
  ctaUrl: varchar("cta_url", { length: 500 }).notNull().default(""),
  sortOrder: serial("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const imageSlots = pgTable("image_slots", {
  id: varchar("id", { length: 24 }).primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  caption: varchar("caption", { length: 300 }).notNull().default(""),
  src: varchar("src", { length: 300 }).notNull(),
  visible: boolean("visible").notNull().default(true),
  aspectRatio: varchar("aspect_ratio", { length: 16 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
