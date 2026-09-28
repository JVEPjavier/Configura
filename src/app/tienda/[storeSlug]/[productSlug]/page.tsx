import Link from "next/link";
import Image from "next/image";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StorefrontConfigurator } from "@/components/storefront-configurator";
import { db } from "@/db";
import { optionValues, productOptions, products, stores, visibilityRules } from "@/db/schema";

export default async function StorefrontProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const { storeSlug, productSlug } = await params;
  const productRows = await db
    .select({ product: products, storeName: stores.name })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(
      and(
        eq(stores.slug, storeSlug),
        eq(products.slug, productSlug),
        eq(products.status, "published"),
      ),
    )
    .limit(1);
  const result = productRows[0];
  if (!result) notFound();
  const optionRows = await db
    .select()
    .from(productOptions)
    .where(eq(productOptions.productId, result.product.id))
    .orderBy(productOptions.position);
  const valueRows =
    optionRows.length === 0
      ? []
      : await db
          .select()
          .from(optionValues)
          .innerJoin(productOptions, eq(optionValues.optionId, productOptions.id))
          .where(eq(productOptions.productId, result.product.id))
          .orderBy(optionValues.position);
  const options = optionRows.map((option) => ({
    id: option.id,
    name: option.name,
    type: option.type,
    required: option.required,
    values: valueRows
      .filter((row) => row.option_values.optionId === option.id)
      .map((row) => row.option_values),
  }));
  const ruleRows = await db
    .select()
    .from(visibilityRules)
    .where(eq(visibilityRules.productId, result.product.id));
  const rules = ruleRows.flatMap((rule) => {
    const condition = rule.condition as { valueId?: unknown; action?: unknown };
    return typeof condition.valueId === "string" &&
      (condition.action === "show" || condition.action === "hide")
      ? [
          {
            sourceOptionId: rule.sourceOptionId,
            targetOptionId: rule.targetOptionId,
            condition: {
              valueId: condition.valueId,
              action: condition.action,
            } as const,
          },
        ]
      : [];
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link className="text-xl font-semibold tracking-tight" href="/">
          configura<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{result.storeName}</span>
          <Link className="text-sm font-medium underline" href="/carrito">
            Carrito
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-16">
        <section>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-[#ddd1bf]">
            {result.product.imageUrl ? (
              <Image
                alt={result.product.name}
                className="object-cover"
                fill
                loader={({ src }) => src}
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={result.product.imageUrl}
                unoptimized
              />
            ) : (
              <div className="relative size-2/3">
                <div className="absolute inset-x-[12%] bottom-[15%] top-[18%] rounded-b-[40%] rounded-t-[30%] border-[14px] border-[#f5efe5] bg-[#d96846] shadow-xl" />
                <div className="absolute right-[5%] top-[37%] size-[30%] rounded-full border-[13px] border-[#f5efe5]" />
              </div>
            )}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Personaliza cada detalle y revisa el total antes de continuar.
          </p>
        </section>
        <section>
          <p className="text-sm font-medium text-muted-foreground">{result.storeName}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance">
            {result.product.name}
          </h1>
          {result.product.description && (
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              {result.product.description}
            </p>
          )}
          <div className="mt-8">
            <StorefrontConfigurator
              basePrice={result.product.basePrice}
              options={options}
              productId={result.product.id}
              rules={rules}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
