const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const maxProductImageBytes = 5 * 1024 * 1024;

export function productImageExtension(file: Pick<File, "size" | "type"> | null) {
  if (!file || file.size === 0) throw new Error("Selecciona una imagen.");
  const extension = allowedTypes.get(file.type);
  if (!extension) throw new Error("Solo se permiten imágenes JPG, PNG o WebP.");
  if (file.size > maxProductImageBytes) throw new Error("La imagen no puede superar 5 MB.");
  return extension;
}
