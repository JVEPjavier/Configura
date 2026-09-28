import { expect, test } from "@playwright/test";

test.describe("checkout de demostración", () => {
  test.skip(
    process.env.RUN_E2E !== "1",
    "Requiere una app local y base de datos de prueba activas.",
  );

  test("registro, producto, configuración y pedido", async ({ page }) => {
    const email = `e2e-${crypto.randomUUID()}@example.test`;
    await page.goto("/registro");
    await page.getByLabel("Tu nombre").fill("Comprador E2E");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña").fill("contraseña-e2e-segura");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page).toHaveURL(/\/app$/);

    await page.goto("/app/productos/nuevo");
    await page.getByLabel("Nombre del producto").fill("Taza E2E");
    await page.getByLabel("Precio base (CLP)").fill("12000");
    await page.getByRole("button", { name: "Crear borrador" }).click();
    await expect(page).toHaveURL(/\/app\/productos\/[^/]+\/editar$/);
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
  });
});
