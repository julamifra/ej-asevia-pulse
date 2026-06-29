# Asevia Pulse

Implementacion de la Fase 1 y de la Fase 2 opcional de la prueba tecnica de Asevia.

El proyecto muestra una vista agregada de la red de asesorias, una vista de detalle por asesoria y un modulo de soporte asistido basado en documentos internos cargados desde seed.

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
- `GET /asesorias/:id/support-documents`
- `POST /asesorias/:id/support/ask`
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
- Carga inicial desde CSV y JSONL para ajustarse al enunciado y simplificar el bootstrap del entorno.
- API REST simple, centrada en los endpoints que necesita el frontend para la Fase 1 y el soporte asistido de la Fase 2.
- React Query para gestionar carga, cache y estados de fetch sin complejidad extra.
- Mantine + CSS Modules para construir una UI consistente sin montar un design system propio.
- En Fase 2, el soporte asistido usa busqueda textual, ranking simple y respuesta extractiva con fuentes. No usa LLM externo ni embeddings para mantener coste y dependencias bajos.

## Fase 2: soporte asistido

- Aislamiento: toda busqueda filtra primero por `asesoriaId`, para no mezclar documentos entre asesorias.
- Trazabilidad: la respuesta siempre devuelve `sources` con `docId`, metadatos y `snippet`.
- Escalabilidad inicial: el MVP funciona bien para un volumen moderado, pero a 10.000 documentos convendria añadir indices adicionales, filtros temporales y una estrategia de preseleccion mas eficiente.
- Coste: al no usar LLM externo ni embeddings, el coste operativo es practicamente nulo en esta fase.
- Dependencias: se mantiene el stack actual; solo se añade persistencia de documentos y logica de ranking textual dentro del backend.

### Alcance del MVP

La funcionalidad de preguntar se ha implementado como un sistema de busqueda textual asistida:

- primero se limita siempre la busqueda a los documentos de la asesoria seleccionada
- despues se normaliza la pregunta, se tokeniza y se rankean los documentos por coincidencias en titulo, texto, categoria y tags
- la respuesta final es extractiva: reutiliza los snippets mas relevantes encontrados en los documentos
- siempre devuelve fuentes para poder justificar la respuesta
- si no hay evidencia suficiente, responde de forma explicita que no hay informacion suficiente

Es un MVP orientado a consultas concretas sobre temas presentes en la documentacion, no a analisis semantico avanzado ni a resumen inteligente global.

### Siguiente iteracion posible

Una segunda implementacion natural podria mejorar el soporte asistido sin salir del enfoque pragmatico:

- detectar la intencion de la pregunta con reglas simples, por ejemplo distinguir entre consulta documental, resumen de incidencias o peticion de fuentes
- añadir soporte temporal basico para preguntas como "ultimos meses" o "ultimo trimestre"
- resumir recurrencias agrupando incidencias por categoria o titulo, en lugar de responder solo con documentos individuales
- devolver respuestas mas especializadas segun el tipo de pregunta, manteniendo siempre las fuentes

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
- En Fase 2, faltaria evolucionar el ranking textual con una estrategia mas robusta si creciera el volumen documental.

## Parte mas fragil o menos eficiente

La parte mas fragil esta en el acceso a metricas historicas.

- Algunas vistas cargan series completas para construir graficas y resumenes.
- El modelo actual prioriza simplicidad y claridad frente a escalabilidad.
- Si el producto creciera, revisaria el modelo de metricas y tambien los endpoints para responder mejor a lo que consume el frontend, no solo a recursos REST genericos.
- En soporte asistido, la parte mas fragil es el ranking textual: es facil de defender y barato, pero menos preciso que una solucion con indexacion avanzada o retrieval semantico.

## Que cambiaria con 5.000 asesorias

- Acotaria el rango temporal por defecto en detalle y red, por ejemplo a ultimos 12 o 24 meses.
- Evitaria cargar historicos completos cuando no son necesarios.
- Revisaria indices sobre campos de consulta frecuentes, especialmente por asesoria y mes.
- Añadiria preagregados o vistas materializadas para KPIs globales y vista de red.
- Ajustaria la API para devolver payloads mas orientados a cada pantalla.
- Para soporte asistido, pasaria de un escaneo textual simple a una indexacion mas especializada por asesoria, categoria, fecha y terminos normalizados.

## Notas finales

Esta implementacion prioriza que `docker compose up --build` funcione, que la arquitectura sea facil de entender y que la Fase 1 y la Fase 2 opcional queden resueltas con un alcance razonable y defendible.
