import Link from "next/link";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12">{children}</section>
      <aside className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          configura<span className="text-accent">.</span>
        </Link>
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-primary-foreground/60">
            Tu producto, a tu manera
          </p>
          <h2 className="max-w-md text-5xl font-semibold leading-tight">
            Haz que cada producto se sienta único.
          </h2>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Diseñado para marcas que cuidan los detalles.
        </p>
      </aside>
    </main>
  );
}
