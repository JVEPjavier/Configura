import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-14 flex items-center justify-between">
          <span className="text-xl font-semibold">
            configura<span className="text-accent">.</span>
          </span>
          <span className="text-sm text-muted-foreground">{session.user.email}</span>
        </header>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Tu espacio</p>
        <h1 className="text-4xl font-semibold tracking-tight">Empieza por tu catálogo.</h1>
        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <p className="text-sm font-medium text-muted-foreground">Productos</p>
          <p className="mt-2 max-w-xl text-lg">
            Crea un producto base y déjalo listo para añadir opciones, precios y reglas.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/app/productos" />}>
            Ver productos
          </Button>
        </div>
      </div>
    </main>
  );
}
