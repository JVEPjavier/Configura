import Link from "next/link";
import { createProduct } from "@/actions/products";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          href="/app/productos"
        >
          ← Volver a productos
        </Link>
        <p className="mt-10 text-sm font-medium text-muted-foreground">Nuevo producto</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Parte por lo esencial.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Luego podrás añadir opciones, precios adicionales y reglas de visibilidad.
        </p>
        <div className="mt-8">
          <ProductForm action={createProduct} submitLabel="Crear borrador" />
        </div>
      </div>
    </main>
  );
}
