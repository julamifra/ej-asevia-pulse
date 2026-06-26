# Pulse - Technical Test

Build only Phase 1 of the Asevia technical test.

## Stack

* PostgreSQL
* Express + TypeScript API
* Prisma for migrations and database access
* React + Vite + TypeScript frontend
* Mantine for React UI components
* CSS Modules for encapsulated custom styles
* Recharts for charts
* Docker Compose
* Jest + Supertest
* GitHub Actions

## Priorities

1. `docker compose up --build` must start everything without manual steps.
2. Keep the architecture simple and understandable.
3. Use Prisma migrations.
4. Seed data from `data/asesorias_seed.csv` and `data/metricas_seed.csv`.
5. Implement API endpoints for asesorias list, detail, metrics and network aggregate metrics.
6. Implement frontend pages:

   * Network dashboard
   * Asesorias list with filters
   * Asesoria detail with charts
7. Add meaningful tests, not many tests.
8. Add README with setup and technical decisions.

## Frontend UI decisions

* Use Mantine as the React component library.
* Use CSS Modules for project-specific styles and page/component layout styles.
* Keep styles colocated with components when possible, using `ComponentName.module.css`.
* Avoid global CSS except for minimal reset/base styles.
* Use Recharts for charts.
* Do not introduce Tailwind, shadcn/ui, styled-components or complex design-system abstractions.
* Prefer simple reusable components in `frontend/src/components/`.
* Prefer page-level components in `frontend/src/pages/`.

## Constraints

* Do not implement Phase 2.
* Do not add authentication.
* Do not over-engineer.
* Do not add unnecessary infrastructure.
* Do not add Terraform for Phase 1.
* Prefer clarity over abstraction.
