import { expect, test } from "@playwright/test";
import { Client } from "pg";

async function cleanupTestData(email: string) {
  const connectionString = process.env.E2E_DATABASE_URL;
  if (!connectionString) return;

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(
      `DELETE FROM cart_items
       WHERE product_id IN (
         SELECT products.id
         FROM products
         INNER JOIN stores ON stores.id = products.store_id
         INNER JOIN "user" ON "user".id = stores.owner_id
         WHERE "user".email = $1
       )`,
      [email],
    );
    await client.query(
      `DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE customer_email = $1
      )`,
      [email],
    );
    await client.query("DELETE FROM orders WHERE customer_email = $1", [email]);
    await client.query('DELETE FROM "user" WHERE email = $1', [email]);
  } finally {
    await client.end();
  }
}

test.describe("checkout de demostración", () => {
  test.skip(
    process.env.RUN_E2E !== "1" || !process.env.E2E_DATABASE_URL,
    "Requiere una app local y una base de datos de prueba aislada activas.",
  );

  test("registro, producto, configuración y pedido", async ({ page }) => {
    const email = `e2e-${crypto.randomUUID()}@example.test`;
    try {
      await page.goto("/registro");
      await page.getByLabel("Tu nombre").fill("Comprador E2E");
      await page.getByLabel("Correo").fill(email);
      await page.getByLabel("Contraseña").fill("contraseña-e2e-segura");
      await page.getByRole("button", { name: "Crear mi cuenta" }).click();
      await expect(page).toHaveURL(/\/app$/);

      await page.goto("/app/productos/nuevo");
      await page.getByLabel("Nombre del producto").fill("Taza E2E");
      await page.getByLabel("Precio base (CLP)").fill("12000");
      await page.getByLabel("Imagen del producto").setInputFiles({
        name: "taza-e2e.png",
        mimeType: "image/png",
        buffer: Buffer.from([137, 80, 78, 71]),
      });
      await page.getByRole("button", { name: "Crear borrador" }).click();
      await expect(page).toHaveURL(/\/app\/productos\/[^/]+\/editar$/);
      await expect(page.getByAltText("Vista previa de la imagen del producto")).toBeVisible();
      await page.getByRole("button", { name: "Publicar" }).click();
      const storefront = await page.getByRole("link", { name: "ver producto" }).getAttribute("href");
      expect(storefront).toBeTruthy();

      await page.goto(storefront!);
      await page.getByRole("button", { name: "Añadir al carrito" }).click();
      await expect(page.getByText("Añadido al carrito")).toBeVisible();
      await page.getByRole("link", { name: "Ver carrito" }).click();
      await page.getByRole("link", { name: "Continuar" }).click();
      await page.getByLabel("Nombre").fill("Cliente de prueba");
      await page.getByLabel("Correo electrónico").fill(email);
      await page.getByRole("button", { name: "Confirmar pedido de demostración" }).click();
      await expect(page.getByText("Pedido de demostración confirmado")).toBeVisible();
    } finally {
      await cleanupTestData(email);
    }
  });
});
