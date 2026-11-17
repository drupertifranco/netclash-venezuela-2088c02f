// Corre antes del deploy: sin la site key de Turnstile, el formulario /venog queda inutilizable.
import { existsSync, readFileSync } from "node:fs";

let clave = process.env.VITE_TURNSTILE_SITE_KEY ?? "";
if (!clave && existsSync(".env.production")) {
  const linea = readFileSync(".env.production", "utf8").split(/\r?\n/).find((l) => l.startsWith("VITE_TURNSTILE_SITE_KEY="));
  clave = linea?.split("=")[1]?.trim() ?? "";
}
if (!clave) {
  console.error("Falta VITE_TURNSTILE_SITE_KEY (en .env.production o en el entorno): no se despliega.");
  process.exit(1);
}
if (clave.startsWith("1x00000") || clave.startsWith("2x00000") || clave.startsWith("3x00000")) {
  console.error("VITE_TURNSTILE_SITE_KEY es una clave de prueba de Turnstile: no se despliega.");
  process.exit(1);
}
console.log("Site key de Turnstile presente.");
