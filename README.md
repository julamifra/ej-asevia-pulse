# Asevia Pulse

Esqueleto inicial del monorepo para la prueba tecnica de Asevia.

## Stack

- `apps/api`: Express + TypeScript
- `apps/web`: React + Vite + TypeScript
- PostgreSQL con Docker Compose
- npm workspaces en la raiz

## Estructura

```text
.
├── apps/
│   ├── api/
│   └── web/
├── data/
├── docker-compose.yml
└── package.json
```

## Scripts

- `npm run dev`: levanta api y web en paralelo
- `npm run dev:db`: levanta solo PostgreSQL con Docker
- `npm run dev:db:stop`: detiene PostgreSQL
- `npm run dev:setup`: aplica migraciones y carga seed
- `npm run dev:api`: levanta solo la API
- `npm run dev:web`: levanta solo el frontend
- `npm run dev:full`: levanta DB, aplica setup y arranca api + web
- `npm run build`: build de todos los workspaces
- `npm run lint`: lint de todos los workspaces
- `npm run test`: tests de todos los workspaces

## Desarrollo local

1. Copiar `.env.example` a `.env`.
2. Instalar dependencias con `npm install`.
3. Levantar la base con `npm run dev:db`.
4. Ejecutar `npm run dev:setup` la primera vez, o cuando cambie Prisma/seed.
5. Ejecutar `npm run dev`.

Flujo rapido en un solo comando:

```bash
npm run dev:full
```

## Docker Compose

`docker compose up --build` levanta:

- `postgres`
- `api`
- `web`

## Estado actual

Este commit solo crea el esqueleto inicial. Todavia no incluye endpoints de negocio, Prisma, seeds ni la UI final.
