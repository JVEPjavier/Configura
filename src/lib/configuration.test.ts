import { describe, expect, it } from "vitest";
import { missingRequiredOptionIds } from "@/lib/configuration";

describe("missingRequiredOptionIds", () => {
  const options = [
    { id: "color", type: "color", required: true },
    { id: "engraving", type: "text", required: true },
    { id: "gift", type: "checkbox", required: false },
  ];

  it("reports only visible required options without a valid selection", () => {
    expect(missingRequiredOptionIds(options, {}, {}, {})).toEqual(["color", "engraving"]);
  });

  it("accepts selected values and non-blank text", () => {
    expect(
      missingRequiredOptionIds(options, { color: "blue" }, {}, { engraving: "Para Ana" }),
    ).toEqual([]);
  });
});
