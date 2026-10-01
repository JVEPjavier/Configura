import Link from "next/link";
import { and, desc, eq, notLike } from "drizzle-orm";
import { ArrowRight, ArrowUpRight, Check, Layers3, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { products, stores, user } from "@/db/schema";

export const dynamic = "force-dynamic";

type StoreRecommendation = {
  storeName: string;
  storeSlug: string;
  storeDescription: string | null;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  basePrice: number;
};

async function getStoreRecommendations(): Promise<StoreRecommendation[]> {
  const rows = await db
    .select({
      storeName: stores.name,
      storeSlug: stores.slug,
      storeDescription: stores.description,
      productName: products.name,
      productSlug: products.slug,
      productImageUrl: products.imageUrl,
      basePrice: products.basePrice,
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .innerJoin(user, eq(stores.ownerId, user.id))
    .where(and(eq(products.status, "published"), notLike(user.email, "%@example.test")))
    .orderBy(desc(products.updatedAt))
    .limit(12);

  const recommendations = new Map<string, StoreRecommendation>();
  for (const row of rows) {
    if (!recommendations.has(row.storeSlug)) recommendations.set(row.storeSlug, row);
    if (recommendations.size === 3) break;
  }
  return [...recommendations.values()];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Home() {
  const recommendations = await getStoreRecommendations();

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="text-lg font-semibold tracking-tight text-foreground" href="/">
          configura<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" href="#como-funciona">
            Cómo funciona
          </Link>
          <Link className="transition-colors hover:text-foreground" href="#tiendas">
            Tiendas
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <Button nativeButton={false} render={<Link href="/login" />} size="sm" variant="ghost">
            Entrar
          </Button>
          <Button nativeButton={false} render={<Link href="/registro" />} size="sm">
            Crear tienda <ArrowUpRight />
          </Button>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-[-18rem] h-[48rem] bg-[radial-gradient(ellipse_at_center,rgba(76,156,255,0.2),transparent_63%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32">
          <div className="flex max-w-2xl flex-col justify-center">
            <Badge className="mb-7 w-fit border border-[#253654] bg-[#111b30] px-3 py-1 text-[#b9d9ff] hover:bg-[#111b30]">
              <Sparkles className="size-3.5" /> COMERCIO PERSONALIZABLE
            </Badge>
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground">CONFIGURA TU CATÁLOGO</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
              Productos que se sienten tan únicos como tu marca.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Crea productos con opciones, precios dinámicos y reglas de visibilidad. Todo en un
              configurador claro para ti y tus clientes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link href="/registro" />} size="lg">
                Crear mi tienda <ArrowRight />
              </Button>
              <Button nativeButton={false} render={<Link href="#tiendas" />} size="lg" variant="outline">
                Explorar tiendas
              </Button>
            </div>
            <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#72d6a3]" /> Opciones y ajustes de precio
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-[#72d6a3]" /> Checkout listo para tu catálogo
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:pt-5">
            <div className="absolute inset-8 rounded-full bg-[#2d8cff]/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 shadow-[0_32px_100px_rgba(0,0,0,0.35)] sm:p-5">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-[#1b2944] text-accent">
                    <Layers3 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Editor de producto</p>
                    <p className="text-xs text-muted-foreground">Vista previa en vivo</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#72d6a3]/10 px-2.5 py-1 text-xs font-medium text-[#a6ebc8]">
                  Publicado
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-[1.05fr_.95fr]">
                <div className="relative min-h-60 overflow-hidden rounded-xl border border-border-subtle bg-[radial-gradient(circle_at_50%_10%,#254e82,transparent_50%),#0a1122]">
                  <div className="absolute inset-x-[20%] bottom-[16%] top-[25%] rounded-b-[38%] rounded-t-[28%] border-[10px] border-[#ddebff] bg-[#68b8ff] shadow-[0_0_40px_rgba(104,184,255,0.3)]" />
                  <div className="absolute right-[13%] top-[43%] size-[25%] rounded-full border-[9px] border-[#ddebff]" />
                  <span className="absolute bottom-3 left-3 rounded-md bg-[#080d1b]/80 px-2 py-1 text-xs text-[#ddebff]">
                    Vista previa
                  </span>
                </div>
                <div className="space-y-3 rounded-xl border border-border-subtle bg-[#0d1426] p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Producto</p>
                    <p className="mt-1 font-semibold">Taza de cerámica</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-[#111b30] p-2.5 text-xs">
                    <p className="text-muted-foreground">Color de esmalte</p>
                    <p className="mt-1 font-medium text-[#b9d9ff]">Azul noche · +$1.000</p>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-[#111b30] p-2.5 text-xs">
                    <p className="text-muted-foreground">Total estimado</p>
                    <p className="mt-1 text-base font-semibold tabular-nums">$25.000 CLP</p>
                  </div>
                  <div className="h-8 rounded-lg bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border-subtle bg-[#0d1426]/80" id="como-funciona">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ["01", "Define tu producto", "Crea el producto base, imagen y precio inicial."],
            ["02", "Añade decisiones", "Configura colores, textos, selecciones y ajustes."],
            ["03", "Comparte y vende", "Publica una página clara para que tus clientes configuren."],
          ].map(([number, title, description]) => (
            <article className="border-l border-border pl-5" key={number}>
              <p className="text-xs font-semibold tracking-[0.2em] text-accent">{number}</p>
              <h2 className="mt-3 text-lg font-semibold">{title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="tiendas">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground">HECHO CON CONFIGURA</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Mira tiendas que ya están funcionando.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              Explora productos reales publicados por comercios que usan Configura.
            </p>
          </div>
          <Store className="mb-1 hidden size-7 text-accent sm:block" />
        </div>

        {recommendations.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((store) => (
              <Link
                className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-accent/60 hover:bg-[#17243d] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                href={`/tienda/${store.storeSlug}/${store.productSlug}`}
                key={store.storeSlug}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0d1426]">
                  {store.productImageUrl ? (
                    // Las imágenes pueden ser assets locales de MinIO o URL externas.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={store.productName}
                      className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      src={store.productImageUrl}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(104,184,255,0.32),transparent_44%),linear-gradient(135deg,#152744,#0a1122)]" />
                  )}
                  <span className="absolute left-4 top-4 rounded-full border border-[#72d6a3]/30 bg-[#080d1b]/80 px-2.5 py-1 text-xs font-medium text-[#a6ebc8]">
                    Tienda activa
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#b9d9ff]">{store.storeName}</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="font-semibold">{store.productName}</h3>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-accent" />
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                    {store.storeDescription || `Personaliza ${store.productName.toLowerCase()} a tu manera.`}
                  </p>
                  <p className="mt-4 font-semibold tabular-nums">Desde {formatPrice(store.basePrice)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Las primeras tiendas publicadas aparecerán aquí.
          </div>
        )}
      </section>
    </main>
  );
}
