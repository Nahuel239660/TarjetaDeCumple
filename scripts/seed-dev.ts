import { loadEnvConfig } from "@next/env";
import { seedDatabaseForDevelopment } from "../src/lib/event-repository.server";

loadEnvConfig(process.cwd());

async function main() {
  await seedDatabaseForDevelopment();
  console.log("Datos de muestra para desarrollo listos.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
