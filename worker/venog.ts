// Inscripción al laboratorio post-charla VENOG (por persona). Ver docs/superpowers/plans/2026-11-17-venog-inscripcion.md.
import { encolarYEnviar } from "./correo";

const EXPERIENCIAS = ["basico", "intermedio", "avanzado"];
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const json = (datos: unknown, status = 200) => Response.json(datos, { status });

// "Ana María Pérez" -> "Ana P."
// Nombre y alias van en correos y en el top 10: sin emojis ni banderas
const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;

export function aliasPorDefecto(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return partes[0].slice(0, 40);
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`.slice(0, 40);
}

function tokenNuevo(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function turnstileValido(token: unknown, ip: string, secreto: string): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const datos = new FormData();
  datos.append("secret", secreto);
  datos.append("response", token);
  datos.append("remoteip", ip);
  try {
    const r = await fetch(SITEVERIFY, { method: "POST", body: datos });
    return ((await r.json()) as { success?: boolean }).success === true;
  } catch (e) {
    console.error("turnstile no respondió", e);
    return false;
  }
}

export async function inscribir(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // Exigir JSON obliga al preflight CORS, que no respondemos: bloquea envíos desde otros sitios
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalido" }, 415);

  let d: Record<string, unknown>;
  try {
    d = await request.json();
  } catch {
    return json({ error: "invalido" }, 400);
  }
  if (!d || typeof d !== "object") return json({ error: "invalido" }, 400);

  // Campo trampa oculto en el formulario: si viene lleno es un bot; respondemos como si nada
  if (d.sitio) return json({ ok: true }, 201);

  if (d.version_terminos !== env.TERMINOS_LAB_VERSION) return json({ error: "version_terminos" }, 400);

  const errores: string[] = [];
  const campo = (k: string, max: number, requerido = true, sinEmoji = false) => {
    const v = typeof d[k] === "string" ? (d[k] as string).trim() : "";
    if (v.length > max || (requerido && !v) || (sinEmoji && EMOJI.test(v))) errores.push(k);
    return v || null;
  };
  const nombre = campo("nombre", 120, true, true);
  const correo = campo("correo", 254)?.toLowerCase() ?? null;
  const aliasPropio = campo("alias", 40, false, true);
  const organizacion = campo("organizacion", 120, false);
  const experiencia = d.experiencia;
  if (typeof experiencia !== "string" || !EXPERIENCIAS.includes(experiencia)) errores.push("experiencia");
  if (correo && !CORREO.test(correo)) errores.push("correo");
  if (d.acepta_terminos !== true) errores.push("acepta_terminos");
  if (errores.length) return json({ error: "invalido", campos: errores }, 400);

  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  if (!(await turnstileValido(d.turnstile, ip, env.TURNSTILE_SECRET))) return json({ error: "turnstile" }, 403);

  // Por correo y no por IP: en la charla casi todo el público sale a internet por la misma IP
  const { success } = await env.LIMITE_VENOG.limit({ key: correo! });
  if (!success) return json({ error: "limite" }, 429);

  let fila: { id: number } | null;
  try {
    fila = await env.DB.prepare(
      `INSERT INTO postcharla_inscritos
         (nombre, correo, alias, organizacion, experiencia, acepta_terminos, version_terminos, recibe_novedades, token, ip)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
       ON CONFLICT (correo) DO NOTHING
       RETURNING id`,
    )
      .bind(
        nombre, correo, aliasPropio ?? aliasPorDefecto(nombre!), organizacion, experiencia,
        env.TERMINOS_LAB_VERSION, d.recibe_novedades === true ? 1 : 0, tokenNuevo(), ip,
      )
      .first<{ id: number }>();
  } catch (e) {
    console.error("inscripción post-charla fallida", e);
    return json({ error: "servidor" }, 500);
  }
  if (!fila) return json({ ok: true, ya_inscrito: true }, 200);

  ctx.waitUntil(encolarYEnviar(env, fila.id, "confirmacion"));
  return json({ ok: true }, 201);
}
