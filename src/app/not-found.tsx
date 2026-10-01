import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <section>
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 text-4xl font-semibold">No encontramos esta página.</h1>
        <p className="mt-3 text-muted-foreground">
          Puede que el enlace haya cambiado o el producto ya no esté disponible.
        </p>
        <Link
          className="mt-7 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          href="/"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
