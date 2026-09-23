import { createVisibilityRule, deleteVisibilityRule } from "@/actions/rules";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string; values: { id: string; label: string }[] };
type Rule = {
  id: string;
  sourceOptionId: string;
  targetOptionId: string;
  condition: { valueId: string; action: "show" | "hide" };
};

export function ProductRulesEditor({
  productId,
  options,
  rules,
}: {
  productId: string;
  options: Option[];
  rules: Rule[];
}) {
  const addRule = createVisibilityRule.bind(null, productId);
  const sourceOptions = options.filter((option) => option.values.length > 0);
  const optionById = new Map(options.map((option) => [option.id, option]));
  return (
    <section className="mt-10 border-t border-border pt-10">
      <p className="text-sm font-medium text-muted-foreground">Paso 3</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">Reglas de visibilidad</h2>
      <p className="mt-2 text-muted-foreground">
        Muestra u oculta una opción según una elección. Las reglas de “mostrar” mantienen la opción
        oculta hasta que se cumpla la condición.
      </p>
      {sourceOptions.length < 1 || options.length < 2 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Añade al menos dos opciones y un valor para crear una regla.
        </div>
      ) : (
        <form
          action={addRule}
          className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_8rem_1fr_auto]"
        >
          <select
            className="h-10 rounded-lg border border-input bg-background px-3"
            defaultValue=""
            name="source"
            required
          >
            <option disabled value="">
              Si se elige…
            </option>
            {sourceOptions.flatMap((option) =>
              option.values.map((value) => (
                <option key={value.id} value={`${option.id}:${value.id}`}>
                  {option.name}: {value.label}
                </option>
              )),
            )}
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3"
            defaultValue="show"
            name="action"
          >
            <option value="show">mostrar</option>
            <option value="hide">ocultar</option>
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3"
            defaultValue=""
            name="targetOptionId"
            required
          >
            <option disabled value="">
              esta opción…
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <Button type="submit">Crear regla</Button>
        </form>
      )}
      <div className="mt-5 space-y-2">
        {rules.map((rule) => {
          const source = optionById.get(rule.sourceOptionId);
          const target = optionById.get(rule.targetOptionId);
          const value = source?.values.find((item) => item.id === rule.condition.valueId);
          const remove = deleteVisibilityRule.bind(null, productId, rule.id);
          return (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
              key={rule.id}
            >
              <p>
                Si{" "}
                <strong>
                  {source?.name ?? "opción"}: {value?.label ?? "valor"}
                </strong>
                , {rule.condition.action === "show" ? "mostrar" : "ocultar"}{" "}
                <strong>{target?.name ?? "opción"}</strong>.
              </p>
              <form action={remove}>
                <Button size="sm" type="submit" variant="ghost">
                  Quitar
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
