import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { deleteProduct, toggleProductPublication, updateProduct } from "@/actions/products";
import { DeleteProductButton } from "@/components/delete-product-button";
import { ProductOptionsEditor } from "@/components/product-options-editor";
import { ProductRulesEditor } from "@/components/product-rules-editor";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { optionValues, productOptions, products, stores, visibilityRules } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const store = await db.query.stores.findFirst({
    where: eq(stores.ownerId, session.user.id),
  });
  if (!store) notFound();
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.storeId, store.id)),
  });
  if (!product) notFound();
  const optionRows = await db
    .select()
    .from(productOptions)
    .where(eq(productOptions.productId, product.id))
    .orderBy(productOptions.position);
  const valueRows =
    optionRows.length === 0
      ? []
      : await db
          .select()
          .from(optionValues)
          .innerJoin(productOptions, eq(optionValues.optionId, productOptions.id))
          .where(eq(productOptions.productId, product.id))
          .orderBy(optionValues.position);
  const options = optionRows.map((option) => ({
    ...option,
    values: valueRows
      .filter((row) => row.option_values.optionId === option.id)
      .map((row) => row.option_values),
  }));
  const ruleRows = await db
    .select()
    .from(visibilityRules)
    .where(eq(visibilityRules.productId, product.id));
  const rules = ruleRows.flatMap((rule) => {
    const condition = rule.condition as { valueId?: unknown; action?: unknown };
    return typeof condition.valueId === "string" &&
      (condition.action === "show" || condition.action === "hide")
      ? [
          {
            id: rule.id,
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
  const save = updateProduct.bind(null, product.id);
  const toggle = toggleProductPublication.bind(
    null,
    product.id,
    product.status === "published" ? "draft" : "published",
  );
  const remove = deleteProduct.bind(null, product.id);

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/app/productos"
          >
            ← Volver a productos
          </Link>
          <div className="flex items-center gap-2">
            <DeleteProductButton action={remove} />
            <form action={toggle}>
              <Button type="submit" variant="outline">
                {product.status === "published" ? "Pasar a borrador" : "Publicar"}
              </Button>
            </form>
          </div>
        </header>
        <p className="mt-10 text-sm font-medium text-muted-foreground">
          {product.status === "published" ? "Producto publicado" : "Borrador"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Editar producto</h1>
        <p className="mt-3 text-muted-foreground">
          Define el producto base y sus decisiones de compra.
        </p>
        {product.status === "published" && (
          <p className="mt-4 rounded-lg bg-[#e2ece0] px-3 py-2 text-sm text-[#41613d]">
            Tu configurador ya está público:{" "}
            <Link
              className="font-semibold underline"
              href={`/tienda/${store.slug}/${product.slug}`}
              target="_blank"
            >
              ver producto
            </Link>
          </p>
        )}
        <div className="mt-8">
          <ProductForm action={save} product={product} submitLabel="Guardar cambios" />
        </div>
        <ProductOptionsEditor options={options} productId={product.id} />
        <ProductRulesEditor options={options} productId={product.id} rules={rules} />
      </div>
    </main>
  );
}
