import request from "supertest";

const prismaMock = {
  asesoria: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn()
  },
  metricaMensual: {
    findMany: jest.fn()
  },
  supportDocument: {
    findMany: jest.fn(),
    count: jest.fn()
  }
};

jest.mock("../../src/db/prisma", () => ({
  prisma: prismaMock
}));

import { createApp } from "../../src/app";

describe("API REST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists asesorias with pagination", async () => {
    prismaMock.asesoria.findMany.mockResolvedValue([
      {
        id: 1,
        nombre: "Gestoria Madrid",
        provincia: "Madrid",
        ciudad: "Madrid",
        numEmpleados: 12,
        especialidad: "Fiscal",
        fechaAlta: new Date("2018-03-15T00:00:00.000Z")
      }
    ]);
    prismaMock.asesoria.count.mockResolvedValue(1);

    const response = await request(createApp()).get("/api/asesorias?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          id: 1,
          nombre: "Gestoria Madrid",
          provincia: "Madrid",
          ciudad: "Madrid",
          numEmpleados: 12,
          especialidad: "Fiscal",
          fechaAlta: "2018-03-15"
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
  });

  it("returns 400 for invalid page parameter", async () => {
    const response = await request(createApp()).get("/api/asesorias?page=0");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid page parameter"
      }
    });
  });

  it("returns 404 when asesoria does not exist", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue(null);

    const response = await request(createApp()).get("/api/asesorias/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Asesoria not found"
      }
    });
  });

  it("returns asesoria summary with KPI comparison", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 240,
        clientesNuevos: 8,
        clientesBaja: 3,
        declaracionesRenta: 10,
        declaracionesIva: 100,
        declaracionesSociedades: 8,
        declaracionesOtros: 6,
        facturacionAsesoriaEur: 15000,
        facturacionGestionEur: 5000,
        facturacionConsultoriaEur: 4000,
        consultasRecibidas: 120,
        consultasResueltas: 108,
        satisfaccionCliente: 4.2
      },
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 271,
        clientesNuevos: 11,
        clientesBaja: 4,
        declaracionesRenta: 12,
        declaracionesIva: 110,
        declaracionesSociedades: 9,
        declaracionesOtros: 7,
        facturacionAsesoriaEur: 17000,
        facturacionGestionEur: 6000,
        facturacionConsultoriaEur: 5000,
        consultasRecibidas: 130,
        consultasResueltas: 117,
        satisfaccionCliente: 4.5
      }
    ]);

    const response = await request(createApp()).get("/api/asesorias/1/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      asesoriaId: 1,
      latestMonth: "2026-03-01",
      selectedMonth: "2026-03-01",
      current: {
        clientesActivos: 271,
        clientesNetos: 7,
        facturacionTotal: 28000,
        totalDeclaraciones: 138,
        tasaResolucion: 0.9,
        satisfaccionCliente: 4.5
      },
      comparison: {
        againstMonth: "2025-09-01",
        clientesActivosDelta: 31,
        clientesNetosDelta: 2,
        facturacionTotalDelta: 4000,
        totalDeclaracionesDelta: 14,
        tasaResolucionDelta: 0,
        satisfaccionClienteDelta: 0.3
      }
    });
  });

  it("returns asesoria summary for selected year and month", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 240,
        clientesNuevos: 8,
        clientesBaja: 3,
        declaracionesRenta: 10,
        declaracionesIva: 100,
        declaracionesSociedades: 8,
        declaracionesOtros: 6,
        facturacionAsesoriaEur: 15000,
        facturacionGestionEur: 5000,
        facturacionConsultoriaEur: 4000,
        consultasRecibidas: 120,
        consultasResueltas: 108,
        satisfaccionCliente: 4.2
      },
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 271,
        clientesNuevos: 11,
        clientesBaja: 4,
        declaracionesRenta: 12,
        declaracionesIva: 110,
        declaracionesSociedades: 9,
        declaracionesOtros: 7,
        facturacionAsesoriaEur: 17000,
        facturacionGestionEur: 6000,
        facturacionConsultoriaEur: 5000,
        consultasRecibidas: 130,
        consultasResueltas: 117,
        satisfaccionCliente: 4.5
      }
    ]);

    const response = await request(createApp()).get("/api/asesorias/1/summary?year=2025&month=9");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      asesoriaId: 1,
      latestMonth: "2026-03-01",
      selectedMonth: "2025-09-01",
      current: {
        clientesActivos: 240,
        clientesNetos: 5,
        facturacionTotal: 24000,
        totalDeclaraciones: 124,
        tasaResolucion: 0.9,
        satisfaccionCliente: 4.2
      },
      comparison: null
    });
  });

  it("returns 400 when summary year and month are not provided together", async () => {
    const response = await request(createApp()).get("/api/asesorias/1/summary?year=2026");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "year and month parameters must be provided together"
      }
    });
  });

  it("returns 400 when summary month is invalid", async () => {
    const response = await request(createApp()).get("/api/asesorias/1/summary?year=2026&month=13");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid month parameter"
      }
    });
  });

  it("returns 404 when selected summary month has no metrics", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 271,
        clientesNuevos: 11,
        clientesBaja: 4,
        declaracionesRenta: 12,
        declaracionesIva: 110,
        declaracionesSociedades: 9,
        declaracionesOtros: 7,
        facturacionAsesoriaEur: 17000,
        facturacionGestionEur: 6000,
        facturacionConsultoriaEur: 5000,
        consultasRecibidas: 130,
        consultasResueltas: 117,
        satisfaccionCliente: 4.5
      }
    ]);

    const response = await request(createApp()).get("/api/asesorias/1/summary?year=2025&month=9");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Metrics not found for selected month"
      }
    });
  });

  it("lists support documents for one asesoria without mixing other asesorias", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.supportDocument.findMany.mockResolvedValue([
      {
        docId: "SUP-1",
        asesoriaId: 1,
        fecha: new Date("2025-10-23T00:00:00.000Z"),
        tipo: "chat",
        categoria: "Onboarding",
        prioridad: "media",
        estado: "resuelto",
        titulo: "Traspaso",
        texto: "Se recopilan ultimas declaraciones y modelos pendientes.",
        tags: ["onboarding"]
      }
    ]);
    prismaMock.supportDocument.count.mockResolvedValue(1);

    const response = await request(createApp()).get("/api/asesorias/1/support-documents?limit=10&page=1");

    expect(prismaMock.supportDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ asesoriaId: 1 })
      })
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          docId: "SUP-1",
          fecha: "2025-10-23",
          tipo: "chat",
          categoria: "Onboarding",
          prioridad: "media",
          estado: "resuelto",
          titulo: "Traspaso",
          snippet: "Se recopilan ultimas declaraciones y modelos pendientes.",
          tags: ["onboarding"]
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    });
  });

  it("answers support questions using only documents from the requested asesoria", async () => {
    prismaMock.asesoria.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.supportDocument.findMany.mockResolvedValue([
      {
        docId: "SUP-1",
        asesoriaId: 1,
        fecha: new Date("2025-10-23T00:00:00.000Z"),
        tipo: "chat",
        categoria: "Onboarding",
        prioridad: "media",
        estado: "resuelto",
        titulo: "Traspaso desde otra gestoria",
        texto: "Se recopilan ultimas declaraciones, modelos pendientes y usuarios en AEAT.",
        tags: ["onboarding", "aeat"]
      }
    ]);

    const response = await request(createApp())
      .post("/api/asesorias/1/support/ask")
      .send({ question: "Que se revisa en un traspaso desde otra gestoria?" });

    expect(prismaMock.supportDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { asesoriaId: 1 }
      })
    );
    expect(response.status).toBe(200);
    expect(response.body.sources).toHaveLength(1);
    expect(response.body.sources[0]).toMatchObject({
      docId: "SUP-1",
      tipo: "chat",
      categoria: "Onboarding",
      titulo: "Traspaso desde otra gestoria"
    });
    expect(response.body.answer).toContain("Se recopilan ultimas declaraciones");
  });

  it("returns aggregated network summary", async () => {
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 100,
        clientesNuevos: 4,
        clientesBaja: 2,
        declaracionesRenta: 10,
        declaracionesIva: 20,
        declaracionesSociedades: 3,
        declaracionesOtros: 2,
        facturacionAsesoriaEur: 1000,
        facturacionGestionEur: 500,
        facturacionConsultoriaEur: 300,
        consultasRecibidas: 50,
        consultasResueltas: 40,
        satisfaccionCliente: 4
      },
      {
        asesoriaId: 2,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 80,
        clientesNuevos: 3,
        clientesBaja: 1,
        declaracionesRenta: 5,
        declaracionesIva: 15,
        declaracionesSociedades: 2,
        declaracionesOtros: 1,
        facturacionAsesoriaEur: 900,
        facturacionGestionEur: 400,
        facturacionConsultoriaEur: 200,
        consultasRecibidas: 25,
        consultasResueltas: 20,
        satisfaccionCliente: 5
      },
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 110,
        clientesNuevos: 6,
        clientesBaja: 2,
        declaracionesRenta: 15,
        declaracionesIva: 22,
        declaracionesSociedades: 4,
        declaracionesOtros: 2,
        facturacionAsesoriaEur: 1300,
        facturacionGestionEur: 600,
        facturacionConsultoriaEur: 400,
        consultasRecibidas: 55,
        consultasResueltas: 50,
        satisfaccionCliente: 4.2
      },
      {
        asesoriaId: 2,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 85,
        clientesNuevos: 2,
        clientesBaja: 1,
        declaracionesRenta: 8,
        declaracionesIva: 18,
        declaracionesSociedades: 3,
        declaracionesOtros: 1,
        facturacionAsesoriaEur: 950,
        facturacionGestionEur: 420,
        facturacionConsultoriaEur: 250,
        consultasRecibidas: 30,
        consultasResueltas: 24,
        satisfaccionCliente: 4.8
      }
    ]);

    const response = await request(createApp()).get("/api/network/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      latestMonth: "2026-03-01",
      selectedMonth: "2026-03-01",
      current: {
        clientesActivos: 195,
        clientesNetos: 5,
        facturacionTotal: 3920,
        totalDeclaraciones: 73,
        tasaResolucion: 0.8706,
        satisfaccionCliente: 4.5
      },
      comparison: {
        againstMonth: "2025-09-01",
        clientesActivosDelta: 15,
        clientesNetosDelta: 1,
        facturacionTotalDelta: 620,
        totalDeclaracionesDelta: 15,
        tasaResolucionDelta: 0.0706,
        satisfaccionClienteDelta: 0
      }
    });
  });

  it("returns aggregated network summary for selected year and month", async () => {
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 100,
        clientesNuevos: 4,
        clientesBaja: 2,
        declaracionesRenta: 10,
        declaracionesIva: 20,
        declaracionesSociedades: 3,
        declaracionesOtros: 2,
        facturacionAsesoriaEur: 1000,
        facturacionGestionEur: 500,
        facturacionConsultoriaEur: 300,
        consultasRecibidas: 50,
        consultasResueltas: 40,
        satisfaccionCliente: 4
      },
      {
        asesoriaId: 2,
        mes: new Date("2025-09-01T00:00:00.000Z"),
        clientesActivos: 80,
        clientesNuevos: 3,
        clientesBaja: 1,
        declaracionesRenta: 5,
        declaracionesIva: 15,
        declaracionesSociedades: 2,
        declaracionesOtros: 1,
        facturacionAsesoriaEur: 900,
        facturacionGestionEur: 400,
        facturacionConsultoriaEur: 200,
        consultasRecibidas: 25,
        consultasResueltas: 20,
        satisfaccionCliente: 5
      },
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 110,
        clientesNuevos: 6,
        clientesBaja: 2,
        declaracionesRenta: 15,
        declaracionesIva: 22,
        declaracionesSociedades: 4,
        declaracionesOtros: 2,
        facturacionAsesoriaEur: 1300,
        facturacionGestionEur: 600,
        facturacionConsultoriaEur: 400,
        consultasRecibidas: 55,
        consultasResueltas: 50,
        satisfaccionCliente: 4.2
      },
      {
        asesoriaId: 2,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 85,
        clientesNuevos: 2,
        clientesBaja: 1,
        declaracionesRenta: 8,
        declaracionesIva: 18,
        declaracionesSociedades: 3,
        declaracionesOtros: 1,
        facturacionAsesoriaEur: 950,
        facturacionGestionEur: 420,
        facturacionConsultoriaEur: 250,
        consultasRecibidas: 30,
        consultasResueltas: 24,
        satisfaccionCliente: 4.8
      }
    ]);

    const response = await request(createApp()).get("/api/network/summary?year=2025&month=9");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      latestMonth: "2026-03-01",
      selectedMonth: "2025-09-01",
      current: {
        clientesActivos: 180,
        clientesNetos: 4,
        facturacionTotal: 3300,
        totalDeclaraciones: 58,
        tasaResolucion: 0.8,
        satisfaccionCliente: 4.5
      },
      comparison: null
    });
  });

  it("returns 400 when network summary year and month are not provided together", async () => {
    const response = await request(createApp()).get("/api/network/summary?month=3");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "year and month parameters must be provided together"
      }
    });
  });

  it("returns 404 when selected network summary month has no metrics", async () => {
    prismaMock.metricaMensual.findMany.mockResolvedValue([
      {
        asesoriaId: 1,
        mes: new Date("2026-03-01T00:00:00.000Z"),
        clientesActivos: 110,
        clientesNuevos: 6,
        clientesBaja: 2,
        declaracionesRenta: 15,
        declaracionesIva: 22,
        declaracionesSociedades: 4,
        declaracionesOtros: 2,
        facturacionAsesoriaEur: 1300,
        facturacionGestionEur: 600,
        facturacionConsultoriaEur: 400,
        consultasRecibidas: 55,
        consultasResueltas: 50,
        satisfaccionCliente: 4.2
      }
    ]);

    const response = await request(createApp()).get("/api/network/summary?year=2025&month=9");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Metrics not found for selected month"
      }
    });
  });
});
 
