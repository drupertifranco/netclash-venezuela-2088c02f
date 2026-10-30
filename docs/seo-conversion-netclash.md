# NETCLASH: plan de SEO y conversión

Fecha del diagnóstico: 30 de octubre de 2026. Rama `cloudflare-workers`. Sitio revisado: https://netclash.rupertifrancod.workers.dev

## Alcance y límites

- No había herramientas de datos SEO conectadas (volúmenes, posiciones, backlinks). Los volúmenes de búsqueda **no están medidos**. Las palabras clave de la sección 5 salen de búsquedas web reales y de lógica de intención, no de cifras.
- La comparación con otras landings es corta: 4 búsquedas web, ninguna landing analizada a fondo.
- Sin Search Console no hay datos propios. Hay que conectarlo en cuanto exista dominio.
- No medí Core Web Vitals reales (sin PageSpeed ni RUM).

## 1. Diagnóstico

### Qué tan completa está
- `src/lib/evento.ts` sigue con placeholders: fecha "Por anunciar", sede "por anunciar" y `contacto: ""` (vacío). Nada de eso se ha completado.
- Es una SPA de React sin prerender. El HTML servido pesa 1,8 KB con `<div id="root">` vacío. Google renderiza JS, pero los bots de redes sociales y de IA no, y el primer rastreo es más lento.
- Las 4 rutas (`/`, `/registro`, `/patrocinio`, `/terminos`) comparten el mismo `<title>` y la misma descripción.
- Cualquier URL inexistente devuelve 200 con el HTML de la app (fallback SPA). `/sitemap.xml` devolvía 200 `text/html`, lo que Google trata como soft 404 (ya corregido con un sitemap real, tras el despliegue).

### Metadata (estado antes de mis cambios)
- Title de unos 80 caracteres y description de unos 230: ambos se cortan en resultados.
- `meta keywords`: Google la ignora.
- `og:image` y `twitter:image` apuntaban a una imagen de **lovable.dev**: al compartir en WhatsApp, LinkedIn o X salía la imagen de otra marca.
- Sin canonical, sin `og:url`, sin `og:locale`.
- `robots.txt` correcto pero sin `Sitemap:`. No había sitemap.
- Script de Calendly cargado en todas las páginas sin usarse (los botones solo hacen `window.open`).

### Encabezados y accesibilidad
- `/` tiene un solo `h1` y `h2` coherentes; en `EventInfo` se pasa de `h2` a `h3`/`h4` sin saltos graves.
- La sección "Socios" (`Partners.tsx`) muestra 3 tarjetas con el icono de NetClash y `alt="Partner Logo"`. Para un visitante parece un patrocinador falso (ver sección 4).

### Velocidad (solo tamaños, sin medir)
- JS 411 KB (131 KB gzip), CSS 60 KB, hero 116 KB. Razonable para una landing.
- El hero es `background-image` CSS con `backdrop-blur` y dos orbes animados: puede afectar LCP y el rendimiento en móviles modestos. Medir con PageSpeed antes de tocar.
- HTML con `max-age=0, must-revalidate`; los assets llevan hash y se pueden cachear.

### Conversión
- Hay dos CTA claros ("Registrarse Ahora" en el hero y en el cierre) hacia `/registro`. Bien.
- La propuesta de valor es clara pero **no verificable**: "contratación directa", "premios en efectivo, certificaciones y equipos", "ISPs líderes, centros de datos". No hay un solo nombre de empresa, premio, jurado ni ponente.
- Sin fecha ni sede el visitante no puede decidir si va. Es el mayor freno a la conversión hoy.
- El formulario tiene unos 11 campos de usuario (6 obligatorios + modalidad + aceptar términos); LinkedIn, teléfono y organización son opcionales. Razonable; el campo de equipo condicional es correcto.
- Sin Turnstile: protegido por honeypot y rate limit (5/min/IP).
- Sin prueba social: ni cifras, ni testimonios, ni logos reales. La cifra ">300 asistentes esperados" no aparece en la landing.
- La pantalla de éxito no ofrece siguiente paso (compartir, comunidad, calendario).

