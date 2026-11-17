// Envío de correos del laboratorio post-charla por la API de Resend (proveedor de envío de netclash.org).
// Cada correo queda en postcharla_envios: uno por persona y plantilla, con su estado e intentos.
import { plantillaConfirmacion, type Correo } from "./plantillas";

export type Plantilla = "confirmacion" | "acceso" | "recordatorio" | "resultados";

const REMITENTE = "NetClash <laboratorio@netclash.org>";
const RESPONDER_A = "druperti@netclash.org";
const MAX_INTENTOS = 5;

interface Fila {
  envio_id: number;
  inscrito_id: number;
  plantilla: Plantilla;
  estado: string;
  intentos: number;
  nombre: string;
  alias: string;
  correo: string;
}

const SELECCION = `SELECT e.id AS envio_id, e.inscrito_id, e.plantilla, e.estado, e.intentos, i.nombre, i.alias, i.correo
  FROM postcharla_envios e JOIN postcharla_inscritos i ON i.id = e.inscrito_id`;

function armar(f: Fila): Correo {
  if (f.plantilla === "confirmacion") return plantillaConfirmacion(f);
  throw new Error(`plantilla ${f.plantilla} todavía no implementada`);
}

async function marcar(env: Env, id: number, estado: string, error: string | null) {
  await env.DB.prepare(
    `UPDATE postcharla_envios SET estado = ?, intentos = intentos + 1, ultimo_error = ?,
       actualizado = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?`,
  ).bind(estado, error, id).run();
}

// true si quedó enviado. Sin API key no intenta: queda pendiente para el cron.
async function intentar(env: Env, f: Fila): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  try {
    const c = armar(f);
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${f.plantilla}-${f.inscrito_id}`,
      },
      body: JSON.stringify({ from: REMITENTE, to: [f.correo], reply_to: RESPONDER_A, subject: c.asunto, html: c.html, text: c.texto }),
    });
    if (r.ok) {
      await marcar(env, f.envio_id, "enviado", null);
      return true;
    }
    if (r.status === 429) {
      // Límite de tasa de Resend (ráfaga de inscripciones tras el QR): no gasta intento, lo toma el cron
      await env.DB.prepare(
        `UPDATE postcharla_envios SET estado = 'pendiente', ultimo_error = 'resend 429',
           actualizado = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?`,
      ).bind(f.envio_id).run();
      return false;
    }
    if (f.intentos + 1 >= MAX_INTENTOS) console.error("envío agotó sus intentos", f.plantilla, f.envio_id, r.status);
    await marcar(env, f.envio_id, "error", `resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
  } catch (e) {
    console.error("envío fallido", f.plantilla, f.envio_id, String(e));
    await marcar(env, f.envio_id, "error", String(e).slice(0, 200));
  }
  return false;
}

export async function encolarYEnviar(env: Env, inscritoId: number, plantilla: Plantilla): Promise<void> {
  await env.DB.prepare("INSERT INTO postcharla_envios (inscrito_id, plantilla) VALUES (?, ?) ON CONFLICT DO NOTHING")
    .bind(inscritoId, plantilla).run();
  const f = await env.DB.prepare(`${SELECCION} WHERE e.inscrito_id = ? AND e.plantilla = ?`)
    .bind(inscritoId, plantilla).first<Fila>();
  if (f && f.estado !== "enviado") await intentar(env, f);
}

// Corre en el cron: crea la confirmación de quien no la tenga (si falló el encolado) y reintenta lo pendiente,
// con una pausa entre envíos para no pasar el límite de tasa de Resend.
export async function reintentarPendientes(env: Env, pausaMs = 600): Promise<number> {
  await env.DB.prepare(
    `INSERT INTO postcharla_envios (inscrito_id, plantilla)
     SELECT id, 'confirmacion' FROM postcharla_inscritos
     WHERE id NOT IN (SELECT inscrito_id FROM postcharla_envios WHERE plantilla = 'confirmacion')`,
  ).run();
  const { results } = await env.DB.prepare(
    `${SELECCION} WHERE e.estado IN ('pendiente', 'error') AND e.intentos < ? ORDER BY e.id LIMIT 50`,
  ).bind(MAX_INTENTOS).all<Fila>();
  let enviados = 0;
  for (const [n, f] of results.entries()) {
    if (n > 0 && pausaMs > 0) await new Promise((ok) => setTimeout(ok, pausaMs));
    if (await intentar(env, f)) enviados++;
  }
  return enviados;
}
