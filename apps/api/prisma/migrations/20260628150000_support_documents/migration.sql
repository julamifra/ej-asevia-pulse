CREATE TABLE "support_documents" (
  "doc_id" TEXT NOT NULL,
  "asesoria_id" INTEGER NOT NULL,
  "fecha" DATE NOT NULL,
  "tipo" TEXT NOT NULL,
  "categoria" TEXT NOT NULL,
  "prioridad" TEXT NOT NULL,
  "estado" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "texto" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,

  CONSTRAINT "support_documents_pkey" PRIMARY KEY ("doc_id")
);

CREATE INDEX "support_documents_asesoria_id_fecha_idx" ON "support_documents"("asesoria_id", "fecha");
CREATE INDEX "support_documents_asesoria_id_categoria_idx" ON "support_documents"("asesoria_id", "categoria");
CREATE INDEX "support_documents_asesoria_id_tipo_idx" ON "support_documents"("asesoria_id", "tipo");

ALTER TABLE "support_documents"
ADD CONSTRAINT "support_documents_asesoria_id_fkey"
FOREIGN KEY ("asesoria_id") REFERENCES "asesorias"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
