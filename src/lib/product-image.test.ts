import { describe, expect, it } from "vitest";
import { maxProductImageBytes, productImageExtension } from "./product-image";

describe("productImageExtension", () => {
  it("accepts JPEG, PNG and WebP below the size limit", () => {
    expect(productImageExtension({ type: "image/jpeg", size: 1 })).toBe("jpg");
    expect(productImageExtension({ type: "image/png", size: 1 })).toBe("png");
    expect(productImageExtension({ type: "image/webp", size: 1 })).toBe("webp");
  });

  it("rejects an unsupported type and an oversized file", () => {
    expect(() => productImageExtension({ type: "image/gif", size: 1 })).toThrow("JPG, PNG o WebP");
    expect(() => productImageExtension({ type: "image/png", size: maxProductImageBytes + 1 })).toThrow(
      "no puede superar 5 MB",
    );
  });
});
