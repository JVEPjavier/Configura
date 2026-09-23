# Configura

Configura es una plataforma para que comercios creativos vendan productos personalizables con opciones, reglas y precios dinámicos.

Incluye el entorno de desarrollo, la identidad visual inicial, autenticación con correo/contraseña, el esquema de datos base y el primer flujo de catálogo: crear, editar y publicar productos base. El editor admite opciones de selección, color, texto y checkbox; los valores seleccionables pueden ajustar el precio.

## Stack base

- Next.js 16 + App Router
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL 16
- Docker Compose
- Drizzle ORM + Drizzle Kit
- Better Auth
- Zod, React Hook Form y shadcn/ui

## Desarrollo sin Docker

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Desarrollo con Docker

1. Instala y habilita Docker Compose.
2. El archivo `.env` ya contiene valores exclusivos para desarrollo local. Si necesitas recrearlo, copia `.env.example`.
3. Levanta el entorno:

```bash
docker compose up --build
```

En una terminal aparte, aplica las migraciones tras el primer arranque:

```bash
docker compose exec app npm run db:migrate
```

Esto inicia:

- `app`: servidor de Next.js en `http://localhost:3000`.
- `db`: PostgreSQL 16, aislado de la red del host y persistido en el volumen `postgres_data`.

Después de actualizar el esquema, genera y aplica una migración:

```bash
docker compose exec app npm run db:generate
docker compose exec app npm run db:migrate
```

Para detenerlo:

```bash
docker compose down
```

Para eliminar también los datos locales de PostgreSQL:

```bash
docker compose down --volumes
```

## Verificación

```bash
npm run lint
npm run build
npm test
```

## Scripts útiles

```bash
npm run db:generate # crear una migración desde el esquema Drizzle
npm run db:migrate  # aplicar migraciones
npm run db:studio   # inspeccionar datos con Drizzle Studio
npm run test:e2e    # pruebas Playwright (se añaden junto a los flujos E2E)
```

## Documentación

- [Identidad del proyecto](PROJECT.md)
- [Plan de creación](../../configura-plan.md)
