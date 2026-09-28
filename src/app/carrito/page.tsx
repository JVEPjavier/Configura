import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { removeCartItem } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { cartItems, carts, products } from "@/db/schema";
import { db } from "@/db";
import type { CartSelectionSnapshot } from "@/lib/cart";

const CART_COOKIE = "configura_cart";

export default async function CartPage() {
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
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-xl font-semibold" href="/">
            configura<span className="text-accent">.</span>
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/"
          >
            Seguir explorando
          </Link>
        </header>
        <h1 className="mt-12 text-4xl font-semibold tracking-tight">Tu carrito</h1>
        {items.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">Aún no agregas productos</h2>
            <p className="mt-2 text-muted-foreground">
              Personaliza un producto publicado para verlo aquí.
            </p>
          </section>
        ) : (
          <>
            <section className="mt-8 space-y-4">
              {items.map(({ item, product }) => {
                const selection = item.selection as CartSelectionSnapshot;
                const remove = removeCartItem.bind(null, item.id);
                return (
                  <article className="rounded-2xl border border-border bg-card p-5" key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold">{product.name}</h2>
                        <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {Object.entries(selection).map(([optionId, value]) => (
                            <div className="flex gap-2" key={optionId}>
                              <dt>{value.optionName}:</dt>
                              <dd>{value.text ?? value.valueLabels.join(", ")}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${item.computedTotal.toLocaleString("es-CL")} CLP
                        </p>
                        <form action={remove} className="mt-3">
                          <Button size="sm" type="submit" variant="ghost">
                            Quitar
                          </Button>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
            <section className="mt-6 flex items-center justify-between rounded-2xl bg-primary p-5 text-primary-foreground">
              <span className="font-medium">Total</span>
              <div className="flex items-center gap-5">
                <span className="text-2xl font-semibold">${total.toLocaleString("es-CL")} CLP</span>
                <Link
                  className="rounded-lg bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
                  href="/checkout"
                >
                  Continuar
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
