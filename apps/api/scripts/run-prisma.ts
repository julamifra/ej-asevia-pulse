import { config as loadEnv } from "dotenv";
import { spawn } from "node:child_process";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const databaseUrl = process.env.DATABASE_URL?.trim();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing Prisma command arguments.");
  process.exit(1);
}

if (!databaseUrl) {
  console.error("Missing required environment variable: DATABASE_URL");
  process.exit(1);
}

const child = spawn("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl
  }
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
