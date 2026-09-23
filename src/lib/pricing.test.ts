import { describe, expect, it } from "vitest";
import { calculateProductPrice } from "@/lib/pricing";

describe("calculateProductPrice", () => {
  const values = [
    { id: "red", priceDelta: 1_000 },
    { id: "gift", priceDelta: 2_500 },
    { id: "discount", priceDelta: -500 },
  ];

  it("adds only selected adjustments to the base price", () => {
    expect(calculateProductPrice(20_000, ["red", "gift"], values)).toBe(23_500);
  });

  it("does not charge the same value twice", () => {
    expect(calculateProductPrice(20_000, ["discount", "discount"], values)).toBe(19_500);
  });
});
