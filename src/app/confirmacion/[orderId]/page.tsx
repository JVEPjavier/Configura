import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { orderItems, orders, stores } from "@/db/schema";
import { db } from "@/db";
import type { CartSelectionSnapshot } from "@/lib/cart";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const result = await db
    .select({ order: orders, storeName: stores.name })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!result[0]) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const { order, storeName } = result[0];

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
        <p className="text-sm font-medium text-[#41613d]">Pedido de demostración confirmado</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          ¡Gracias, {order.customerName}!
        </h1>
        <p className="mt-4 text-muted-foreground">
          Registramos tu pedido para <strong>{storeName}</strong>. No se realizó ningún cobro.
        </p>
        <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm">
          Código de pedido: <strong>{order.code}</strong>
        </p>
        <div className="mt-8 space-y-4 text-left">
          {items.map((item) => {
            const selection = item.selection as CartSelectionSnapshot;
            return (
              <article className="rounded-xl border border-border p-4" key={item.id}>
                <div className="flex justify-between gap-4">
                  <h2 className="font-semibold">{item.productName}</h2>
                  <span>${item.unitTotal.toLocaleString("es-CL")}</span>
                </div>
                <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {Object.entries(selection).map(([optionId, value]) => (
                    <div className="flex gap-2" key={optionId}>
                      <dt>{value.optionName}:</dt>
                      <dd>{value.text ?? value.valueLabels.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
        <div className="mt-8 flex justify-between border-t border-border pt-6 text-lg font-semibold">
          <span>Total</span>
          <span>${order.total.toLocaleString("es-CL")} CLP</span>
        </div>
        <Link className="mt-8 inline-block text-sm font-semibold underline" href="/">
          Volver a Configura
        </Link>
      </section>
    </main>
  );
}
