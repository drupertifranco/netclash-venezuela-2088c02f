import { env } from "cloudflare:test";
import { expect, it } from "vitest";

const inscrito = (correo: string, token: string) =>
  env.DB.prepare(
    `INSERT INTO postcharla_inscritos (nombre, correo, alias, experiencia, acepta_terminos, version_terminos, token)
     VALUES ('Ana Pérez', ?, 'Ana P.', 'basico', 1, 'v', ?) RETURNING id`,
  ).bind(correo, token).first<{ id: number }>();

it("correo_unico_sin_importar_mayusculas", async () => {
  await inscrito("ANA@x.com", "t1");
  await expect(inscrito("ana@x.com", "t2")).rejects.toThrow(/UNIQUE/);
});

it("plantilla_desconocida_falla", async () => {
  const fila = await inscrito("bea@x.com", "t3");
  await expect(
    env.DB.prepare("INSERT INTO postcharla_envios (inscrito_id, plantilla) VALUES (?, 'otra')").bind(fila!.id).run(),
  ).rejects.toThrow(/CHECK/);
});
