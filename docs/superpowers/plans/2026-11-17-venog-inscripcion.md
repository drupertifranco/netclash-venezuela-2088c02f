# Inscripción al laboratorio post-charla VENOG: plan de implementación (fase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Objetivo:** que la noche del 2026-11-25 hasta 80 personas se inscriban en `https://netclash.org/venog` en un minuto, desde la misma IP, aceptando términos, y que cada una reciba su correo de confirmación.

**Arquitectura:** una ruta nueva `POST /api/venog/inscripcion` en el Worker `netclash`, en `worker/venog.ts`, que guarda en tablas nuevas de D1. El envío de correo va en `worker/correo.ts`, con la API de Resend, el proveedor de envío de Mailflare para `netclash.org`. Un cron reintenta los envíos pendientes. La página React `/venog` y sus términos usan el estilo de la landing.

**Tecnología:** Cloudflare Workers, D1, Rate Limiting binding, Turnstile, Resend API, React + Vite + shadcn, vitest + `@cloudflare/vitest-pool-workers`.

**Spec:** `C:\Users\DoménicoRupertiFranc\Documents\NetClash-Marketing\charla-venog\diseno-laboratorio-postcharla.md` (secciones "La inscripción" y "Calendario").

## Restricciones globales

- **Rama:** todo va en `cloudflare-workers`. No se toca `/registro`, la tabla `registros` ni los términos v1.0.
- **Versión de términos:** `TERMINOS_LAB_VERSION = "1.0-2026-11-17"`, igual en `wrangler.jsonc` (vars) y en `src/lib/venog.ts`.
- **Límite de tasa:** por correo, no por IP (`LIMITE_VENOG`, 3 por 60 s). No se usa `LIMITE_REGISTRO` en la ruta nueva.
- **Remitente:** `NetClash <laboratorio@netclash.org>`, con `reply_to` a `druperti@netclash.org`.
- **Secretos:** `TURNSTILE_SECRET` y `RESEND_API_KEY` los carga el usuario con `wrangler secret put`. Nunca van en el repo, en el chat ni en logs.
- **Token de acceso:** 32 bytes aleatorios en base64url (`crypto.getRandomValues`). En esta fase no se envía ni se muestra.
- **Textos:** en español. No nombrar FYCO ni Nokia.
- **Página:** pensada primero para teléfono (desde ahí escanean el QR). Sin scroll horizontal a 360 px.

## Foco de revisión

1. **Muchas personas detrás de la misma IP del wifi del lugar.** Todas se inscriben. Test: 10 inscripciones seguidas con el mismo `cf-connecting-ip` dan 201 (Tarea 3).
2. **La persona aprieta "Inscribirme" dos veces, o vuelve a escanear y se inscribe de nuevo.** Recibe "ya estabas inscrito", no un error, y no sale un segundo correo. Test en la Tarea 3.
3. **Resend falla o la key no está cargada.** La inscripción igual responde 201 y el envío queda `pendiente` para el cron. Test en la Tarea 4.
4. **Correo con mayúsculas o espacios.** `Ana@Mail.com ` y `ana@mail.com` son la misma persona. Test en la Tarea 3.
5. **Turnstile no carga en el teléfono** (bloqueador o red lenta). El botón queda deshabilitado con el texto "Verificando que no eres un robot…" y no envía nada sin token. Se comprueba a mano en la Tarea 5.

---

### Tarea 1: Arnés de pruebas del Worker

**Archivos:**
- Crear: `vitest.config.ts`, `test/env.d.ts`, `test/registro.test.ts`
- Modificar: `package.json` (devDependencies y script `"test": "vitest run"`)

**Interfaces:**
- Produce: `npm test` corre los tests en workerd con D1 local migrado. En cada test, `env` de `cloudflare:test` trae `DB` y las vars de `wrangler.jsonc`.

- [ ] **Paso 1:** `npm i -D vitest@~3.2 @cloudflare/vitest-pool-workers`. `vitest.config.ts` usa `defineWorkersConfig`, con `wrangler: { configPath: "./wrangler.jsonc" }` y `miniflare.bindings.TEST_MIGRATIONS = await readD1Migrations("./migrations")`. Agregar `test/apply-migrations.ts` como setup: `applyD1Migrations(env.DB, env.TEST_MIGRATIONS)`.
- [ ] **Paso 2:** escribir un test de humo en `test/registro.test.ts`: `POST /api/registro` con `content-type: text/plain` responde 415.
- [ ] **Paso 3:** `npm test`. Esperado: 1 passed.
- [ ] **Paso 4:** commit `"Agregar tests del Worker con vitest-pool-workers"`.

### Tarea 2: Tablas de D1 para el laboratorio post-charla

