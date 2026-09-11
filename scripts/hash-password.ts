import bcrypt from "bcryptjs";

const requestedPassword = process.argv.slice(2).find((argument) => argument !== "--");
if (!requestedPassword) throw new Error("Uso: pnpm password:hash -- \"tu contraseña\"");
const password = requestedPassword;

async function main() {
  console.log(await bcrypt.hash(password, 12));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
