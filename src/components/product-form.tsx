"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState(product?.imageUrl ?? "");
  const [imageFileName, setImageFileName] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
          <span className="text-sm font-medium">
            Imagen del producto <span className="font-normal text-muted-foreground">(opcional)</span>
          </span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="peer sr-only"
            id="imageFile"
            name="imageFile"
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              setImageFileName(file.name);
              setImagePreview(URL.createObjectURL(file));
            }}
          />
          <label
            className="group flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 text-center transition-colors hover:border-primary hover:bg-primary/5 peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
            htmlFor="imageFile"
          >
            <span className="mb-2 rounded-full bg-background p-2 text-primary shadow-sm transition-transform group-hover:scale-105">
              {imageFileName ? <ImagePlus className="size-5" /> : <Upload className="size-5" />}
            </span>
            <span className="text-sm font-semibold">
              {imageFileName ? "Cambiar imagen" : "Seleccionar una imagen"}
            </span>
            <span className="mt-1 max-w-48 text-xs text-muted-foreground">
              {imageFileName || "Haz clic para buscar un archivo en tu equipo"}
            </span>
            <span className="mt-3 text-xs text-muted-foreground">JPG, PNG o WebP · máximo 5 MB</span>
          </label>
        </div>
      </div>
      {imagePreview && (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {/* Las previsualizaciones locales usan blob: y no son compatibles con next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Vista previa de la imagen del producto" className="h-48 w-full object-cover" src={imagePreview} />
        </div>
      )}
      <div className="space-y-2 border-t border-border pt-5">
        <label className="text-sm font-medium" htmlFor="imageUrl">
          URL de imagen <span className="font-normal text-muted-foreground">(alternativa)</span>
        </label>
        <input
          className="h-10 w-full rounded-lg border border-input bg-background px-3"
          defaultValue={product?.imageUrl ?? ""}
          id="imageUrl"
          name="imageUrl"
          placeholder="https://…"
          type="text"
        />
        <p className="text-xs text-muted-foreground">Si eliges un archivo, reemplaza esta URL.</p>
      </div>
      <div className="flex justify-end">
        <Button size="lg" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
