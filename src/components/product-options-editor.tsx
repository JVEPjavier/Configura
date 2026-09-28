import {
  createOptionValue,
  createProductOption,
  moveOptionValue,
  moveProductOption,
} from "@/actions/options";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  values: { id: string; label: string; value: string; priceDelta: number; position: number }[];
};

const typeLabels: Record<string, string> = {
  select: "Selección",
  color: "Color",
  text: "Texto",
  checkbox: "Checkbox",
};

export function ProductOptionsEditor({
  productId,
  options,
}: {
  productId: string;
  options: Option[];
}) {
  const addOption = createProductOption.bind(null, productId);
  return (
    <section className="mt-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Paso 2</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Opciones y precios</h2>
        <p className="mt-2 text-muted-foreground">
          Cada valor puede ajustar el precio final. El texto no añade un importe todavía.
        </p>
      </div>
      <form
        action={addOption}
        className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_11rem_auto_auto]"
      >
        <input
          className="h-10 rounded-lg border border-input bg-background px-3"
          name="name"
          placeholder="Ej. Color de esmalte"
          required
        />
        <select
          className="h-10 rounded-lg border border-input bg-background px-3"
          defaultValue="select"
          name="type"
        >
          <option value="select">Selección</option>
          <option value="color">Color</option>
          <option value="text">Texto</option>
          <option value="checkbox">Checkbox</option>
        </select>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input name="required" type="checkbox" /> Obligatoria
        </label>
        <Button type="submit">Añadir opción</Button>
      </form>
      <div className="mt-5 space-y-4">
        {options.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-7 text-sm text-muted-foreground">
            Aún no hay opciones. Añade una para comenzar a personalizar este producto.
          </div>
        ) : (
          options.map((option, index) => (
            <OptionCard
              index={index}
              key={option.id}
              option={option}
              productId={productId}
              total={options.length}
            />
          ))
        )}
      </div>
    </section>
  );
}

function OptionCard({
  productId,
  option,
  index,
  total,
}: {
  productId: string;
  option: Option;
  index: number;
  total: number;
}) {
  const addValue = createOptionValue.bind(null, productId, option.id);
  const moveUp = moveProductOption.bind(null, productId, option.id, "up");
  const moveDown = moveProductOption.bind(null, productId, option.id, "down");
  const supportsValues = option.type !== "text";
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{option.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {typeLabels[option.type] ?? option.type}
            {option.required ? " · Obligatoria" : " · Opcional"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
            {option.values.length} {option.values.length === 1 ? "valor" : "valores"}
          </span>
          <form action={moveUp}>
            <Button
              aria-label={`Subir ${option.name}`}
              disabled={index === 0}
              size="icon-xs"
              type="submit"
              variant="outline"
            >
              ↑
            </Button>
          </form>
          <form action={moveDown}>
            <Button
              aria-label={`Bajar ${option.name}`}
              disabled={index === total - 1}
              size="icon-xs"
              type="submit"
              variant="outline"
            >
              ↓
            </Button>
          </form>
        </div>
      </div>
      {supportsValues ? (
        <>
          <div className="mt-4 space-y-2">
            {option.values.map((value, valueIndex) => (
              <div
                className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                key={value.id}
              >
                <span>
                  {option.type === "color" && (
                    <span
                      className="mr-2 inline-block size-3 rounded-full border border-border align-[-1px]"
                      style={{ backgroundColor: value.value }}
                    />
                  )}
                  {value.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={value.priceDelta > 0 ? "text-accent" : "text-muted-foreground"}>
                    {value.priceDelta === 0
                      ? "Sin ajuste"
                      : `${value.priceDelta > 0 ? "+" : ""}$${value.priceDelta.toLocaleString("es-CL")}`}
                  </span>
                  <ValueOrderButtons
                    canMoveDown={valueIndex < option.values.length - 1}
                    canMoveUp={valueIndex > 0}
                    optionId={option.id}
                    productId={productId}
                    valueId={value.id}
                  />
                </div>
              </div>
            ))}
          </div>
          <form action={addValue} className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_9rem_auto]">
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              name="label"
              placeholder={option.type === "checkbox" ? "Ej. Añadir empaque" : "Etiqueta"}
              required
            />
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              name="value"
              placeholder={option.type === "color" ? "#D96846" : "Valor interno"}
              required
            />
            <input
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              name="priceDelta"
              placeholder="Ajuste CLP"
              required
              type="number"
              defaultValue="0"
            />
            <Button size="sm" type="submit">
              Añadir valor
            </Button>
          </form>
        </>
      ) : (
        <p className="mt-4 rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground">
          Los valores de texto los escribirá el comprador. Los ajustes de precio por texto se
          incorporan con las reglas del siguiente hito.
        </p>
      )}
    </article>
  );
}

function ValueOrderButtons({
  productId,
  optionId,
  valueId,
  canMoveUp,
  canMoveDown,
}: {
  productId: string;
  optionId: string;
  valueId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const moveUp = moveOptionValue.bind(null, productId, optionId, valueId, "up");
  const moveDown = moveOptionValue.bind(null, productId, optionId, valueId, "down");
  return (
    <>
      <form action={moveUp}>
        <Button
          aria-label="Subir valor"
          disabled={!canMoveUp}
          size="icon-xs"
          type="submit"
          variant="ghost"
        >
          ↑
        </Button>
      </form>
      <form action={moveDown}>
        <Button
          aria-label="Bajar valor"
          disabled={!canMoveDown}
          size="icon-xs"
          type="submit"
          variant="ghost"
        >
          ↓
        </Button>
      </form>
    </>
  );
}
