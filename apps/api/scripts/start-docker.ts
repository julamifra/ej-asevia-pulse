import { spawn } from "node:child_process";
import net from "node:net";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to start the API container.");
  process.exit(1);
}

const runCommand = (command: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: process.env
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });

    child.on("error", reject);
  });

const waitForPostgres = async () => {
  const url = new URL(databaseUrl);
  const host = url.hostname;
  const port = Number(url.port || 5432);
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const isReady = await new Promise<boolean>((resolve) => {
      const socket = net.connect({ host, port });

      socket.on("connect", () => {
        socket.end();
        resolve(true);
      });

      socket.on("error", () => {
        resolve(false);
      });
    });

    if (isReady) {
      return;
    }

    console.log(`Waiting for postgres at ${host}:${port} (${attempt}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Postgres did not become available in time.");
};

const main = async () => {
  await waitForPostgres();
  await runCommand("npm", ["run", "prisma:deploy", "-w", "@asevia/api"]);
  await runCommand("npm", ["run", "prisma:seed", "-w", "@asevia/api"]);
  await runCommand("npm", ["run", "dev", "-w", "@asevia/api"]);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
