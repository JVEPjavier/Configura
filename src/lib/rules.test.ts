import { describe, expect, it } from "vitest";
import { visibleOptionIds } from "@/lib/rules";

describe("visibleOptionIds", () => {
  const ids = ["color", "engraving", "gift"];

  it("shows a target only when its show condition matches", () => {
    const rules = [
      {
        sourceOptionId: "color",
        targetOptionId: "engraving",
        condition: { valueId: "dark", action: "show" },
      },
    ];
    expect([...visibleOptionIds(ids, [], rules)]).toEqual(["color", "gift"]);
    expect([...visibleOptionIds(ids, ["dark"], rules)]).toEqual(ids);
  });

  it("hides a target when a hide condition matches", () => {
    const rules = [
      {
        sourceOptionId: "color",
        targetOptionId: "gift",
        condition: { valueId: "dark", action: "hide" },
      },
    ];
    expect([...visibleOptionIds(ids, ["dark"], rules)]).toEqual(["color", "engraving"]);
  });
});
