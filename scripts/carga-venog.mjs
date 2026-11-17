// Prueba de carga de la inscripción post-charla: simula al público de VENOG inscribiéndose a la vez desde una IP.
// Uso: node scripts/carga-venog.mjs <url> <n> <segundos>
// Necesita que el Worker tenga TURNSTILE_SECRET de prueba (1x0000000000000000000000000000000AA) y sin RESEND_API_KEY.
// Crea filas con correos carga+<i>@netclash.org: bórralas después.
const [url, nTexto = "80", segTexto = "60"] = process.argv.slice(2);
if (!url) {
  console.error("Uso: node scripts/carga-venog.mjs <url> <n> <segundos>");
  process.exit(2);
}
const n = Number(nTexto);
const segundos = Number(segTexto);
const VERSION = "1.0-2026-11-17";

const estados = {};
const tiempos = [];

async function una(i) {
  const inicio = performance.now();
  let estado;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nombre: `Carga ${i}`,
        correo: `carga+${i}@netclash.org`,
        alias: `carga${i}`,
        experiencia: "intermedio",
        acepta_terminos: true,
        version_terminos: VERSION,
        turnstile: "XXXX.DUMMY.TOKEN.XXXX",
      }),
    });
    estado = r.status;
    await r.arrayBuffer();
  } catch {
    estado = "red";
  }
  tiempos.push(performance.now() - inicio);
  estados[estado] = (estados[estado] ?? 0) + 1;
}

const pedidos = [];
for (let i = 0; i < n; i++) {
  pedidos.push(new Promise((ok) => setTimeout(() => una(i).then(ok), (i * segundos * 1000) / n)));
}
await Promise.all(pedidos);

tiempos.sort((a, b) => a - b);
const p = (q) => Math.round(tiempos[Math.min(tiempos.length - 1, Math.floor(q * tiempos.length))]);
console.log("estados:", JSON.stringify(estados));
console.log(`p50 ${p(0.5)} ms · p95 ${p(0.95)} ms · máx ${Math.round(tiempos.at(-1))} ms`);
process.exit(estados[201] === n ? 0 : 1);
