import { env } from "cloudflare:test";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { encolarYEnviar, reintentarPendientes } from "../worker/correo";
import { plantillaConfirmacion } from "../worker/plantillas";

let llamadas: { url: string; init: RequestInit }[] = [];
let estadoResend = 200;

beforeEach(async () => {
  await env.DB.batch([env.DB.prepare("DELETE FROM postcharla_envios"), env.DB.prepare("DELETE FROM postcharla_inscritos")]);
  llamadas = [];
  estadoResend = 200;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
    llamadas.push({ url: String(url), init: init! });
    return new Response(estadoResend === 200 ? '{"id":"x"}' : "falla", { status: estadoResend });
  });
});
afterEach(() => vi.restoreAllMocks());

const conKey = { ...env, RESEND_API_KEY: "re_prueba" };

async function inscrito(correo = "ana@mail.com") {
  const f = await env.DB.prepare(
    `INSERT INTO postcharla_inscritos (nombre, correo, alias, experiencia, acepta_terminos, version_terminos, token)
     VALUES ('Ana Pérez', ?, 'Ana P.', 'basico', 1, 'v', 'TOKEN_SECRETO_' || ?) RETURNING id`,
  ).bind(correo, correo).first<{ id: number }>();
  return f!.id;
}
const envio = (id: number) =>
  env.DB.prepare("SELECT * FROM postcharla_envios WHERE inscrito_id = ?").bind(id).first<Record<string, unknown>>();

it("envia_y_marca_enviado", async () => {
  const id = await inscrito();
  await encolarYEnviar(conKey, id, "confirmacion");
  expect(llamadas).toHaveLength(1);
  expect(llamadas[0].url).toBe("https://api.resend.com/emails");
  const cuerpo = JSON.parse(llamadas[0].init.body as string);
  expect(cuerpo.to).toEqual(["ana@mail.com"]);
  expect(cuerpo.from).toBe("NetClash <laboratorio@netclash.org>");
  expect(cuerpo.reply_to).toBe("druperti@netclash.org");
  expect(new Headers(llamadas[0].init.headers).get("Idempotency-Key")).toBe(`confirmacion-${id}`);
  expect(await envio(id)).toMatchObject({ estado: "enviado", intentos: 1 });
});

it("sin_api_key_queda_pendiente", async () => {
  const id = await inscrito();
  await encolarYEnviar(env, id, "confirmacion");
  expect(llamadas).toHaveLength(0);
  expect(await envio(id)).toMatchObject({ estado: "pendiente", intentos: 0 });
});

it("resend_500_queda_error", async () => {
  estadoResend = 500;
  const id = await inscrito();
  await encolarYEnviar(conKey, id, "confirmacion");
  const e = await envio(id);
  expect(e).toMatchObject({ estado: "error", intentos: 1 });
  expect(String(e!.ultimo_error)).toContain("500");
});

it("no_reenvia_enviado", async () => {
  const id = await inscrito();
  await encolarYEnviar(conKey, id, "confirmacion");
  await encolarYEnviar(conKey, id, "confirmacion");
  expect(llamadas).toHaveLength(1);
});

it("reintento_envia_pendientes_y_respeta_tope", async () => {
  const a = await inscrito("a@mail.com");
  const b = await inscrito("b@mail.com");
  await encolarYEnviar(env, a, "confirmacion"); // queda pendiente (sin key)
  await encolarYEnviar(env, b, "confirmacion");
  await env.DB.prepare("UPDATE postcharla_envios SET estado = 'error', intentos = 5 WHERE inscrito_id = ?").bind(b).run();
  expect(await reintentarPendientes(conKey, 0)).toBe(1);
  expect(await envio(a)).toMatchObject({ estado: "enviado" });
  expect(await envio(b)).toMatchObject({ estado: "error", intentos: 5 });
});

it("plantilla_sin_token", () => {
  const p = plantillaConfirmacion({ nombre: "Ana Pérez", alias: "Ana P." });
  expect(p.asunto).toBe("Quedaste inscrito en el laboratorio de NetClash");
  for (const t of [p.html, p.texto]) {
    expect(t).not.toContain("TOKEN_SECRETO_123");
    expect(t).toContain("Ana P.");
    expect(t).toContain("30 de noviembre");
  }
});

it("resend_429_queda_pendiente_sin_gastar_intento", async () => {
  estadoResend = 429;
  const id = await inscrito();
  await encolarYEnviar(conKey, id, "confirmacion");
  expect(await envio(id)).toMatchObject({ estado: "pendiente", intentos: 0 });
});

it("cron_encola_confirmaciones_perdidas", async () => {
  // Inscrito sin fila de envío (por ejemplo, si falló el encolado en waitUntil)
  const id = await inscrito("huerfano@mail.com");
  expect(await reintentarPendientes(conKey, 0)).toBe(1);
  expect(await envio(id)).toMatchObject({ estado: "enviado", plantilla: "confirmacion" });
});
