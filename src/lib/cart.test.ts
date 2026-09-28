import { describe, expect, it } from "vitest";
import { validateCartSelection } from "@/lib/cart";

const options = [
  {
    id: "color",
    name: "Color",
    type: "select",
    required: true,
    values: [
      { id: "white", label: "Blanco", priceDelta: 0 },
      { id: "blue", label: "Azul", priceDelta: 1_000 },
    ],
  },
  {
    id: "engraving",
    name: "Grabado",
    type: "text",
    required: true,
    values: [],
  },
];

describe("validateCartSelection", () => {
  it("recalculates the trusted price and preserves a safe snapshot", () => {
    const result = validateCartSelection(20_000, options, [], {
      color: { valueIds: ["blue"] },
      engraving: { valueIds: [], text: "Para Ana" },
    });
    expect(result.price).toBe(21_000);
    expect(result.snapshot).toEqual({
      color: { optionName: "Color", valueIds: ["blue"], valueLabels: ["Azul"] },
      engraving: { optionName: "Grabado", valueIds: [], valueLabels: [], text: "Para Ana" },
    });
  });

  it("rejects a value that does not belong to the product", () => {
    expect(() =>
      validateCartSelection(20_000, options, [], {
        color: { valueIds: ["forged"] },
        engraving: { valueIds: [], text: "Para Ana" },
      }),
    ).toThrow("valor inválido");
  });

  it("rejects visible required options that are missing", () => {
    expect(() =>
      validateCartSelection(20_000, options, [], { color: { valueIds: ["blue"] } }),
    ).toThrow("Grabado");
  });
});