**Archivos:**
- Crear: `migrations/0002_postcharla.sql`, `test/migracion.test.ts`

**Interfaces:**
- Produce las tablas:
  - `postcharla_inscritos`:
    - `id` INTEGER PK;
    - `creado`;
    - `nombre` (≤120);
    - `correo` UNIQUE COLLATE NOCASE;
    - `alias` (≤40);
    - `organizacion` NULL;
    - `experiencia` CHECK (basico, intermedio, avanzado);
    - `acepta_terminos` CHECK = 1;
    - `version_terminos`;
    - `recibe_novedades` 0/1;
    - `token` UNIQUE NOT NULL;
    - `ip` NULL.
  - `postcharla_envios`:
    - `id`;
    - `inscrito_id` FK;
    - `plantilla` CHECK (confirmacion, acceso, recordatorio, resultados);
    - `estado` CHECK (pendiente, enviado, error), DEFAULT pendiente;
    - `intentos` INTEGER DEFAULT 0;
    - `ultimo_error` NULL;
    - `creado`;
    - `actualizado`;
    - UNIQUE (`inscrito_id`, `plantilla`).

- [ ] **Paso 1:** test: insertar dos inscritos con `ANA@x.com` y `ana@x.com` falla con UNIQUE. Insertar un envío con plantilla `otra` falla con CHECK.
- [ ] **Paso 2:** `npm test`. Esperado: FAIL (no existe la tabla).
- [ ] **Paso 3:** escribir la migración.
- [ ] **Paso 4:** `npm test`. Esperado: PASS.
- [ ] **Paso 5:** commit `"Agregar tablas de inscritos y envíos del laboratorio post-charla"`.

### Tarea 3: `POST /api/venog/inscripcion`

**Archivos:**
- Crear: `worker/venog.ts`, `test/venog.test.ts`
- Modificar: `worker/index.ts` (enrutar la ruta y exportar `scheduled`); `wrangler.jsonc`:
  - ratelimit `LIMITE_VENOG` (namespace `"2102"`, simple 3 por 60);
  - var `TERMINOS_LAB_VERSION`;
  - `"triggers": { "crons": ["*/10 * * * *"] }`;
  - `run_worker_first` ya cubre `/api/*`.

  Después, `npm run cf:types`.

**Interfaces:**
- Consume: las tablas de la Tarea 2 y `encolarYEnviar(env, inscritoId, "confirmacion")` de la Tarea 4. Para esta tarea, crear el stub con esa firma.
- Produce: `inscribir(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>`.

  Cuerpo JSON:
  - `nombre`, `correo`, `alias`, `organizacion?`, `experiencia`;
  - `acepta_terminos: true`, `version_terminos`;
  - `recibe_novedades?`;
  - `turnstile` (token);
  - `sitio` (trampa).

  Respuestas:

  | Código | Cuerpo |
  |---|---|
  | 201 | `{ok:true}` |
  | 200 | `{ok:true, ya_inscrito:true}` |
  | 400 | `{error:"invalido", campos:[...]}` |
  | 400 | `{error:"version_terminos"}` |
  | 403 | `{error:"turnstile"}` |
  | 415 | — |
  | 429 | `{error:"limite"}` |
  | 500 | `{error:"servidor"}` |

- [ ] **Paso 1: tests**, con `TURNSTILE_SECRET` de prueba `1x0000000000000000000000000000000AA` (siempre pasa) y `2x0000000000000000000000000000000AA` (siempre falla), inyectado en `miniflare.bindings`. El `fetch` a `challenges.cloudflare.com/turnstile/v0/siteverify` se mockea con `vi.spyOn(globalThis, "fetch")`, que devuelve `{success:true|false}` según el secreto. Los tests son:
  - `inscribe_y_guarda_token`: 201, una fila, `token` de 43 caracteres base64url, correo guardado en minúsculas y sin espacios;
  - `misma_ip_diez_personas`: 10 correos distintos con el mismo `cf-connecting-ip` dan diez 201;
  - `duplicado_responde_ya_inscrito`: segunda vez con `ANA@mail.com ` da 200 `ya_inscrito:true`, sigue habiendo una fila, y `encolarYEnviar` se llamó una sola vez;
  - `sin_terminos_400`: `campos` contiene `acepta_terminos`;
  - `version_vieja_400`;
  - `turnstile_falla_403`, sin fila;
  - `trampa_llena_201_sin_fila`;
  - `alias_largo_400`: 41 caracteres;
  - `alias_vacio_usa_nombre`: `"Ana María Pérez"` da `"Ana P."`.
