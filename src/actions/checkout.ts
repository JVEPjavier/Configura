"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import {
  cartItems,
  carts,
  optionValues,
  orderItems,
  orders,
  productOptions,
  products,
  visibilityRules,
} from "@/db/schema";
import { type CartSelectionInput, validateCartSelection } from "@/lib/cart";
import type { VisibilityRule } from "@/lib/rules";

const CART_COOKIE = "configura_cart";
const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  customerEmail: z.string().trim().email("Escribe un correo válido.").max(254),
});
const snapshotSchema = z.record(
  z.string().uuid(),
  z.object({
    optionName: z.string(),
    valueIds: z.array(z.string().uuid()),
    valueLabels: z.array(z.string()),
    text: z.string().optional(),
  }),
);

async function revalidateCartItem(productId: string, rawSelection: unknown) {
  const selection = snapshotSchema.safeParse(rawSelection);
  if (!selection.success)
    throw new Error("Un ítem del carrito ya no es válido. Vuelve a configurarlo.");
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.status, "published")),
  });
  if (!product) throw new Error("Uno de los productos ya no está disponible.");
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
  const input: CartSelectionInput = Object.fromEntries(
    Object.entries(selection.data).map(([optionId, value]) => [
      optionId,
      { valueIds: value.valueIds, ...(value.text ? { text: value.text } : {}) },
    ]),
  );
  return {
    product,
    ...validateCartSelection(product.basePrice, options, rules, input),
  };
}

export async function completeCheckout(formData: FormData) {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Datos de checkout inválidos.");
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionKey) throw new Error("Tu carrito está vacío.");
  const cart = await db.query.carts.findFirst({
    where: and(eq(carts.sessionKey, sessionKey), eq(carts.status, "active")),
  });
  if (!cart) throw new Error("Tu carrito está vacío.");
  const items = await db
    .select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));
  if (items.length === 0) throw new Error("Tu carrito está vacío.");
  const verifiedItems = await Promise.all(
    items.map(({ item }) => revalidateCartItem(item.productId, item.selection)),
  );
  const storeId = verifiedItems[0].product.storeId;
  if (verifiedItems.some(({ product }) => product.storeId !== storeId))
    throw new Error("El carrito debe contener productos de una sola tienda.");
  const orderId = crypto.randomUUID();
  const code = `CFG-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const total = verifiedItems.reduce((sum, item) => sum + item.price, 0);
  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      storeId,
      code,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      total,
    });
    await tx.insert(orderItems).values(
      verifiedItems.map((item) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: item.product.id,
        productName: item.product.name,
        selection: item.snapshot,
        unitTotal: item.price,
      })),
    );
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    await tx
      .update(carts)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(carts.id, cart.id));
  });
  cookieStore.delete(CART_COOKIE);
  redirect(`/confirmacion/${orderId}`);
}
