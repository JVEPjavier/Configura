import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { completeCheckout } from "@/actions/checkout";
import { cartItems, carts, products } from "@/db/schema";
import { db } from "@/db";
import { Button } from "@/components/ui/button";

const CART_COOKIE = "configura_cart";

export default async function CheckoutPage() {
  const sessionKey = (await cookies()).get(CART_COOKIE)?.value;
  const items = sessionKey
    ? await db
        .select({ item: cartItems, product: products })
        .from(cartItems)
        .innerJoin(carts, eq(cartItems.cartId, carts.id))
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(and(eq(carts.sessionKey, sessionKey), eq(carts.status, "active")))
    : [];
  const total = items.reduce((sum, { item }) => sum + item.computedTotal, 0);

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1fr_.8fr]">
        <section>
          <Link className="text-xl font-semibold" href="/carrito">
            ← Volver al carrito
          </Link>
          <p className="mt-12 text-sm font-medium text-muted-foreground">
            Checkout de demostración
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Confirma tu pedido</h1>
          <p className="mt-3 text-muted-foreground">
            No solicitaremos pago: este flujo solo registra un pedido de prueba.
          </p>
          {items.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-border p-5 text-muted-foreground">
              Tu carrito está vacío.{" "}
              <Link className="underline" href="/carrito">
                Volver al carrito
              </Link>
            </p>
          ) : (
            <form
              action={completeCheckout}
              className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
            >
              <label className="block text-sm font-medium" htmlFor="customerName">
                Nombre
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                  id="customerName"
                  name="customerName"
                  required
                />
              </label>
              <label className="block text-sm font-medium" htmlFor="customerEmail">
                Correo electrónico
                <input
                  className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  type="email"
                />
              </label>
              <Button className="w-full" size="lg" type="submit">
                Confirmar pedido de demostración
              </Button>
            </form>
          )}
        </section>
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:mt-16">
          <h2 className="font-semibold">Resumen</h2>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            {items.map(({ item, product }) => (
              <div className="flex justify-between gap-4" key={item.id}>
                <span>{product.name}</span>
                <span>${item.computedTotal.toLocaleString("es-CL")}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-5 font-semibold">
            <span>Total</span>
            <span>${total.toLocaleString("es-CL")} CLP</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
