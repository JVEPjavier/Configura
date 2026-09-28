"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import {
  cartItems,
  carts,
  optionValues,
  productOptions,
  products,
  visibilityRules,
} from "@/db/schema";
import { type CartSelectionInput, validateCartSelection } from "@/lib/cart";
import type { VisibilityRule } from "@/lib/rules";

const CART_COOKIE = "configura_cart";
const cartInputSchema = z.object({
  productId: z.string().uuid(),
  selection: z.record(
    z.string().uuid(),
    z.object({
      valueIds: z.array(z.string().uuid()).max(20),
      text: z.string().max(500).optional(),
    }),
  ),
});

async function getOrCreateCart() {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get(CART_COOKIE)?.value;
  if (sessionKey) {
    const existing = await db.query.carts.findFirst({
      where: and(eq(carts.sessionKey, sessionKey), eq(carts.status, "active")),
    });
    if (existing) return existing;
  }
  const id = crypto.randomUUID();
  const newSessionKey = crypto.randomUUID();
  await db.insert(carts).values({ id, sessionKey: newSessionKey });
  cookieStore.set(CART_COOKIE, newSessionKey, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return { id, sessionKey: newSessionKey, status: "active" };
}

export async function addToCart(rawInput: unknown) {
  const parsed = cartInputSchema.safeParse(rawInput);
  if (!parsed.success) throw new Error("La configuración enviada no es válida.");
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, parsed.data.productId), eq(products.status, "published")),
  });
  if (!product) throw new Error("El producto ya no está disponible.");
  const optionRows = await db
    .select()
    .from(productOptions)
    .where(eq(productOptions.productId, product.id));
  const valueRows =
    optionRows.length === 0
      ? []
      : await db
          .select()
          .from(optionValues)
          .innerJoin(productOptions, eq(optionValues.optionId, productOptions.id))
          .where(eq(productOptions.productId, product.id));
  const ruleRows = await db
    .select()
    .from(visibilityRules)
    .where(eq(visibilityRules.productId, product.id));
  const rules: VisibilityRule[] = ruleRows.flatMap((rule) => {
    const condition = rule.condition as { valueId?: unknown; action?: unknown };
    return typeof condition.valueId === "string" &&
      (condition.action === "show" || condition.action === "hide")
      ? [
          {
            sourceOptionId: rule.sourceOptionId,
            targetOptionId: rule.targetOptionId,
            condition: { valueId: condition.valueId, action: condition.action },
          },
        ]
      : [];
  });
  const options = optionRows.map((option) => ({
    id: option.id,
    name: option.name,
    type: option.type,
    required: option.required,
    values: valueRows
      .filter((row) => row.option_values.optionId === option.id)
      .map((row) => row.option_values),
  }));
  const result = validateCartSelection(
    product.basePrice,
    options,
    rules,
    parsed.data.selection as CartSelectionInput,
  );
  const cart = await getOrCreateCart();
  const existingStore = await db
    .select({ storeId: products.storeId })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id))
    .limit(1);
  if (existingStore[0] && existingStore[0].storeId !== product.storeId)
    throw new Error("Este carrito ya contiene productos de otra tienda.");
  await db.insert(cartItems).values({
    id: crypto.randomUUID(),
    cartId: cart.id,
    productId: product.id,
    selection: result.snapshot,
    computedTotal: result.price,
  });
  revalidatePath("/carrito");
  return { total: result.price };
}

export async function removeCartItem(cartItemId: string) {
  const parsed = z.string().uuid().safeParse(cartItemId);
  if (!parsed.success) throw new Error("Ítem de carrito inválido.");
  const sessionKey = (await cookies()).get(CART_COOKIE)?.value;
  if (!sessionKey) throw new Error("No se encontró un carrito activo.");
  const cart = await db.query.carts.findFirst({
    where: and(eq(carts.sessionKey, sessionKey), eq(carts.status, "active")),
  });
  if (!cart) throw new Error("No se encontró un carrito activo.");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, parsed.data), eq(cartItems.cartId, cart.id)));
  revalidatePath("/carrito");
}
