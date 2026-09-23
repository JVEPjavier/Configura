"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { optionValues, productOptions, products, stores, visibilityRules } from "@/db/schema";
import { auth } from "@/lib/auth";

const ruleSchema = z.object({
  source: z.string().uuid(),
  targetOptionId: z.string().uuid(),
  action: z.enum(["show", "hide"]),
});

async function assertOwnedProduct(productId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const result = await db
    .select({ id: products.id })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(and(eq(products.id, productId), eq(stores.ownerId, session.user.id)))
    .limit(1);
  if (!result[0]) throw new Error("Producto no encontrado.");
}

export async function createVisibilityRule(productId: string, formData: FormData) {
  const parsed = ruleSchema.safeParse({
    source: formData.get("source"),
    targetOptionId: formData.get("targetOptionId"),
    action: formData.get("action"),
  });
  if (!parsed.success) throw new Error("Completa la condición de la regla.");
  const [sourceOptionId, valueId] = parsed.data.source.split(":");
  if (!sourceOptionId || !valueId || sourceOptionId === parsed.data.targetOptionId)
    throw new Error("El origen y destino deben ser opciones diferentes.");
  await assertOwnedProduct(productId);
  const sourceValue = await db
    .select({ id: optionValues.id })
    .from(optionValues)
    .innerJoin(productOptions, eq(optionValues.optionId, productOptions.id))
    .where(
      and(
        eq(optionValues.id, valueId),
        eq(optionValues.optionId, sourceOptionId),
        eq(productOptions.productId, productId),
      ),
    )
    .limit(1);
  const target = await db
    .select({ id: productOptions.id })
    .from(productOptions)
    .where(
      and(
        eq(productOptions.id, parsed.data.targetOptionId),
        eq(productOptions.productId, productId),
      ),
    )
    .limit(1);
  if (!sourceValue[0] || !target[0]) throw new Error("La regla no pertenece a este producto.");
  await db.insert(visibilityRules).values({
    id: crypto.randomUUID(),
    productId,
    sourceOptionId,
    targetOptionId: parsed.data.targetOptionId,
    condition: { valueId, action: parsed.data.action },
  });
  revalidatePath(`/app/productos/${productId}/editar`);
}

export async function deleteVisibilityRule(productId: string, ruleId: string) {
  await assertOwnedProduct(productId);
  await db
    .delete(visibilityRules)
    .where(and(eq(visibilityRules.id, ruleId), eq(visibilityRules.productId, productId)));
  revalidatePath(`/app/productos/${productId}/editar`);
}
