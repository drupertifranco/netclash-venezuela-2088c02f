// Worker de NETCLASH: sirve la landing (assets estáticos) y la API de inscripción sobre D1.

const PERFILES = ["profesional", "telecom", "estudiante", "profesor", "otro"];
const EXPERIENCIAS = ["basico", "intermedio", "avanzado"];
const MODALIDADES = ["equipo", "individual"];
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i;

const json = (datos: unknown, status = 200) => Response.json(datos, { status });

async function registrar(request: Request, env: Env): Promise<Response> {
  // Exigir JSON obliga al navegador a hacer preflight CORS, que no respondemos: bloquea envíos desde otros sitios
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "invalido" }, 415);

  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const { success } = await env.LIMITE_REGISTRO.limit({ key: ip });
  if (!success) return json({ error: "limite" }, 429);

  let d: Record<string, unknown>;
  try {
    d = await request.json();
  } catch {
    return json({ error: "invalido" }, 400);
  }
  if (!d || typeof d !== "object") return json({ error: "invalido" }, 400);

  // Campo trampa oculto en el formulario: si viene lleno es un bot; respondemos como si nada
  if (d.sitio) return json({ ok: true }, 201);

  if (d.version_terminos !== env.TERMINOS_VERSION) return json({ error: "version_terminos" }, 400);

  const errores: string[] = [];
  const campo = (k: string, max: number, requerido = true) => {
    const v = typeof d[k] === "string" ? (d[k] as string).trim() : "";
    if (v.length > max || (requerido && !v)) errores.push(k);
    return v || null;
  };
  const opcion = (k: string, lista: string[]) => {
    const v = d[k];
    if (typeof v !== "string" || !lista.includes(v)) errores.push(k);
    return v as string;
  };

  const modalidad = opcion("modalidad", MODALIDADES);
  const r = {
    nombre: campo("nombre", 120),
    correo: campo("correo", 254)?.toLowerCase() ?? null,
    telefono: campo("telefono", 30, false),
    ciudad: campo("ciudad", 80),
    pais: campo("pais", 80),
    perfil: opcion("perfil", PERFILES),
    organizacion: campo("organizacion", 120, false),
    experiencia: opcion("experiencia", EXPERIENCIAS),
    equipo: modalidad === "equipo" ? campo("equipo", 60) : null,
    linkedin: campo("linkedin", 200, false),
  };
  if (r.correo && !CORREO.test(r.correo)) errores.push("correo");
  if (r.linkedin && !LINKEDIN.test(r.linkedin)) errores.push("linkedin");
  if (d.acepta_terminos !== true) errores.push("acepta_terminos");
  if (errores.length) return json({ error: "invalido", campos: errores }, 400);

  try {
    await env.DB.prepare(
      `INSERT INTO registros (nombre, correo, telefono, ciudad, pais, perfil, organizacion, experiencia,
         modalidad, equipo, linkedin, acepta_terminos, version_terminos, comparte_perfil, recibe_novedades, idioma)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    )
      .bind(
        r.nombre, r.correo, r.telefono, r.ciudad, r.pais, r.perfil, r.organizacion, r.experiencia,
        modalidad, r.equipo, r.linkedin, env.TERMINOS_VERSION,
        d.comparte_perfil === true ? 1 : 0, d.recibe_novedades === true ? 1 : 0, d.idioma === "en" ? "en" : "es",
      )
      .run();
  } catch (e) {
    if (String(e).includes("UNIQUE")) return json({ error: "duplicado" }, 409);
    console.error("registro fallido", e);
    return json({ error: "servidor" }, 500);
  }
  return json({ ok: true }, 201);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/registro") {
      if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
      return registrar(request, env);
    }
    return json({ error: "no_encontrado" }, 404);
  },
} satisfies ExportedHandler<Env>;
