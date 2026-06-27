import {
  calculateClientesNetos,
  calculateFacturacionTotal,
  calculateTasaResolucion,
  calculateTotalDeclaraciones,
  decimalToNumber,
  round
} from "../../src/lib/metrics";

describe("metrics calculations", () => {
  describe("round", () => {
    it("rounds numbers with the given precision", () => {
      
      expect(round(12.3456)).toBe(12.35);
      expect(round(12.3456, 3)).toBe(12.346);
    });
  });

  describe("decimalToNumber", () => {
    it("converts number, string and decimal-like values", () => {
      expect(decimalToNumber(12.5)).toBe(12.5);
      expect(decimalToNumber("14.2")).toBe(14.2);
      expect(decimalToNumber({ toNumber: () => 18.75 })).toBe(18.75);
    });
  });

  describe("calculateFacturacionTotal", () => {
    it("sums the three billing sources", () => {
      expect(
        calculateFacturacionTotal({
          facturacionAsesoriaEur: "18209.84",
          facturacionGestionEur: 6561.88,
          facturacionConsultoriaEur: { toNumber: () => 7556.03 }
        })
      ).toBe(32327.75);
    });
  });

  describe("calculateTotalDeclaraciones", () => {
    it("sums all declaration categories", () => {
      expect(
        calculateTotalDeclaraciones({
          declaracionesRenta: 31,
          declaracionesIva: 115,
          declaracionesSociedades: 10,
          declaracionesOtros: 17
        })
      ).toBe(173);
    });
  });

  describe("calculateClientesNetos", () => {
    it("subtracts bajas from nuevos", () => {
      expect(
        calculateClientesNetos({
          clientesNuevos: 12,
          clientesBaja: 4
        })
      ).toBe(8);
    });
  });

  describe("calculateTasaResolucion", () => {
    it("calculates the resolution rate with four decimals", () => {
      expect(
        calculateTasaResolucion({
          consultasRecibidas: 122,
          consultasResueltas: 104
        })
      ).toBe(0.8525);
    });

    it("returns zero when there are no received queries", () => {
      expect(
        calculateTasaResolucion({
          consultasRecibidas: 0,
          consultasResueltas: 0
        })
      ).toBe(0);
    });
  });
});