- [ ] **Paso 2:** `npm test`. Esperado: FAIL.
- [ ] **Paso 3:** implementar `inscribir`, con este orden:
  1. content-type;
  2. JSON;
  3. trampa;
  4. versión;
  5. validación (mismas reglas de `campo`/`opcion` que `registrar`, copiadas, no compartidas, para no tocar `/registro`);
  6. Turnstile (`remoteip` = `cf-connecting-ip`);
  7. `LIMITE_VENOG.limit({key: correo})`;
  8. `INSERT … ON CONFLICT(correo) DO NOTHING RETURNING id`. Sin fila, responde 200 `ya_inscrito`.

  Con fila: `ctx.waitUntil(encolarYEnviar(env, id, "confirmacion"))` y responde 201. El alias por defecto es la primera palabra del nombre más la inicial de la última palabra y punto.
- [ ] **Paso 4:** `npm test`. Esperado: PASS.
- [ ] **Paso 5:** commit `"Agregar la API de inscripción al laboratorio post-charla"`.

### Tarea 4: Correo de confirmación por Resend con reintentos

**Archivos:**
- Crear: `worker/correo.ts`, `worker/plantillas.ts`, `test/correo.test.ts`
- Modificar: `worker/index.ts` (`scheduled` llama a `reintentarPendientes(env)`)

**Interfaces:**
- `encolarYEnviar(env: Env, inscritoId: number, plantilla: Plantilla): Promise<void>`. Crea o reusa la fila de `postcharla_envios` (UNIQUE) y, si su estado es `enviado`, no hace nada.
- `reintentarPendientes(env: Env): Promise<number>`. Reenvía `pendiente`/`error` con `intentos < 5`, hasta 50 por corrida, y devuelve cuántos envió.
- `plantillaConfirmacion(i: {nombre: string, alias: string}): {asunto: string, html: string, texto: string}`.
  - Asunto fijo: `"Quedaste inscrito en el laboratorio de NetClash"`.
  - El texto dice que el acceso llega el 30 de noviembre, que la ventana es del 1 al 7 de diciembre, que son tres laboratorios (OSPF, BGP y DNS) de 30 minutos como máximo, y que en el ranking aparecerá como `<alias>`.
  - No incluye el token.
- Envío: `POST https://api.resend.com/emails` con `Authorization: Bearer ${RESEND_API_KEY}`, from y reply_to de las restricciones globales, y header `Idempotency-Key: confirmacion-<inscritoId>`.

- [ ] **Paso 1: tests**, con fetch mockeado:
  - `envia_y_marca_enviado`: el cuerpo enviado a Resend tiene `to` = correo del inscrito y el from correcto, y la fila queda `enviado` con intentos 1;
  - `sin_api_key_queda_pendiente`: `RESEND_API_KEY` ausente; no hay fetch, la fila queda `pendiente` y no lanza;
  - `resend_500_queda_error`: `intentos` 1 y `ultimo_error` con el status;
  - `no_reenvia_enviado`: llamar dos veces da un solo fetch;
  - `reintento_respeta_tope`: una fila con intentos 5 no se reintenta;
  - `plantilla_sin_token`: el html y el texto no contienen el token del inscrito.
- [ ] **Paso 2:** `npm test`. Esperado: FAIL.
- [ ] **Paso 3:** implementar. Los errores se registran con `console.error` sin el cuerpo del correo ni la key.
- [ ] **Paso 4:** `npm test`. Esperado: PASS. Quitar el stub de la Tarea 3.
- [ ] **Paso 5:** commit `"Enviar la confirmación del laboratorio por Resend con reintentos"`.

### Tarea 5: Páginas `/venog` y `/venog/terminos`

**Archivos:**
- Crear: `src/lib/venog.ts` (`TERMINOS_LAB_VERSION`, `TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY`), `src/pages/Venog.tsx`, `src/pages/TerminosLaboratorio.tsx`
- Modificar: `src/App.tsx` (dos rutas nuevas antes de `*`), `.env.example` (`VITE_TURNSTILE_SITE_KEY=`)

**Interfaces:**
- Consume: `POST /api/venog/inscripcion` de la Tarea 3.

- [ ] **Paso 1: formulario.** Reusar los componentes de `Registro.tsx` (inputs, checkbox, estilos), con estos campos:
  - nombre, correo, alias (placeholder generado del nombre), organización opcional;
  - experiencia (tres botones);
  - casilla de términos con enlace a `/venog/terminos`;
  - casilla de novedades;
  - campo trampa oculto `sitio`;
  - Turnstile explícito (`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`). El botón queda deshabilitado hasta tener token.

  Estados después de enviar:
  - 201: "¡Listo! Te escribimos a <correo>";
  - `ya_inscrito`: "Ya estabas inscrito con ese correo";
  - 429, 403 y 500: mensaje y opción de reintentar.

  Encabezado: "Laboratorio NetClash · del 1 al 7 de diciembre", en una línea, con los tres labs y los 30 minutos.
