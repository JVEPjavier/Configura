import Link from "next/link";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateStore } from "@/actions/stores";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function StoreSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const store = await db.query.stores.findFirst({ where: eq(stores.ownerId, session.user.id) });
  if (!store) redirect("/app");
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          href="/app"
        >
          ← Volver al panel
        </Link>
        <p className="mt-12 text-sm font-medium text-muted-foreground">Tienda</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Configuración</h1>
        <form
          action={updateStore}
          className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
        >
          <label className="block text-sm font-medium" htmlFor="name">
            Nombre
            <input
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
              defaultValue={store.name}
              id="name"
              name="name"
              required
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="slug">
            URL pública
            <input
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
              defaultValue={store.slug}
              id="slug"
              name="slug"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="description">
            Descripción
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
              defaultValue={store.description ?? ""}
              id="description"
              maxLength={500}
              name="description"
            />
          </label>
          <Button size="lg" type="submit">
            Guardar configuración
          </Button>
        </form>
      </div>
    </main>
  );
}
