"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { productImageExtension } from "@/lib/product-image";
import { ensureStorageBucket, storage, storageBucket } from "@/lib/storage";

export async function uploadProductImage(productId: string, formData: FormData) {
  const file = formData.get("imageFile");
  if (!(file instanceof File)) throw new Error("Selecciona una imagen.");
  const extension = productImageExtension(file);
  const session = await authSession();
  const owned = await db
    .select({ id: products.id })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(and(eq(products.id, productId), eq(stores.ownerId, session.user.id)))
    .limit(1);
  if (!owned[0]) throw new Error("Producto no encontrado.");
  const objectName = `${productId}/${crypto.randomUUID()}.${extension}`;
  await ensureStorageBucket();
  await storage.putObject(
    storageBucket,
    objectName,
    Buffer.from(await file.arrayBuffer()),
    file.size,
    { "Content-Type": file.type },
  );
  await db
    .update(products)
    .set({ imageUrl: `/api/assets/${objectName}`, updatedAt: new Date() })
    .where(eq(products.id, productId));
  revalidatePath(`/app/productos/${productId}/editar`);
  revalidatePath("/app/productos");
}

export async function removeProductImage(productId: string) {
  const session = await authSession();
  const owned = await db
    .select({ imageUrl: products.imageUrl })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(and(eq(products.id, productId), eq(stores.ownerId, session.user.id)))
    .limit(1);
  const product = owned[0];
  if (!product) throw new Error("Producto no encontrado.");

  if (product.imageUrl?.startsWith("/api/assets/")) {
    await storage.removeObject(storageBucket, product.imageUrl.slice("/api/assets/".length));
  }
  await db
    .update(products)
    .set({ imageUrl: null, updatedAt: new Date() })
    .where(eq(products.id, productId));
  revalidatePath(`/app/productos/${productId}/editar`);
  revalidatePath("/app/productos");
}

async function authSession() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}
