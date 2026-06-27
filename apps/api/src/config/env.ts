import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const getRequiredValue = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  DATABASE_URL: getRequiredValue("DATABASE_URL"),
  PORT: process.env.PORT?.trim() || getRequiredValue("API_PORT")
};

process.env.DATABASE_URL = env.DATABASE_URL;
process.env.PORT = env.PORT;

if (process.env.API_PORT) {
  process.env.API_PORT = process.env.API_PORT.trim();
}
