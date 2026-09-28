"use server";

import { and, asc, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { optionValues, productOptions, products, stores } from "@/db/schema";
import { auth } from "@/lib/auth";

const optionSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre de al menos 2 caracteres.").max(80),
  type: z.enum(["select", "color", "text", "checkbox"]),
  required: z.boolean(),
});

const valueSchema = z.object({
  label: z.string().trim().min(1, "Escribe una etiqueta.").max(80),
  value: z.string().trim().min(1, "Escribe un valor.").max(100),
  priceDelta: z.coerce.number().int().min(-10_000_000).max(10_000_000),
});

const directionSchema = z.enum(["up", "down"]);

async function ownedProduct(productId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const product = await db
    .select({ id: products.id })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(and(eq(products.id, productId), eq(stores.ownerId, session.user.id)))
    .limit(1);
  if (!product[0]) throw new Error("Producto no encontrado.");
  return product[0];
}

export async function createProductOption(productId: string, formData: FormData) {
  const parsed = optionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    required: formData.get("required") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  await ownedProduct(productId);
  const [{ total }] = await db
    .select({ total: count() })
    .from(productOptions)
    .where(eq(productOptions.productId, productId));
  await db.insert(productOptions).values({
    id: crypto.randomUUID(),
    productId,
    name: parsed.data.name,
    type: parsed.data.type,
    required: parsed.data.required,
    position: total,
  });
  revalidatePath(`/app/productos/${productId}/editar`);
}

export async function createOptionValue(productId: string, optionId: string, formData: FormData) {
  const parsed = valueSchema.safeParse({
    label: formData.get("label"),
    value: formData.get("value"),
    priceDelta: formData.get("priceDelta"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");
  await ownedProduct(productId);
  const option = await db
    .select({ id: productOptions.id })
    .from(productOptions)
    .where(and(eq(productOptions.id, optionId), eq(productOptions.productId, productId)))
    .limit(1);
  if (!option[0]) throw new Error("Opción no encontrada.");
  const [{ total }] = await db
    .select({ total: count() })
    .from(optionValues)
    .where(eq(optionValues.optionId, optionId));
  await db.insert(optionValues).values({
    id: crypto.randomUUID(),
    optionId,
    label: parsed.data.label,
    value: parsed.data.value,
    priceDelta: parsed.data.priceDelta,
    position: total,
  });
  revalidatePath(`/app/productos/${productId}/editar`);
}

export async function moveProductOption(productId: string, optionId: string, direction: unknown) {
  const parsedDirection = directionSchema.safeParse(direction);
  if (!parsedDirection.success) throw new Error("Dirección de orden inválida.");
  await ownedProduct(productId);
  const options = await db
    .select({ id: productOptions.id, position: productOptions.position })
    .from(productOptions)
    .where(eq(productOptions.productId, productId))
    .orderBy(asc(productOptions.position));
  const index = options.findIndex((option) => option.id === optionId);
  if (index === -1) throw new Error("Opción no encontrada.");
  const neighbor = options[index + (parsedDirection.data === "up" ? -1 : 1)];
  if (!neighbor) return;
  await db.transaction(async (tx) => {
    await tx
      .update(productOptions)
      .set({ position: neighbor.position, updatedAt: new Date() })
      .where(eq(productOptions.id, optionId));
    await tx
      .update(productOptions)
      .set({ position: options[index].position, updatedAt: new Date() })
      .where(eq(productOptions.id, neighbor.id));
  });
  revalidatePath(`/app/productos/${productId}/editar`);
}

export async function moveOptionValue(
  productId: string,
  optionId: string,
  valueId: string,
  direction: unknown,
) {
  const parsedDirection = directionSchema.safeParse(direction);
  if (!parsedDirection.success) throw new Error("Dirección de orden inválida.");
  await ownedProduct(productId);
  const option = await db
    .select({ id: productOptions.id })
    .from(productOptions)
    .where(and(eq(productOptions.id, optionId), eq(productOptions.productId, productId)))
    .limit(1);
  if (!option[0]) throw new Error("Opción no encontrada.");
  const values = await db
    .select({ id: optionValues.id, position: optionValues.position })
    .from(optionValues)
    .where(eq(optionValues.optionId, optionId))
    .orderBy(asc(optionValues.position));
  const index = values.findIndex((value) => value.id === valueId);
  if (index === -1) throw new Error("Valor no encontrado.");
  const neighbor = values[index + (parsedDirection.data === "up" ? -1 : 1)];
  if (!neighbor) return;
  await db.transaction(async (tx) => {
    await tx
      .update(optionValues)
      .set({ position: neighbor.position, updatedAt: new Date() })
      .where(eq(optionValues.id, valueId));
    await tx
      .update(optionValues)
      .set({ position: values[index].position, updatedAt: new Date() })
      .where(eq(optionValues.id, neighbor.id));
  });
  revalidatePath(`/app/productos/${productId}/editar`);
}
