"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { auth } from "@/lib/auth";

const storeSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre de al menos 2 caracteres.").max(100),
  slug: z
    .string()
    .trim()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  description: z.string().trim().max(500).optional(),
});

export async function updateStore(formData: FormData) {
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Datos de tienda inválidos.");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const store = await db.query.stores.findFirst({ where: eq(stores.ownerId, session.user.id) });
  if (!store) throw new Error("No se encontró una tienda para esta cuenta.");
  const duplicate = await db.query.stores.findFirst({
    where: and(eq(stores.slug, parsed.data.slug), ne(stores.id, store.id)),
  });
  if (duplicate) throw new Error("Ese slug ya está en uso.");
  await db
    .update(stores)
    .set({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(and(eq(stores.id, store.id), eq(stores.ownerId, session.user.id)));
  revalidatePath("/app");
  revalidatePath("/app/configuracion");
}
