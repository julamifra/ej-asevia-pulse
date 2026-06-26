import { config as loadEnv } from "dotenv";
import { spawn } from "node:child_process";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing Prisma command arguments.");
  process.exit(1);
}

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER ?? "postgres"}:${process.env.POSTGRES_PASSWORD ?? "postgres"}@localhost:${process.env.POSTGRES_PORT ?? "5432"}/${process.env.POSTGRES_DB ?? "asevia_pulse"}?schema=public`;

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
