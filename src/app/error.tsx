"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <section>
        <p className="text-sm font-medium text-accent">Algo no salió bien</p>
        <h1 className="mt-2 text-4xl font-semibold">No pudimos completar esta acción.</h1>
        <p className="mt-3 text-muted-foreground">Inténtalo nuevamente o vuelve al inicio.</p>
        <div className="mt-7 flex justify-center gap-3">
          <button
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            onClick={reset}
            type="button"
          >
            Reintentar
          </button>
          <Link
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
            href="/"
          >
            Inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
