import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL es obligatoria para ejecutar el seed.");

const pool = new Pool({ connectionString });
const ids = {
  user: "00000000-0000-4000-8000-000000000001",
  store: "00000000-0000-4000-8000-000000000002",
  product: "00000000-0000-4000-8000-000000000003",
  color: "00000000-0000-4000-8000-000000000004",
  engraving: "00000000-0000-4000-8000-000000000005",
  gift: "00000000-0000-4000-8000-000000000006",
  terracotta: "00000000-0000-4000-8000-000000000007",
  sage: "00000000-0000-4000-8000-000000000008",
  wrapping: "00000000-0000-4000-8000-000000000009",
  rule: "00000000-0000-4000-8000-000000000010",
};

try {
  await pool.query("BEGIN");
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
    [ids.user, "Demo Taller Norte", "demo@configura.local"],
  );
  await pool.query(
    `INSERT INTO stores (id, owner_id, name, slug, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
    [
      ids.store,
      ids.user,
      "Taller Norte",
      "taller-norte",
      "Objetos cotidianos hechos para quedarse.",
    ],
  );
  await pool.query(
    `INSERT INTO products (id, store_id, name, slug, description, base_price, status) VALUES ($1, $2, $3, $4, $5, $6, 'published') ON CONFLICT (id) DO NOTHING`,
    [
      ids.product,
      ids.store,
      "Taza de cerámica — Horizonte",
      "taza-horizonte",
      "Una taza hecha para regalar o quedarse.",
      24000,
    ],
  );
  for (const [id, name, type, required, position] of [
    [ids.color, "Color de esmalte", "color", true, 0],
    [ids.engraving, "Texto grabado", "text", true, 1],
    [ids.gift, "Empaque para regalo", "checkbox", false, 2],
  ]) {
    await pool.query(
      `INSERT INTO product_options (id, product_id, name, type, required, position) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [id, ids.product, name, type, required, position],
    );
  }
  for (const [id, optionId, label, value, delta, position] of [
    [ids.terracotta, ids.color, "Terracota", "#D96846", 1000, 0],
    [ids.sage, ids.color, "Salvia", "#84997B", 0, 1],
    [ids.wrapping, ids.gift, "Añadir empaque", "gift-wrap", 2500, 0],
  ]) {
    await pool.query(
      `INSERT INTO option_values (id, option_id, label, value, price_delta, position) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
      [id, optionId, label, value, delta, position],
    );
  }
  await pool.query(
    `INSERT INTO visibility_rules (id, product_id, source_option_id, target_option_id, condition) VALUES ($1, $2, $3, $4, $5::jsonb) ON CONFLICT (id) DO NOTHING`,
    [
      ids.rule,
      ids.product,
      ids.color,
      ids.gift,
      JSON.stringify({ valueId: ids.terracotta, action: "show" }),
    ],
  );
  await pool.query("COMMIT");
  console.log("Seed de Taller Norte listo: /tienda/taller-norte/taza-horizonte");
} catch (error) {
  await pool.query("ROLLBACK");
  throw error;
} finally {
  await pool.end();
}
