import { calculateProductPrice } from "@/lib/pricing";
import { visibleOptionIds, type VisibilityRule } from "@/lib/rules";

export type CartOptionValue = { id: string; label: string; priceDelta: number };
export type CartOption = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  values: CartOptionValue[];
};
export type CartSelectionInput = Record<string, { valueIds: string[]; text?: string }>;
export type CartSelectionSnapshot = Record<
  string,
  { optionName: string; valueIds: string[]; valueLabels: string[]; text?: string }
>;

export function validateCartSelection(
  basePrice: number,
  options: readonly CartOption[],
  rules: readonly VisibilityRule[],
  selection: CartSelectionInput,
) {
  const optionById = new Map(options.map((option) => [option.id, option]));
  for (const [optionId, input] of Object.entries(selection)) {
    const option = optionById.get(optionId);
    if (!option) throw new Error("La configuración contiene una opción inválida.");
    if (option.type === "text" && input.valueIds.length > 0)
      throw new Error("La opción de texto contiene valores inválidos.");
    if (["select", "color"].includes(option.type) && input.valueIds.length > 1)
      throw new Error("Solo puedes elegir un valor para esta opción.");
    const validValueIds = new Set(option.values.map((value) => value.id));
    if (input.valueIds.some((valueId) => !validValueIds.has(valueId)))
      throw new Error("La configuración contiene un valor inválido.");
  }

  const selectedValueIds = Object.values(selection).flatMap((input) => input.valueIds);
  const visibleIds = visibleOptionIds(
    options.map((option) => option.id),
    selectedValueIds,
    rules,
  );
  const snapshot: CartSelectionSnapshot = {};
  for (const option of options) {
    const input = selection[option.id] ?? { valueIds: [] };
    if (!visibleIds.has(option.id)) {
      if (input.valueIds.length > 0 || input.text?.trim())
        throw new Error("La configuración incluye una opción que no está disponible.");
      continue;
    }
    const hasSelection =
      option.type === "text" ? Boolean(input.text?.trim()) : input.valueIds.length > 0;
    if (option.required && !hasSelection)
      throw new Error(`Completa la opción obligatoria: ${option.name}.`);
    if (!hasSelection) continue;
    const labels = input.valueIds.map(
      (valueId) => option.values.find((value) => value.id === valueId)?.label ?? "",
    );
    snapshot[option.id] = {
      optionName: option.name,
      valueIds: input.valueIds,
      valueLabels: labels,
      ...(input.text?.trim() ? { text: input.text.trim() } : {}),
    };
  }
  const priceValues = options
    .filter((option) => visibleIds.has(option.id))
    .flatMap((option) => option.values);
  const price = calculateProductPrice(basePrice, selectedValueIds, priceValues);
  return { price, snapshot };
}
