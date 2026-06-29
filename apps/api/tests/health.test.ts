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

jest.mock("../src/db/prisma", () => ({
  prisma: prismaMock
}));

import { createApp } from "../src/app";

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
