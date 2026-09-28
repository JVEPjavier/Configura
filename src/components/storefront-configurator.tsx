"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { calculateProductPrice } from "@/lib/pricing";
import { visibleOptionIds } from "@/lib/rules";
import { missingRequiredOptionIds } from "@/lib/configuration";

type ConfiguratorValue = { id: string; label: string; value: string; priceDelta: number };
type ConfiguratorOption = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  values: ConfiguratorValue[];
};
type ConfiguratorRule = {
  sourceOptionId: string;
  targetOptionId: string;
  condition: { valueId: string; action: "show" | "hide" };
};

export function StorefrontConfigurator({
  basePrice,
  productId,
  options,
  rules,
}: {
  basePrice: number;
  productId: string;
  options: ConfiguratorOption[];
  rules: ConfiguratorRule[];
}) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, string[]>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const allSelectedIds = useMemo(
    () => [...Object.values(choices), ...Object.values(checked).flat()],
    [choices, checked],
  );
  const visibleIds = useMemo(
    () =>
      visibleOptionIds(
        options.map((option) => option.id),
        allSelectedIds,
        rules,
      ),
    [allSelectedIds, options, rules],
  );
  const visibleOptions = options.filter((option) => visibleIds.has(option.id));
  const priceValues = useMemo(
    () => visibleOptions.flatMap((option) => option.values),
    [visibleOptions],
  );
  const selectedIds = useMemo(
    () => [
      ...Object.entries(choices)
        .filter(([optionId]) => visibleIds.has(optionId))
        .map(([, valueId]) => valueId),
      ...Object.entries(checked)
        .filter(([optionId]) => visibleIds.has(optionId))
        .flatMap(([, valueIds]) => valueIds),
    ],
    [checked, choices, visibleIds],
  );
  const total = calculateProductPrice(basePrice, selectedIds, priceValues);
  const missingRequiredIds = missingRequiredOptionIds(visibleOptions, choices, checked, textValues);

  function select(optionId: string, valueId: string) {
    setChoices((current) => ({ ...current, [optionId]: valueId }));
  }

  function toggleCheckbox(optionId: string, valueId: string) {
    setChecked((current) => {
      const selected = current[optionId] ?? [];
      return {
        ...current,
        [optionId]: selected.includes(valueId)
          ? selected.filter((id) => id !== valueId)
          : [...selected, valueId],
      };
    });
  }

  function addConfigurationToCart() {
    setAttempted(true);
    if (missingRequiredIds.length > 0) return;
    setCartMessage(null);
    startTransition(async () => {
      try {
        const selection = Object.fromEntries(
          options.map((option) => [
            option.id,
            {
              valueIds:
                option.type === "checkbox"
                  ? (checked[option.id] ?? [])
                  : choices[option.id]
                    ? [choices[option.id]]
                    : [],
              ...(option.type === "text" && textValues[option.id]?.trim()
                ? { text: textValues[option.id].trim() }
                : {}),
            },
          ]),
        );
        const result = await addToCart({ productId, selection });
        setCartMessage(`Añadido al carrito · $${result.total.toLocaleString("es-CL")} CLP`);
      } catch (error) {
        setCartMessage(error instanceof Error ? error.message : "No pudimos añadir el producto.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="space-y-7">
        {visibleOptions.map((option) => (
          <fieldset key={option.id}>
            <legend className="font-semibold">
              {option.name}
              {option.required && <span className="ml-1 text-accent">*</span>}
            </legend>
            {option.type === "text" ? (
              <input
                className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3"
                onChange={(event) =>
                  setTextValues((current) => ({ ...current, [option.id]: event.target.value }))
                }
                placeholder="Escribe aquí"
                value={textValues[option.id] ?? ""}
              />
            ) : option.type === "color" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {option.values.map((value) => (
                  <button
                    aria-label={value.label}
                    className={`group flex flex-col items-center gap-1.5 text-xs ${choices[option.id] === value.id ? "font-semibold" : "text-muted-foreground"}`}
                    key={value.id}
                    onClick={() => select(option.id, value.id)}
                    type="button"
                  >
                    <span
                      className={`size-9 rounded-full border-2 ${choices[option.id] === value.id ? "border-foreground ring-2 ring-ring/40" : "border-card ring-1 ring-border"}`}
                      style={{ backgroundColor: value.value }}
                    />
                    <span>{value.label}</span>
                    {value.priceDelta !== 0 && (
                      <span>
                        {value.priceDelta > 0 ? "+" : ""}${value.priceDelta.toLocaleString("es-CL")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : option.type === "checkbox" ? (
              <div className="mt-3 space-y-2">
                {option.values.map((value) => (
                  <label
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 py-3 text-sm"
                    key={value.id}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        checked={(checked[option.id] ?? []).includes(value.id)}
                        onChange={() => toggleCheckbox(option.id, value.id)}
                        type="checkbox"
                      />
                      {value.label}
                    </span>
                    <span className="text-muted-foreground">
                      {value.priceDelta === 0
                        ? "Sin ajuste"
                        : `${value.priceDelta > 0 ? "+" : ""}$${value.priceDelta.toLocaleString("es-CL")}`}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                {option.values.map((value) => (
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-3 text-sm transition ${choices[option.id] === value.id ? "border-foreground bg-secondary" : "border-border bg-background"}`}
                    key={value.id}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        checked={choices[option.id] === value.id}
                        name={option.id}
                        onChange={() => select(option.id, value.id)}
                        type="radio"
                      />
                      {value.label}
                    </span>
                    <span className="text-muted-foreground">
                      {value.priceDelta === 0
                        ? "Sin ajuste"
                        : `${value.priceDelta > 0 ? "+" : ""}$${value.priceDelta.toLocaleString("es-CL")}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {attempted && missingRequiredIds.includes(option.id) && (
              <p className="mt-2 text-sm text-destructive">Esta opción es obligatoria.</p>
            )}
          </fieldset>
        ))}
      </div>
      <div className="mt-8 border-t border-border pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Precio total</p>
            <p className="mt-1 text-3xl font-semibold">
              ${total.toLocaleString("es-CL")} <span className="text-base font-medium">CLP</span>
            </p>
          </div>
          <button
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            disabled={isPending}
            onClick={addConfigurationToCart}
            type="button"
          >
            {isPending ? "Añadiendo…" : "Añadir al carrito"}
          </button>
        </div>
        {attempted && missingRequiredIds.length === 0 && (
          <p className="mt-4 rounded-lg bg-[#e2ece0] px-3 py-2 text-sm text-[#41613d]">
            Configuración válida. Puedes añadirla al carrito.
          </p>
        )}
        {cartMessage && (
          <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            {cartMessage}{" "}
            <Link className="font-semibold underline" href="/carrito">
              Ver carrito
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
