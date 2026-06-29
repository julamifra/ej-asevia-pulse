import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

process.env.DATABASE_URL = process.env.DATABASE_URL.trim();

const prisma = new PrismaClient();
const workspaceRoot = path.resolve(import.meta.dirname, "../../..");

type CsvRow = Record<string, string>;
type SupportSeedRow = {
  doc_id: string;
  asesoria_id: number;
  fecha: string;
  tipo: string;
  categoria: string;
  prioridad: string;
  estado: string;
  titulo: string;
  texto: string;
  tags: string[];
};

const resolveRequiredPath = async (relativePath: string) => {
  const absolutePath = path.resolve(workspaceRoot, relativePath);

  try {
    await access(absolutePath);
    return absolutePath;
  } catch {
    throw new Error(`Required file not found: ${absolutePath}`);
  }
};

const parseCsv = async (filePath: string) => {
  const content = await readFile(filePath, "utf8");
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return lines
    .filter((line) => line.trim().length > 0)
    .map<CsvRow>((line) => {
      const values = line.split(",");

      return headers.reduce<CsvRow>((row, header, index) => {
        row[header] = values[index] ?? "";
        return row;
      }, {});
    });
};

const parseJsonLines = async <T>(filePath: string) => {
  const content = await readFile(filePath, "utf8");

  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map<T>((line) => JSON.parse(line) as T);
};

const toMonthDate = (value: string) => new Date(`${value}-01T00:00:00.000Z`);
const toDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const toInt = (value: string) => Number.parseInt(value, 10);

const seedAsesorias = async () => {
  const asesoriasPath = await resolveRequiredPath("data/asesorias_seed.csv");
  const rows = await parseCsv(asesoriasPath);

  for (const row of rows) {
    await prisma.asesoria.upsert({
      where: { id: toInt(row.id) },
      update: {
        nombre: row.nombre,
        cif: row.cif,
        provincia: row.provincia,
        ciudad: row.ciudad,
        fechaAlta: toDate(row.fecha_alta),
        numEmpleados: toInt(row.num_empleados),
        especialidad: row.especialidad
      },
      create: {
        id: toInt(row.id),
        nombre: row.nombre,
        cif: row.cif,
        provincia: row.provincia,
        ciudad: row.ciudad,
        fechaAlta: toDate(row.fecha_alta),
        numEmpleados: toInt(row.num_empleados),
        especialidad: row.especialidad
      }
    });
  }
};

const seedMetricas = async () => {
  const metricasPath = await resolveRequiredPath("data/metricas_seed.csv");
  const rows = await parseCsv(metricasPath);

  for (const row of rows) {
    const asesoriaId = toInt(row.asesoria_id);
    const mes = toMonthDate(row.mes);

    await prisma.metricaMensual.upsert({
      where: {
        asesoriaId_mes: {
          asesoriaId,
          mes
        }
      },
      update: {
        clientesActivos: toInt(row.clientes_activos),
        clientesNuevos: toInt(row.clientes_nuevos),
        clientesBaja: toInt(row.clientes_baja),
        declaracionesRenta: toInt(row.declaraciones_renta),
        declaracionesIva: toInt(row.declaraciones_iva),
        declaracionesSociedades: toInt(row.declaraciones_sociedades),
        declaracionesOtros: toInt(row.declaraciones_otros),
        facturacionAsesoriaEur: row.facturacion_asesoria_eur,
        facturacionGestionEur: row.facturacion_gestion_eur,
        facturacionConsultoriaEur: row.facturacion_consultoria_eur,
        horasTrabajadas: toInt(row.horas_trabajadas),
        consultasRecibidas: toInt(row.consultas_recibidas),
        consultasResueltas: toInt(row.consultas_resueltas),
        incidenciasAeat: toInt(row.incidencias_aeat),
        documentosProcesados: toInt(row.documentos_procesados),
        satisfaccionCliente: row.satisfaccion_cliente
      },
      create: {
        asesoriaId,
        mes,
        clientesActivos: toInt(row.clientes_activos),
        clientesNuevos: toInt(row.clientes_nuevos),
        clientesBaja: toInt(row.clientes_baja),
        declaracionesRenta: toInt(row.declaraciones_renta),
        declaracionesIva: toInt(row.declaraciones_iva),
        declaracionesSociedades: toInt(row.declaraciones_sociedades),
        declaracionesOtros: toInt(row.declaraciones_otros),
        facturacionAsesoriaEur: row.facturacion_asesoria_eur,
        facturacionGestionEur: row.facturacion_gestion_eur,
        facturacionConsultoriaEur: row.facturacion_consultoria_eur,
        horasTrabajadas: toInt(row.horas_trabajadas),
        consultasRecibidas: toInt(row.consultas_recibidas),
        consultasResueltas: toInt(row.consultas_resueltas),
        incidenciasAeat: toInt(row.incidencias_aeat),
        documentosProcesados: toInt(row.documentos_procesados),
        satisfaccionCliente: row.satisfaccion_cliente
      }
    });
  }
};

const seedSupportDocuments = async () => {
  const supportPath = await resolveRequiredPath("data/soporte_seed.jsonl");
  const rows = await parseJsonLines<SupportSeedRow>(supportPath);

  for (const row of rows) {
    await prisma.supportDocument.upsert({
      where: { docId: row.doc_id },
      update: {
        asesoriaId: row.asesoria_id,
        fecha: toDate(row.fecha),
        tipo: row.tipo,
        categoria: row.categoria,
        prioridad: row.prioridad,
        estado: row.estado,
        titulo: row.titulo,
        texto: row.texto,
        tags: row.tags
      },
      create: {
        docId: row.doc_id,
        asesoriaId: row.asesoria_id,
        fecha: toDate(row.fecha),
        tipo: row.tipo,
        categoria: row.categoria,
        prioridad: row.prioridad,
        estado: row.estado,
        titulo: row.titulo,
        texto: row.texto,
        tags: row.tags
      }
    });
  }
};

const main = async () => {
  await seedAsesorias();
  await seedMetricas();
  await seedSupportDocuments();
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
