import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { inscribir } from "../worker/venog";

const PASA = "1x0000000000000000000000000000000AA";
const FALLA = "2x0000000000000000000000000000000AA";

beforeEach(async () => {
  // El plugin no aísla la D1 entre tests: se vacía a mano
  await env.DB.batch([env.DB.prepare("DELETE FROM postcharla_envios"), env.DB.prepare("DELETE FROM postcharla_inscritos")]);
  vi.clearAllMocks();
  vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
    const secreto = (init?.body as FormData).get("secret");
    return Response.json({ success: secreto === PASA });
  });
});
afterEach(() => vi.restoreAllMocks());

const base = {
  nombre: "Ana María Pérez",
  correo: "ana@mail.com",
  alias: "",
  experiencia: "intermedio",
  acepta_terminos: true,
  version_terminos: env.TERMINOS_LAB_VERSION,
  turnstile: "token",
};

async function enviar(cuerpo: Record<string, unknown>, opciones: { ip?: string; secreto?: string } = {}) {
  const ctx = createExecutionContext();
  const req = new Request("https://netclash.org/api/venog/inscripcion", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": opciones.ip ?? "200.1.1.1" },
    body: JSON.stringify(cuerpo),
  });
  const r = await inscribir(req, { ...env, TURNSTILE_SECRET: opciones.secreto ?? PASA }, ctx);
  await waitOnExecutionContext(ctx);
  return { status: r.status, cuerpo: (await r.json()) as Record<string, unknown> };
}

const filas = async () =>
  (await env.DB.prepare("SELECT * FROM postcharla_inscritos ORDER BY id").all<Record<string, string>>()).results;

it("inscribe_y_guarda_token", async () => {
  const r = await enviar({ ...base, correo: "  Ana@Mail.com " });
  expect(r.status).toBe(201);
  const [f] = await filas();
  expect(f.correo).toBe("ana@mail.com");
  expect(f.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(f.alias).toBe("Ana P.");
  expect(f.ip).toBe("200.1.1.1");
});

it("misma_ip_diez_personas", async () => {
  for (let i = 0; i < 10; i++) {
    expect((await enviar({ ...base, correo: `p${i}@mail.com` })).status).toBe(201);
  }
  expect(await filas()).toHaveLength(10);
});

it("duplicado_responde_ya_inscrito", async () => {
  const primera = await enviar({ ...base, correo: "dup@mail.com" });
  expect(primera.status).toBe(201);
  const r = await enviar({ ...base, correo: "DUP@mail.com " });
  expect(r.status).toBe(200);
  expect(r.cuerpo).toEqual({ ok: true, ya_inscrito: true });
  expect(await filas()).toHaveLength(1);
});

it("sin_terminos_400", async () => {
  const r = await enviar({ ...base, acepta_terminos: false });
  expect(r.status).toBe(400);
  expect(r.cuerpo.campos).toContain("acepta_terminos");
});

it("version_vieja_400", async () => {
  const r = await enviar({ ...base, version_terminos: "0.9" });
  expect(r).toEqual({ status: 400, cuerpo: { error: "version_terminos" } });
});

it("turnstile_falla_403", async () => {
  const r = await enviar(base, { secreto: FALLA });
  expect(r).toEqual({ status: 403, cuerpo: { error: "turnstile" } });
  expect(await filas()).toHaveLength(0);
});

it("trampa_llena_201_sin_fila", async () => {
  expect((await enviar({ ...base, sitio: "http://spam" })).status).toBe(201);
  expect(await filas()).toHaveLength(0);
});

it("alias_largo_400", async () => {
  const r = await enviar({ ...base, alias: "x".repeat(41) });
  expect(r.status).toBe(400);
  expect(r.cuerpo.campos).toContain("alias");
});

it("alias_propio_se_respeta", async () => {
  await enviar({ ...base, correo: "alias@mail.com", alias: "  router_ana " });
  expect((await filas())[0].alias).toBe("router_ana");
});
