# Configura — plan de finalización del MVP

## Objetivo

Cerrar los puntos pendientes del MVP para tener una demo local reproducible, accesible y lista para portafolio.
No incluye pagos, integraciones de e-commerce, inventario, reglas anidadas ni editor gráfico avanzado.

## Estado de implementación (local)

- **Hitos 1 a 5:** implementados y validados con lint, build, unitarias e integración/E2E aislado.
- **Hito 6:** README y guía de demo local implementados. La grabación manual de capturas/GIF queda como material de presentación, no como dependencia funcional del MVP.
- **Fuera de alcance:** despliegue, dominio, hosting, base gestionada y almacenamiento de producción.

## Orden de implementación

### Hito 1 — Base de prueba reproducible

**Objetivo:** que cualquier persona pueda levantar una demo y ejecutar las pruebas sin ensuciar la base de desarrollo.

1. Añadir un `seed` idempotente con Taller Norte, una taza publicada, opciones, valores y una regla condicional.
2. Añadir `npm run db:seed` y documentar la cuenta/recorrido demo local, sin versionar secretos.
3. Separar base de datos de pruebas de la base de desarrollo en Docker Compose.
4. Instalar Chromium de Playwright en el entorno de pruebas y ejecutar el E2E principal contra la base aislada.
5. Hacer que el E2E cree y limpie sus datos de prueba.

**Criterios de aceptación**

- `docker compose up -d` + migraciones + `npm run db:seed` deja una URL pública de producto lista.
- `npm test`, la integración PostgreSQL y Playwright pasan sin modificar datos del usuario.

### Hito 2 — Configuración de tienda y recuperación de rutas

**Objetivo:** completar la administración mínima de la tienda y las salidas de error previsibles.

1. Crear `/app/configuracion` para editar nombre, descripción y slug de la tienda.
2. Validar el slug en servidor, comprobar unicidad y conservar la autorización por propietario.
3. Añadir `not-found.tsx` y `error.tsx` con navegación de retorno y mensajes en español.
4. Añadir estados de carga en rutas con mutaciones largas.

**Criterios de aceptación**

- Un comerciante puede cambiar su tienda y la URL pública refleja el slug nuevo.
- URLs inexistentes, productos eliminados y errores de servidor muestran una recuperación comprensible.

### Hito 3 — Archivos e imágenes de producto

**Objetivo:** reemplazar el campo de URL por una carga controlada de imágenes de producto.

1. Añadir MinIO local y un contenedor de inicialización del bucket al Compose, sin publicar credenciales al cliente.
2. Crear una acción/route handler que valide tipo, tamaño y nombre de archivo antes de emitir una carga firmada o procesarla en servidor.
3. Guardar una referencia de objeto en la base y servir imágenes mediante URL controlada.
4. Mantener la URL manual sólo como alternativa temporal o migrarla por completo.
5. Añadir pruebas de rechazo para tipos y tamaños no permitidos.

**Criterios de aceptación**

- El comerciante puede subir una imagen JPG, PNG o WebP dentro del límite definido.
- Un archivo inválido no se almacena ni queda asociado al producto.

### Hito 4 — Vista previa del editor

**Objetivo:** dar feedback visual mientras el comerciante configura el producto.

1. Extraer una representación visual reutilizable del configurador público.
2. Crear preview lateral en escritorio y bloque superior/plegable en móvil.
3. Reflejar color, texto, imagen y ajustes de precio desde el mismo modelo de opciones y reglas.
4. Mantener la vista previa claramente marcada como aproximación, no como editor gráfico.

**Criterios de aceptación**

- Cambiar una opción en el editor actualiza el preview sin duplicar reglas ni cálculo de precio.
- El preview funciona en viewport móvil y escritorio.

### Hito 5 — Calidad y accesibilidad

**Objetivo:** cerrar la revisión de experiencia de la demo local.

1. Probar teclado: foco visible, orden lógico, acciones de carrito, diálogos y formularios.
2. Revisar etiquetas, `aria-label`, mensajes de validación, contraste y estados deshabilitados.
3. Ejecutar revisión responsive en 360 px, 768 px y 1440 px.
4. Añadir pruebas para autorización de pedidos, cambio de precio entre carrito y checkout y errores de checkout.
5. Ejecutar y corregir el E2E completo en el entorno aislado.

**Criterios de aceptación**

- Todos los flujos principales se pueden completar con teclado.
- El E2E, lint, build, unitarias e integración PostgreSQL pasan en una ejecución limpia.

### Hito 6 — Documentación de portafolio

**Objetivo:** dejar el repositorio y el recorrido local listos para portafolio, sin desplegar.

1. Actualizar README: arquitectura, variables, arranque, migración, seed, pruebas y limitaciones del MVP.
2. Crear capturas y GIF/video de 45–60 segundos: comerciante → configurador → pedido.
3. Incluir un checklist de demo local: registro, producto, reglas, carrito, checkout y pedido.
4. Documentar explícitamente que el despliegue, dominio, hosting, base gestionada y almacenamiento de producción quedan fuera de este plan.

## Dependencias

```text
Hito 1 ─┬─> Hito 2
         ├─> Hito 3 ─> Hito 4
         └─> Hito 5 ─> Hito 6
```

La prioridad inmediata es el **Hito 1**, porque habilita una demo consistente y permite ejecutar el E2E sin contaminar la base local.
