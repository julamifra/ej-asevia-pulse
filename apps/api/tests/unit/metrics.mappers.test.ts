import { buildSummary, mapMetricToDto } from "../../src/lib/metrics";
import type { MetricLike } from "../../src/lib/metrics";

describe("metrics mappers", () => {
  describe("mapMetricToDto", () => {
    it("maps a monthly metric into the API DTO", () => {
      const metric: MetricLike = {
        mes: new Date("2025-04-01T00:00:00.000Z"),
        clientesActivos: 221,
        clientesNuevos: 8,
        clientesBaja: 3,
        declaracionesRenta: 31,
        declaracionesIva: 115,
        declaracionesSociedades: 10,
        declaracionesOtros: 17,
        facturacionAsesoriaEur: "18209.84",
        facturacionGestionEur: 6561.88,
        facturacionConsultoriaEur: { toNumber: () => 7556.03 },
        consultasRecibidas: 122,
        consultasResueltas: 104,
        satisfaccionCliente: "4.5"
      };

      expect(mapMetricToDto(metric)).toEqual({
        mes: "2025-04-01",
        clientesActivos: 221,
        clientesNuevos: 8,
        clientesBaja: 3,
        clientesNetos: 5,
        facturacionAsesoriaEur: 18209.84,
        facturacionGestionEur: 6561.88,
        facturacionConsultoriaEur: 7556.03,
        facturacionTotal: 32327.75,
        declaracionesRenta: 31,
        declaracionesIva: 115,
        declaracionesSociedades: 10,
        declaracionesOtros: 17,
        totalDeclaraciones: 173,
        consultasRecibidas: 122,
        consultasResueltas: 104,
        tasaResolucion: 0.8525,
        satisfaccionCliente: 4.5
      });
    });
  });

  describe("buildSummary", () => {
    it("returns null for an empty series", () => {
      expect(buildSummary([])).toBeNull();
    });

    it("builds current KPIs and six-month comparison when available", () => {
      const items = [
        {
          mes: "2025-09-01",
          clientesActivos: 246,
          clientesNuevos: 10,
          clientesBaja: 3,
          clientesNetos: 7,
          facturacionTotal: 32946.94,
          totalDeclaraciones: 144,
          tasaResolucion: 0.903,
          satisfaccionCliente: 5
        },
        {
          mes: "2026-03-01",
          clientesActivos: 271,
          clientesNuevos: 7,
          clientesBaja: 9,
          clientesNetos: -2,
          facturacionTotal: 40586.81,
          totalDeclaraciones: 137,
          tasaResolucion: 0.8848,
          satisfaccionCliente: 3.4
        }
      ];

      expect(buildSummary(items)).toEqual({
        latestMonth: "2026-03-01",
        selectedMonth: "2026-03-01",
        current: {
          clientesActivos: 271,
          clientesNetos: -2,
          facturacionTotal: 40586.81,
          totalDeclaraciones: 137,
          tasaResolucion: 0.8848,
          satisfaccionCliente: 3.4
        },
        comparison: {
          againstMonth: "2025-09-01",
          clientesActivosDelta: 25,
          clientesNetosDelta: -9,
          facturacionTotalDelta: 7639.87,
          totalDeclaracionesDelta: -7,
          tasaResolucionDelta: -0.0182,
          satisfaccionClienteDelta: -1.6
        }
      });
    });

    it("returns comparison null when there is no month six months before", () => {
      const items = [
        {
          mes: "2026-02-01",
          clientesActivos: 273,
          clientesNuevos: 13,
          clientesBaja: 3,
          clientesNetos: 10,
          facturacionTotal: 49289.49,
          totalDeclaraciones: 205,
          tasaResolucion: 0.9066,
          satisfaccionCliente: 3.8
        },
        {
          mes: "2026-03-01",
          clientesActivos: 271,
          clientesNuevos: 7,
          clientesBaja: 9,
          clientesNetos: -2,
          facturacionTotal: 40586.81,
          totalDeclaraciones: 137,
          tasaResolucion: 0.8848,
          satisfaccionCliente: 3.4
        }
      ];

      expect(buildSummary(items)).toEqual({
        latestMonth: "2026-03-01",
        selectedMonth: "2026-03-01",
        current: {
          clientesActivos: 271,
          clientesNetos: -2,
          facturacionTotal: 40586.81,
          totalDeclaraciones: 137,
          tasaResolucion: 0.8848,
          satisfaccionCliente: 3.4
        },
        comparison: null
      });
    });

    it("builds the summary from a selected month", () => {
      const items = [
        {
          mes: "2025-09-01",
          clientesActivos: 246,
          clientesNuevos: 10,
          clientesBaja: 3,
          clientesNetos: 7,
          facturacionTotal: 32946.94,
          totalDeclaraciones: 144,
          tasaResolucion: 0.903,
          satisfaccionCliente: 5
        },
        {
          mes: "2026-03-01",
          clientesActivos: 271,
          clientesNuevos: 7,
          clientesBaja: 9,
          clientesNetos: -2,
          facturacionTotal: 40586.81,
          totalDeclaraciones: 137,
          tasaResolucion: 0.8848,
          satisfaccionCliente: 3.4
        }
      ];

      expect(buildSummary(items, "2025-09-01")).toEqual({
        latestMonth: "2026-03-01",
        selectedMonth: "2025-09-01",
        current: {
          clientesActivos: 246,
          clientesNetos: 7,
          facturacionTotal: 32946.94,
          totalDeclaraciones: 144,
          tasaResolucion: 0.903,
          satisfaccionCliente: 5
        },
        comparison: null
      });
    });
  });
});