### Comparación con el entorno (búsquedas web, 30-oct-2026)
- No hay competidor directo: ninguna búsqueda devolvió una competencia de redes BGP/OSPF en Venezuela. Es una ventaja de nicho y a la vez una señal: la demanda de búsqueda para esos términos probablemente es baja y habrá que crearla con marketing, no esperarla del SEO.
- Referentes cercanos: Cisco NetRiders Latam (estudiantes de Networking Academy; no lista Venezuela), Desafío BCOP (Brasil, buenas prácticas operacionales), torneo de redes de PUCMM (RD), LACNIC/LACNOG (LACNIC 46: 19 al 22 de octubre de 2026 en Mendoza) y FITELVEN (feria de telecom en el Poliedro de Caracas, 118 empresas en 2024 y unas 128 a 134 en 2025 según la fuente).
- Lo que suelen hacer bien los eventos de ese tipo y esta landing no: fecha y sede visibles, agenda con horarios, patrocinadores y jurado con nombre, reglas y premios concretos, FAQ, cuenta regresiva y resultados de ediciones previas. (Es una síntesis de patrones habituales, no de una auditoría detallada de esas páginas.)

## 2. Lista priorizada de mejoras

Tipo: C = copy, M = metadata, D = código/infraestructura.

| # | Mejora | Por qué | Tipo | Estado |
|---|---|---|---|---|
| 1 | Completar fecha, sede y correo reales en `evento.ts` | Sin esto no hay decisión de asistir ni confianza; desbloquea JSON-LD Event y FAQ | C | Requiere al usuario |
| 2 | Corregir imagen OG (era de lovable.dev), title, description, canonical, og:url/locale | Primera impresión al compartir en la campaña | M | Hecho (commit local) |
| 3 | `sitemap.xml` + `Sitemap:` en robots, bloquear `/api/` | Descubrimiento e indexación; evita el soft 404 | D | Hecho (commit local) |
| 4 | Quitar script de Calendly de todas las páginas | Peso y terceros sin uso | D | Hecho (commit local) |
| 5 | Logos de relleno de Partners con alt vacío | Accesibilidad | C | Hecho; la sección sigue pendiente (punto 9) |
| 6 | Título y descripción propios por ruta | Hoy las 4 URLs son idénticas para buscadores | D | Pendiente, ver sección 3 |
| 7 | Imagen OG real 1200x630 (logo + "Competencia de redes, Caracas, fecha") | `summary_large_image` rinde más al compartir que el favicon | M | Requiere diseño y fecha |
| 8 | Prerender de `/` o inyección de metadata por ruta en el Worker | El HTML servido está vacío para bots que no ejecutan JS | D | Pendiente, ver sección 4 |
| 9 | Quitar o reemplazar "Socios" y suavizar afirmaciones no verificables | Credibilidad y riesgo de publicidad engañosa | C | Requiere al usuario |
| 10 | FAQ (cuándo, dónde, costo, reglas, requisitos, idioma) | Resuelve objeciones y aporta contenido indexable | C | Necesita datos reales |
| 11 | Datos estructurados `Event` (JSON-LD) | Posible rich result de eventos | M | Necesita fecha y sede |
| 12 | Paso siguiente tras inscribirse (compartir, calendario, comunidad) | Convierte inscritos en difusión | C/D | Toca el flujo de registro: decidir |
| 13 | UTM y evento de conversión (Cloudflare Web Analytics u otro) | Medir qué canal inscribe | D | Decidir herramienta |
| 14 | Medir Core Web Vitals; si LCP > 2,5 s, aligerar blur/orbes y precargar hero | Móvil con conexiones lentas | D | Medir primero |
| 15 | Contenido formativo: "Qué es un CTF de redes", "Preparación BGP y OSPF" | Capta búsquedas de práctica con poca competencia | C | Después del evento base |

## 3. Cambios hechos y pendientes de bajo riesgo

Commits locales en `cloudflare-workers`, sin push ni deploy:

1. `index.html`: title de unos 62 caracteres con "BGP y OSPF" y "Caracas"; description de unos 175 caracteres con la acción ("Inscríbete gratis"); canonical, `og:url`, `og:site_name`, `og:locale es_VE`, `theme-color`; la imagen OG pasa de lovable.dev al favicon propio (500x500) con `twitter:card=summary`; se eliminan `meta keywords` y el script de Calendly.
   - **Confirmar**: la description dice "Inscríbete gratis". No encontré en el repo que la inscripción sea gratuita; es una suposición.
2. `public/sitemap.xml` con 4 URLs; `robots.txt` con `Sitemap:` y `Disallow: /api/`.
3. `Partners.tsx`: logos de relleno con `alt=""`.

Todas las URLs absolutas usan el dominio workers.dev. **Al cambiar de dominio hay que actualizar** `canonical`, `og:*`, `sitemap.xml` y `robots.txt`.

