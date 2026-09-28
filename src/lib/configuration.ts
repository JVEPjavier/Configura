export type RequiredOption = { id: string; type: string; required: boolean };

export function missingRequiredOptionIds(
  options: readonly RequiredOption[],
  choices: Readonly<Record<string, string>>,
  checked: Readonly<Record<string, readonly string[]>>,
  textValues: Readonly<Record<string, string>>,
) {
  return options
    .filter(
      (option) =>
        option.required &&
        (option.type === "text"
          ? !textValues[option.id]?.trim()
          : option.type === "checkbox"
            ? !checked[option.id]?.length
            : !choices[option.id]),
    )
    .map((option) => option.id);
}
