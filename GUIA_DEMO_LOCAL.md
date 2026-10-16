# Guía de demo local

## Arranque reproducible

```bash
docker compose up -d
docker compose exec app npm run db:migrate
docker compose exec app npm run db:seed
```

Abre [http://localhost:3000/tienda/taller-norte/taza-horizonte](http://localhost:3000/tienda/taller-norte/taza-horizonte).
El seed no crea una cuenta ni contraseña: sirve una tienda pública reproducible y puede ejecutarse más de una vez.

## Recorrido de 5 minutos

1. Registra una cuenta desde `/registro`; se crea su tienda privada.
2. En **Productos**, crea un producto, añade opciones y publícalo.
3. En **Configuración**, cambia nombre, descripción o slug de la tienda.
4. Abre el enlace público, configura el producto y añádelo al carrito.
5. En checkout, completa nombre y correo; el pedido queda visible en **Pedidos**.
6. Desde la edición de producto, sube una imagen JPG, PNG o WebP de hasta 5 MB. MinIO se administra localmente en `http://localhost:9001`.

## Comprobaciones antes de mostrarla

- Navegar sólo con teclado: Tab, Enter y espacio en selector de color, formularios, carrito y checkout.
- Probar los anchos 360 px, 768 px y 1440 px; el editor mueve la vista previa debajo del contenido en móvil.
- Probar una opción obligatoria sin seleccionar: debe anunciar el error y no añadir al carrito.
- Confirmar que un archivo GIF o mayor de 5 MB se rechaza.

## Pruebas automatizadas

```bash
npm run lint
npm test
npm run build
npm run e2e:up
npm run test:e2e:local
```

El E2E usa `app-e2e` (puerto 3001) y `db-e2e` (puerto 5433), y borra el usuario, productos, carrito y pedido que crea. Para detenerlo sin borrar datos de prueba: `npm run e2e:down`.

## Límites del MVP

- El checkout registra pedidos de demostración; no procesa pagos.
- La imagen manual por URL permanece como alternativa temporal a la carga local.
- No incluye despliegue, dominio, hosting, base gestionada ni almacenamiento de producción.
