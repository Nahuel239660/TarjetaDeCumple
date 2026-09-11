import { loadEnvConfig } from "@next/env";
import { seedDatabaseForProduction } from "../src/lib/event-repository.server";

loadEnvConfig(process.cwd());

async function main() {
  await seedDatabaseForProduction();
  console.log("Configuración inicial lista. No se crearon invitados.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
