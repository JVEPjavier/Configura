"use client";

import { Button } from "@/components/ui/button";

export function DeleteProductButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer."))
          event.preventDefault();
      }}
    >
      <Button type="submit" variant="destructive">
        Eliminar producto
      </Button>
    </form>
  );
}
