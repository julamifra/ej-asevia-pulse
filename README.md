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
- `npm run build`: build de todos los workspaces
- `npm run lint`: lint de todos los workspaces
- `npm run test`: tests de todos los workspaces

## Desarrollo local

1. Copiar `.env.example` a `.env`.
2. Instalar dependencias con `npm install`.
3. Ejecutar `npm run dev`.

## Docker Compose

`docker compose up --build` levanta:

- `postgres`
- `api`
- `web`

## Estado actual

Este commit solo crea el esqueleto inicial. Todavia no incluye endpoints de negocio, Prisma, seeds ni la UI final.
