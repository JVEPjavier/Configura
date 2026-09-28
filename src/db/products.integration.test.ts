import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const test = runDatabaseTests ? it : it.skip;
let database: typeof import("@/db").db;
let schema: typeof import("@/db/schema");

describe("catalog integration", () => {
  const ownerId = randomUUID();
  const otherOwnerId = randomUUID();
  const ownerStoreId = randomUUID();
  const otherStoreId = randomUUID();
  const productId = randomUUID();

  beforeAll(async () => {
    if (!runDatabaseTests) return;
    ({ db: database } = await import("@/db"));
    schema = await import("@/db/schema");
    await database.insert(schema.user).values([
      { id: ownerId, name: "Owner test", email: `${ownerId}@example.test` },
      { id: otherOwnerId, name: "Other owner test", email: `${otherOwnerId}@example.test` },
    ]);
    await database.insert(schema.stores).values([
      { id: ownerStoreId, ownerId, name: "Tienda test", slug: `test-${ownerId}` },
      {
        id: otherStoreId,
        ownerId: otherOwnerId,
        name: "Otra tienda",
        slug: `test-${otherOwnerId}`,
      },
    ]);
  });

  afterAll(async () => {
    if (!runDatabaseTests) return;
    await database.delete(schema.user).where(eq(schema.user.id, ownerId));
    await database.delete(schema.user).where(eq(schema.user.id, otherOwnerId));
  });

  test("creates a product for its store", async () => {
    await database.insert(schema.products).values({
      id: productId,
      storeId: ownerStoreId,
      name: "Producto de prueba",
      slug: `producto-${productId}`,
      basePrice: 12_000,
    });
    const created = await database.query.products.findFirst({
      where: eq(schema.products.id, productId),
    });
    expect(created).toMatchObject({ id: productId, storeId: ownerStoreId, basePrice: 12_000 });
  });

  test("scopes a product query to its owner", async () => {
    const ownProduct = await database
      .select({ id: schema.products.id })
      .from(schema.products)
      .innerJoin(schema.stores, eq(schema.products.storeId, schema.stores.id))
      .where(and(eq(schema.products.id, productId), eq(schema.stores.ownerId, ownerId)));
    const foreignProduct = await database
      .select({ id: schema.products.id })
      .from(schema.products)
      .innerJoin(schema.stores, eq(schema.products.storeId, schema.stores.id))
      .where(and(eq(schema.products.id, productId), eq(schema.stores.ownerId, otherOwnerId)));
    expect(ownProduct).toHaveLength(1);
    expect(foreignProduct).toHaveLength(0);
  });
});
