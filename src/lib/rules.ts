export type VisibilityRule = { sourceOptionId: string; targetOptionId: string; condition: unknown };

type RuleCondition = { valueId: string; action: "show" | "hide" };

function readCondition(value: unknown): RuleCondition | null {
  if (!value || typeof value !== "object") return null;
  const condition = value as Record<string, unknown>;
  if (
    typeof condition.valueId !== "string" ||
    (condition.action !== "show" && condition.action !== "hide")
  )
    return null;
  return { valueId: condition.valueId, action: condition.action };
}

/** Resolves one-layer visibility rules. Show rules hide their target until a matching source value is selected. */
export function visibleOptionIds(
  optionIds: readonly string[],
  selectedValueIds: readonly string[],
  rules: readonly VisibilityRule[],
) {
  const selected = new Set(selectedValueIds);
  const parsed = rules
    .map((rule) => ({ ...rule, condition: readCondition(rule.condition) }))
    .filter(
      (rule): rule is VisibilityRule & { condition: RuleCondition } => rule.condition !== null,
    );
  const visible = new Set(optionIds);
  for (const rule of parsed)
    if (rule.condition.action === "show") visible.delete(rule.targetOptionId);
  for (const rule of parsed)
    if (rule.condition.action === "show" && selected.has(rule.condition.valueId))
      visible.add(rule.targetOptionId);
  for (const rule of parsed)
    if (rule.condition.action === "hide" && selected.has(rule.condition.valueId))
      visible.delete(rule.targetOptionId);
  return new Set(optionIds.filter((optionId) => visible.has(optionId)));
}
