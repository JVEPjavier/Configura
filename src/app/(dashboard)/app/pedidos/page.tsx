import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const store = await db.query.stores.findFirst({ where: eq(stores.ownerId, session.user.id) });
  if (!store) redirect("/app");
  const items = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, store.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-xl font-semibold" href="/app">
            configura<span className="text-accent">.</span>
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/app/productos"
          >
            Ver productos
          </Link>
        </header>
        <p className="mt-12 text-sm font-medium text-muted-foreground">{store.name}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pedidos de demostración</h1>
        {items.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">Aún no hay pedidos</h2>
            <p className="mt-2 text-muted-foreground">
              Los pedidos confirmados desde tu configurador aparecerán aquí.
            </p>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
              <span>Pedido</span>
              <span>Cliente</span>
              <span>Total</span>
            </div>
            {items.map((order) => (
              <div
                className="grid grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-border px-5 py-4 text-sm last:border-b-0"
                key={order.id}
              >
                <div>
                  <p className="font-semibold">{order.code}</p>
                  <p className="mt-1 text-muted-foreground">
                    {order.createdAt.toLocaleDateString("es-CL")}
                  </p>
                </div>
                <div>
                  <p>{order.customerName}</p>
                  <p className="mt-1 truncate text-muted-foreground">{order.customerEmail}</p>
                </div>
                <span className="font-semibold">${order.total.toLocaleString("es-CL")}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
