"use server";

import "server-only";

import bcrypt from "bcryptjs";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, requireAdminAction } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  createPublicGuest,
  getAdminEventState,
  hasPossiblePublicDuplicate,
  removeAdminGuest,
  saveAdminContent,
  saveAdminImageMetadata,
  saveAdminSettings,
  updateAdminGuest,
} from "@/lib/event-repository.server";
import {
  adminGuestUpdateSchema,
  customContentBlockSchema,
  eventContentSchema,
  eventSettingsSchema,
  imageMetadataSchema,
  publicRsvpSchema,
} from "@/lib/validation";

const configurationError = "La base de datos todavía no está configurada.";

function revalidateEvent() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/invitados");
  revalidatePath("/admin/invitacion");
  revalidatePath("/admin/imagenes");
  revalidatePath("/admin/configuracion");
}

export type PublicRsvpResult =
  | { status: "created" }
  | { status: "possible-duplicate" }
  | { status: "error"; message: string };

export async function submitPublicRsvp(input: unknown): Promise<PublicRsvpResult> {
  const parsed = publicRsvpSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." };
  if (!isDatabaseConfigured()) return { status: "error", message: configurationError };

  const { confirmDuplicate, ...guest } = parsed.data;
  if (!confirmDuplicate && await hasPossiblePublicDuplicate(guest.fullName)) {
    return { status: "possible-duplicate" };
  }

  await createPublicGuest(guest);
  revalidateEvent();
  return { status: "created" };
}

export async function loginAdmin(_previousState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || !process.env.SESSION_SECRET) return { error: "Falta configurar el acceso de administración." };
  if (!password || !await bcrypt.compare(password, passwordHash)) return { error: "La contraseña no es correcta." };

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

async function stateAfterAdminMutation() {
  revalidateEvent();
  return getAdminEventState();
}

export async function updateGuestAction(input: unknown) {
  const parsed = adminGuestUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);
  await updateAdminGuest(parsed.data);
  return stateAfterAdminMutation();
}

export async function deleteGuestAction(id: unknown) {
  const parsed = adminGuestUpdateSchema.shape.id.safeParse(id);
  if (!parsed.success) throw new Error("Invitado inválido.");
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);
  await removeAdminGuest(parsed.data);
  return stateAfterAdminMutation();
}

export async function updateContentAction(input: unknown) {
  const parsed = eventContentSchema.safeParse((input as { content?: unknown })?.content);
  const blocks = (input as { customBlocks?: unknown })?.customBlocks;
  const parsedBlocks = customContentBlockSchema.array().max(20).safeParse(blocks);
  if (!parsed.success || !parsedBlocks.success) throw new Error("Los cambios de invitación no son válidos.");
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);
  await saveAdminContent(parsed.data, parsedBlocks.data.map((block) => ({ ...block, id: block.id ?? crypto.randomUUID() })));
  return stateAfterAdminMutation();
}

export async function updateSettingsAction(input: unknown) {
  const parsed = eventSettingsSchema.safeParse(input);
  if (!parsed.success) throw new Error("Los cambios de configuración no son válidos.");
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);
  await saveAdminSettings(parsed.data);
  return stateAfterAdminMutation();
}

export async function updateImageMetadataAction(input: unknown) {
  const parsed = imageMetadataSchema.safeParse(input);
  if (!parsed.success) throw new Error("Los datos de imagen no son válidos.");
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);
  await saveAdminImageMetadata(parsed.data);
  return stateAfterAdminMutation();
}

export async function updateImageAction(formData: FormData) {
  await requireAdminAction();
  if (!isDatabaseConfigured()) throw new Error(configurationError);

  const parsed = imageMetadataSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    caption: formData.get("caption"),
    visible: formData.get("visible") === "true",
  });
  if (!parsed.success) throw new Error("Los datos de imagen no son válidos.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    await saveAdminImageMetadata(parsed.data);
    return stateAfterAdminMutation();
  }
  if (!file.type.startsWith("image/")) throw new Error("Elegí un archivo de imagen válido.");
  if (file.size > 2.5 * 1024 * 1024) throw new Error("La imagen supera el máximo de 2,5 MB.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Falta configurar BLOB_READ_WRITE_TOKEN para guardar imágenes.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const blob = await put(`event-images/${parsed.data.id}.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  try {
    await saveAdminImageMetadata({ ...parsed.data, src: blob.url });
  } catch (error) {
    await del(blob.url).catch(() => undefined);
    throw error;
  }

  return stateAfterAdminMutation();
}