Verificado: `vite build` termina bien. Lo publicado no cambia hasta que se haga `npm run cf:deploy`.

**No hecho a propósito**: títulos por ruta (punto 6). `App.tsx`, `Registro.tsx` y `Terminos.tsx` tienen cambios sin commitear del usuario y `Patrocinio.tsx` puede estar en manos de otra sesión; no los toqué para no mezclar cambios. Propuesta: un componente `RouteMeta` montado en `App.tsx` que fije `document.title` y la meta description según `useLocation()`.

## 4. Decisiones que necesito del usuario (no implementadas)

1. **Fecha, sede y correo de contacto reales.** Sin ellos no hay JSON-LD `Event`, FAQ ni cuenta regresiva, y el copy sigue siendo vago.
2. **Dominio propio** (`netclash.online`, `netclash.app` o quedarte en workers.dev). Afecta a canonical, sitemap, OG, correo con dominio y confianza. Recomendación: decidirlo antes de la campaña; cambiar de dominio con enlaces ya circulando pierde alcance.
3. **Turnstile en el formulario.** Afecta el registro en producción. Con campaña pagada atraerá bots y el rate limit por IP no frena un ataque distribuido. Recomendación: activarlo antes de lanzar anuncios.
4. **Afirmaciones y sección "Socios".** Hoy dice "contratación directa", premios en efectivo/certificaciones/equipos e "ISPs líderes". ¿Son ciertas hoy? Si no, recomiendo suavizar ("empresas invitadas", "premios por anunciar") y ocultar Socios hasta tener logos reales.
5. **Imagen OG.** ¿La diseñas tú o la preparo con el logo? Es más útil con fecha y sede.
6. **¿Es gratis la inscripción?** Confirmar o corregir la meta description.
7. **Idioma.** La versión en inglés es estado de la SPA, sin URL propia. Para posicionar en inglés habría que crear rutas por idioma. Recomendación: priorizar español.
8. **Prerender/SSR (punto 8).** Cambia el build y el despliegue. Recomiendo hacerlo, en una sesión aparte y probando en un Worker de staging.
9. **Paso posterior al registro (punto 12).** Toca el flujo `/registro`; no lo cambié.
10. **Analítica.** ¿Cloudflare Web Analytics (sin cookies) u otra?

## 5. Palabras clave y ángulos

**Método y límite**: sin volúmenes. Lo comprobado: las búsquedas "hackathon redes Venezuela", "competencia de redes Latinoamérica BGP OSPF CTF" y "evento redes Caracas" no devolvieron ninguna competencia equivalente, solo hackathons genéricos (Build 4 Venezuela, Hack for Venezuela) y competencias de otros países. Eso confirma poca competencia, no demanda. Validar con Search Console y Keyword Planner antes de invertir en contenido.

### Para inscritos (ingenieros, estudiantes, profesores)
- Núcleo: `competencia de redes Venezuela`, `hackathon de redes`, `competencia de networking Caracas`, `CTF de redes`, `torneo de redes`.
- Práctica técnica: `laboratorio BGP`, `laboratorio OSPF`, `práctica BGP OSPF`, `troubleshooting de redes`.
- Empleo: `empleo ingeniero de redes Venezuela`, `trabajo redes y telecomunicaciones Caracas`.
- Marca: `NETCLASH`, `NetClash Venezuela`. "Network War" es ambiguo; usarlo siempre junto a Venezuela.

### Para patrocinadores y aliados
- `patrocinar evento de telecomunicaciones Venezuela`, `patrocinio hackathon tecnología Venezuela`, `reclutar ingenieros de redes Venezuela`, `talento IT Venezuela`.
- Ángulo de venta: acceso a ingenieros de redes evaluados en práctica, no en entrevista. `/patrocinio` necesita title y description propios y cifras reales (asistentes, perfiles).
- Contexto verificado: FITELVEN reúne más de cien empresas cada año en el Poliedro de Caracas, y Cantv y Movilnet organizan conferencias propias. Sirve para el discurso de patrocinio; no es un dato de búsqueda.

### Ángulos de enlaces y autoridad
- LACNIC/LACNOG y Cisco NetRiders muestran que "operadores de redes" y "competencia para estudiantes" son marcos reconocidos en la región. Buscar menciones o enlaces desde universidades, comunidades de Cisco, MikroTik y Nokia, y grupos de LACNOG.

### Siguiente paso de investigación
Con dominio propio y Search Console, revisar a las 2 semanas qué consultas muestran impresiones. Con eso se priorizan los puntos 10 y 15.
