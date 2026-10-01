"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { auth } from "@/lib/auth";
import { productImageExtension } from "@/lib/product-image";
import { ensureStorageBucket, storage, storageBucket } from "@/lib/storage";

const productSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre de al menos 2 caracteres.").max(120),
  description: z.string().trim().max(1_000).optional(),
  imageUrl: z.union([
    z.string().url("La imagen debe ser una URL válida."),
    z.string().startsWith("/api/assets/"),
    z.literal(""),
  ]),
  basePrice: z.coerce.number().int().min(0, "El precio no puede ser negativo.").max(10_000_000),
});

async function currentStore() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const store = await db.query.stores.findFirst({
    where: eq(stores.ownerId, session.user.id),
  });
  if (!store) throw new Error("No se encontró una tienda para esta cuenta.");
  return store;
}

function productSlug(name: string) {
  const base =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64) || "producto";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl"),
    basePrice: formData.get("basePrice"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");

  const store = await currentStore();
  const id = crypto.randomUUID();
  const imageUrl = await imageUrlForProduct(id, formData, parsed.data.imageUrl);
  await db.insert(products).values({
    id,
    storeId: store.id,
    slug: productSlug(parsed.data.name),
    name: parsed.data.name,
    description: parsed.data.description || null,
    imageUrl,
    basePrice: parsed.data.basePrice,
  });
  redirect(`/app/productos/${id}/editar`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl"),
    basePrice: formData.get("basePrice"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos.");

  const store = await currentStore();
  const imageUrl = await imageUrlForProduct(productId, formData, parsed.data.imageUrl);
  const result = await db
    .update(products)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      imageUrl,
      basePrice: parsed.data.basePrice,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.storeId, store.id)))
    .returning({ id: products.id });
  if (!result[0]) throw new Error("Producto no encontrado.");
  redirect("/app/productos");
}

async function imageUrlForProduct(productId: string, formData: FormData, imageUrl: string) {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return imageUrl || null;

  const extension = productImageExtension(file);
  const objectName = `${productId}/${crypto.randomUUID()}.${extension}`;
  await ensureStorageBucket();
  await storage.putObject(
    storageBucket,
    objectName,
    Buffer.from(await file.arrayBuffer()),
    file.size,
    { "Content-Type": file.type },
  );
  return `/api/assets/${objectName}`;
}

export async function toggleProductPublication(productId: string, status: "draft" | "published") {
  const store = await currentStore();
  const result = await db
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.storeId, store.id)))
    .returning({ id: products.id });
  if (!result[0]) throw new Error("Producto no encontrado.");
  revalidatePath(`/app/productos/${productId}/editar`);
  revalidatePath("/app/productos");
}

export async function deleteProduct(productId: string) {
  const store = await currentStore();
  const result = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.storeId, store.id)))
    .returning({ id: products.id });
  if (!result[0]) throw new Error("Producto no encontrado.");
  revalidatePath("/app/productos");
  redirect("/app/productos");
}
