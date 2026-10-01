type PreviewOption = {
  id: string;
  name: string;
  type: string;
  values: { id: string; label: string; value: string; priceDelta: number }[];
};

export function ProductEditorPreview({
  product,
  options,
}: {
  product: { name: string; basePrice: number; imageUrl: string | null };
  options: PreviewOption[];
}) {
  const color = options.find((option) => option.type === "color")?.values[0];
  const text = options.find((option) => option.type === "text");
  const gift = options.find((option) => option.type === "checkbox")?.values[0];
  const total = product.basePrice + (color?.priceDelta ?? 0) + (gift?.priceDelta ?? 0);
  return (
    <aside className="mt-10 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6">
      <p className="text-sm font-medium text-muted-foreground">Vista previa</p>
      <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-[#ddd1bf]">
        {product.imageUrl ? (
          // The source may be a local MinIO proxy or a temporary external URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={`Vista previa de ${product.name}`} className="size-full object-cover" src={product.imageUrl} />
        ) : (
          <>
            <div
              className="absolute inset-x-[12%] bottom-[15%] top-[18%] rounded-b-[40%] rounded-t-[30%] border-[14px] border-[#f5efe5] shadow-xl"
              style={{ backgroundColor: color?.value ?? "#D96846" }}
            />
            <div className="absolute right-[18%] top-[35%] size-20 rounded-full border-[13px] border-[#f5efe5]" />
          </>
        )}
      </div>
      <h2 className="mt-5 font-semibold">{product.name}</h2>
      {color && <p className="mt-2 text-sm text-muted-foreground">Color: {color.label}</p>}
      {text && (
        <p className="mt-1 text-sm text-muted-foreground">{text.name}: Para alguien especial</p>
      )}
      {gift && <p className="mt-1 text-sm text-muted-foreground">{gift.label}</p>}
      <p className="mt-4 text-xl font-semibold">${total.toLocaleString("es-CL")} CLP</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Refresca al guardar opciones, valores o reglas.
      </p>
    </aside>
  );
}
