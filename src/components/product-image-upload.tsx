import { removeProductImage } from "@/actions/uploads";
import { Button } from "@/components/ui/button";

export function ProductImageRemove({ productId }: { productId: string }) {
  const remove = removeProductImage.bind(null, productId);
  return (
    <form action={remove} className="mt-3">
      <Button type="submit" variant="outline">
        Quitar imagen
      </Button>
    </form>
  );
}
