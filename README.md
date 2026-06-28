# Asevia Pulse

Implementacion de la Fase 1 de la prueba tecnica de Asevia.

El proyecto muestra una vista agregada de la red de asesorias y una vista de detalle por asesoria, a partir de metricas mensuales cargadas desde CSV.

## Stack

- PostgreSQL
- Express + TypeScript
- Prisma
- React + Vite + TypeScript
- TanStack Query
- Mantine
- CSS Modules
- Recharts
- Docker Compose
- Jest + Supertest en backend
- Vitest + React Testing Library en frontend
- GitHub Actions

## Arranque rapido con Docker

Requisito: Docker y Docker Compose.

```bash
docker compose up --build
```

Servicios:

- API: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

El contenedor de API arranca la aplicacion sobre la base ya configurada en `docker-compose.yml`.

## Arranque en local

Requisitos:

- Node.js 20+
- npm
- Docker

Pasos:

```bash
cp .env.example .env
npm install
npm run dev:db
npm run dev:setup
npm run dev
```

Comandos utiles:

- `npm run dev:api`: arranca solo la API
- `npm run dev:web`: arranca solo el frontend
- `npm run dev:db:stop`: detiene PostgreSQL
- `npm run dev:full`: levanta DB, aplica migraciones y seed, y arranca API + frontend

## Endpoints principales

Base URL: `http://localhost:3000/api`

- `GET /health`
- `GET /asesorias`
- `GET /asesorias/filters`
- `GET /asesorias/:id`
- `GET /asesorias/:id/metrics`
- `GET /asesorias/:id/summary`
- `GET /network/metrics`
- `GET /network/summary`

## Tests

Desde la raiz:

```bash
npm run test
```

Solo backend:

```bash
npm run test -w @asevia/api
```

Solo frontend:

```bash
npm run test -w @asevia/web
```

## CI

El pipeline de GitHub Actions se ejecuta en `push` y `pull_request`.

Pasos:

1. `checkout`: descarga el codigo del repositorio en el runner.
2. `setup-node`: instala Node.js y activa cache de npm.
3. `npm ci`: instala dependencias de forma reproducible desde `package-lock.json`.
4. `lint`: ejecuta los linters de backend y frontend.
5. `typecheck`: valida TypeScript en ambos workspaces.
6. `test`: ejecuta Jest en backend y Vitest en frontend.
7. `docker compose build`: verifica que las imagenes Docker construyen correctamente.

## Decisiones tecnicas

- Monorepo con `npm workspaces` para mantener API y frontend en un mismo proyecto, con comandos comunes.
- Prisma para migraciones y acceso a datos, priorizando claridad y rapidez de desarrollo.
- Carga inicial desde CSV para ajustarse al enunciado y simplificar el bootstrap del entorno.
- API REST simple, centrada en los endpoints que necesita el frontend para la Fase 1.
- React Query para gestionar carga, cache y estados de fetch sin complejidad extra.
- Mantine + CSS Modules para construir una UI consistente sin montar un design system propio.

## Metricas elegidas y por que

- `clientesActivos`: tamano real de cartera en cada mes.
- `clientesNuevos`, `clientesBaja`, `clientesNetos`: crecimiento y rotacion.
- `facturacionTotal`: KPI economico principal.
- desglose de facturacion: ayuda a entender de donde viene el ingreso.
- `totalDeclaraciones`: volumen operativo fiscal.
- `consultasRecibidas`, `consultasResueltas`, `tasaResolucion`: capacidad operativa y nivel de respuesta.
- `satisfaccionCliente`: senal simple de calidad percibida.

## Que deje fuera por falta de tiempo

- Una capa mas solida de manejo de errores end-to-end, con respuestas mas homogeneas entre API y frontend.
- Validacion de entrada mas estructurada y reutilizable en los endpoints.
- Un contrato mas formal entre frontend y backend, por ejemplo con OpenAPI o cliente tipado generado.
- Mas refactor del frontend para consolidar componentes y hooks compartidos.
- Logging y observabilidad mas robustos.

## Parte mas fragil o menos eficiente

La parte mas fragil esta en el acceso a metricas historicas.

- Algunas vistas cargan series completas para construir graficas y resumenes.
- El modelo actual prioriza simplicidad y claridad frente a escalabilidad.
- Si el producto creciera, revisaria el modelo de metricas y tambien los endpoints para responder mejor a lo que consume el frontend, no solo a recursos REST genericos.

## Que cambiaria con 5.000 asesorias

- Acotaria el rango temporal por defecto en detalle y red, por ejemplo a ultimos 12 o 24 meses.
- Evitaria cargar historicos completos cuando no son necesarios.
- Revisaria indices sobre campos de consulta frecuentes, especialmente por asesoria y mes.
- Añadiria preagregados o vistas materializadas para KPIs globales y vista de red.
- Ajustaria la API para devolver payloads mas orientados a cada pantalla.

## Notas finales

Esta implementacion prioriza que `docker compose up --build` funcione, que la arquitectura sea facil de entender y que la Fase 1 quede cerrada con un alcance razonable.
