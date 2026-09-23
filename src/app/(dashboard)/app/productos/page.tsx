import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function ProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const store = await db.query.stores.findFirst({ where: eq(stores.ownerId, session.user.id) });
  if (!store) redirect("/app");
  const items = await db
    .select()
    .from(products)
    .where(eq(products.storeId, store.id))
    .orderBy(desc(products.updatedAt));

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <Link className="text-xl font-semibold" href="/app">
            configura<span className="text-accent">.</span>
          </Link>
          <Button nativeButton={false} render={<Link href="/app/productos/nuevo" />}>
            Crear producto
          </Button>
        </header>
        <p className="text-sm font-medium text-muted-foreground">{store.name}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">Productos</h1>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </span>
        </div>
        {items.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold">Todavía no tienes productos</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Crea tu primer producto para configurar sus opciones y compartirlo cuando esté listo.
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href="/app/productos/nuevo" />}
            >
              Crear mi primer producto
            </Button>
          </section>
        ) : (
          <section className="mt-10 grid gap-4">
            {items.map((product) => (
              <Link
                className="group rounded-2xl border border-border bg-card p-5 transition hover:border-accent"
                href={`/app/productos/${product.id}/editar`}
                key={product.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {product.description || "Sin descripción"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.status === "published" ? "bg-[#e2ece0] text-[#41613d]" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {product.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <p className="mt-5 text-sm font-medium">
                  ${product.basePrice.toLocaleString("es-CL")} CLP
                </p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
