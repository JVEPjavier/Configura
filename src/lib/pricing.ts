export type PriceAdjustment = { id: string; priceDelta: number };

/** Calculates the final amount in the product's smallest currency unit (CLP pesos). */
export function calculateProductPrice(
  basePrice: number,
  selectedValueIds: readonly string[],
  values: readonly PriceAdjustment[],
) {
  const selected = new Set(selectedValueIds);
  return values.reduce(
    (total, value) => total + (selected.has(value.id) ? value.priceDelta : 0),
    basePrice,
  );
}
