CREATE TABLE "asesorias" (
  "id" INTEGER NOT NULL,
  "nombre" TEXT NOT NULL,
  "cif" TEXT NOT NULL,
  "provincia" TEXT NOT NULL,
  "ciudad" TEXT NOT NULL,
  "fecha_alta" DATE NOT NULL,
  "num_empleados" INTEGER NOT NULL,
  "especialidad" TEXT NOT NULL,

  CONSTRAINT "asesorias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "metricas_mensuales" (
  "asesoria_id" INTEGER NOT NULL,
  "mes" DATE NOT NULL,
  "clientes_activos" INTEGER NOT NULL,
  "clientes_nuevos" INTEGER NOT NULL,
  "clientes_baja" INTEGER NOT NULL,
  "declaraciones_renta" INTEGER NOT NULL,
  "declaraciones_iva" INTEGER NOT NULL,
  "declaraciones_sociedades" INTEGER NOT NULL,
  "declaraciones_otros" INTEGER NOT NULL,
  "facturacion_asesoria_eur" DECIMAL(12,2) NOT NULL,
  "facturacion_gestion_eur" DECIMAL(12,2) NOT NULL,
  "facturacion_consultoria_eur" DECIMAL(12,2) NOT NULL,
  "horas_trabajadas" INTEGER NOT NULL,
  "consultas_recibidas" INTEGER NOT NULL,
  "consultas_resueltas" INTEGER NOT NULL,
  "incidencias_aeat" INTEGER NOT NULL,
  "documentos_procesados" INTEGER NOT NULL,
  "satisfaccion_cliente" DECIMAL(3,1) NOT NULL,

  CONSTRAINT "metricas_mensuales_pkey" PRIMARY KEY ("asesoria_id", "mes")
);

CREATE UNIQUE INDEX "asesorias_cif_key" ON "asesorias"("cif");

ALTER TABLE "metricas_mensuales"
ADD CONSTRAINT "metricas_mensuales_asesoria_id_fkey"
FOREIGN KEY ("asesoria_id") REFERENCES "asesorias"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
