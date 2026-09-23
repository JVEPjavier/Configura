import { Button } from "@/components/ui/button";

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  product?: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    basePrice: number;
  };
  submitLabel: string;
};

export function ProductForm({ action, product, submitLabel }: ProductFormProps) {
  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Nombre del producto
        </label>
        <input
          className="h-10 w-full rounded-lg border border-input bg-background px-3"
          defaultValue={product?.name}
          id="name"
          maxLength={120}
          name="name"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Descripción
        </label>
        <textarea
          className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2"
          defaultValue={product?.description ?? ""}
          id="description"
          maxLength={1000}
          name="description"
          placeholder="Cuenta qué hace especial a este producto."
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="basePrice">
            Precio base (CLP)
          </label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3"
            defaultValue={product?.basePrice ?? ""}
            id="basePrice"
            min="0"
            name="basePrice"
            required
            step="1"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="imageUrl">
            URL de imagen <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3"
            defaultValue={product?.imageUrl ?? ""}
            id="imageUrl"
            name="imageUrl"
            placeholder="https://…"
            type="url"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="lg" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