- [ ] **Paso 2: términos.** Página con versión y fecha que cubre:
  - uso aceptable: no atacar, no intentar salir del laboratorio, nada fuera de la red propia;
  - terminal con permisos dentro de la red propia;
  - publicación del alias, los puntos y el tiempo en el top 10;
  - datos guardados (nombre, correo, alias, organización, experiencia, IP de inscripción y resultados), para qué se usan y que se borran al 2027-03-31 salvo que acepte novedades;
  - contacto `druperti@netclash.org`.

  Al principio va una nota visible: "Borrador pendiente de revisión legal". El usuario la quita después de revisarlo.
- [ ] **Paso 3:** verificar con `npm run cf:dev`, usando `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA` y `TURNSTILE_SECRET` de prueba en `.dev.vars`. Abrir `http://localhost:8787/venog` en el navegador del panel, a 375×812:
  - inscribir una persona: aparece el mensaje de éxito;
  - repetir: aparece "Ya estabas inscrito";
  - no hay scroll horizontal;
  - la consola no muestra errores.
- [ ] **Paso 4:** `npm run lint` y `npm run build` sin errores.
- [ ] **Paso 5:** commit `"Agregar la página de inscripción al laboratorio post-charla y sus términos"`.

### Tarea 6: Puesta en producción y prueba de carga

**Archivos:**
- Crear: `scripts/carga-venog.mjs`

**Interfaces:**
- `node scripts/carga-venog.mjs <url> <n> <segundos>`: `n` POST repartidos en `segundos`, con correos `carga+<i>@netclash.org`, token Turnstile `XXXX.DUMMY.TOKEN.XXXX` y alias `carga<i>`. Imprime el conteo por status y p50/p95/máximo en ms, y sale con código 1 si algún status no es 201.

- [ ] **Paso 1 (usuario):**
  1. Crear el widget de Turnstile para `netclash.org` y `www.netclash.org`, en modo Managed, y guardar la site key en `.env.production` como `VITE_TURNSTILE_SITE_KEY`.
  2. Cargar los secretos con `wrangler secret put TURNSTILE_SECRET` y `wrangler secret put RESEND_API_KEY`.
- [ ] **Paso 2:** `npm run db:migrar` y `npm run cf:deploy`.
- [ ] **Paso 3: prueba de carga contra producción**, en esta secuencia:
  1. `wrangler secret put TURNSTILE_SECRET` con el secreto de prueba `1x0000000000000000000000000000000AA` (lo carga el usuario).
  2. `wrangler secret delete RESEND_API_KEY`, para que no salgan 80 correos.
  3. `node scripts/carga-venog.mjs https://netclash.org/api/venog/inscripcion 80 60`. Esperado: 80× 201, p95 < 1000 ms y código 0.
  4. `wrangler d1 execute netclash-db --remote --command "SELECT count(*) FROM postcharla_inscritos WHERE correo LIKE 'carga+%'"`. Esperado: 80.
  5. Borrar esas filas y sus envíos.
  6. El usuario vuelve a cargar `TURNSTILE_SECRET` real y `RESEND_API_KEY`.
- [ ] **Paso 4: humo real.** El usuario se inscribe desde su teléfono en `https://netclash.org/venog`. La fila aparece, el envío queda `enviado` y el correo llega a su bandeja (no a spam). Borrar la fila después si el usuario lo pide.
- [ ] **Paso 5:** commit del script `"Agregar la prueba de carga de la inscripción post-charla"`, y push de la rama.

### Tarea 7: QR nuevo en la lámina 15

**Archivos (fuera del repo):**
- `charla-venog/qr/qr-venog.svg`
- La lámina `cierre.html` del deck https://claude.ai/artifact/6dAQZRi38Tm1nbvygMqrrY

- [ ] **Paso 1:** `python qrgen.py https://netclash.org/venog qr-venog.svg "#10151F" "#EDE9DF"`.
- [ ] **Paso 2:** decodificar con jsQR en el navegador del panel (como `verificar-qr.html`). Esperado: el texto es exactamente `https://netclash.org/venog`.
- [ ] **Paso 3:** reemplazar el SVG en `cierre.html`. Debajo del QR, el texto visible es `netclash.org/venog` y "Laboratorio gratis del 1 al 7 de diciembre". Publicar el deck al mismo URL.
- [ ] **Paso 4:** en el guion, lámina 15, cambiar el QR a `netclash.org/venog` y agregar la frase de cierre: "Escaneen ahora: la semana que viene les llega su laboratorio". En el plan de acción, el 21-nov se escanea este QR nuevo.
