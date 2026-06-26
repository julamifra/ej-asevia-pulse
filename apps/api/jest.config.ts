import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"]
};

export default config;
