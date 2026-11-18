import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TERMINOS_LAB_VERSION, TURNSTILE_SITE_KEY } from "@/lib/venog";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const INICIAL = {
  nombre: "",
  correo: "",
  alias: "",
  organizacion: "",
  experiencia: "",
  acepta_terminos: false,
  recibe_novedades: false,
  sitio: "", // campo trampa para bots, oculto
};
type Datos = typeof INICIAL;

const EXPERIENCIAS = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" };

const AVISOS: Record<string, string> = {
  invalido: "Revisa los campos marcados. El nombre y el alias no pueden llevar emojis.",
  turnstile: "No pudimos comprobar que no eres un robot. Inténtalo de nuevo.",
  limite: "Demasiados intentos con ese correo. Espera un minuto y vuelve a intentarlo.",
  version_terminos: "Los términos cambiaron. Recarga la página.",
  servidor: "Algo falló de nuestro lado. Inténtalo de nuevo en un momento.",
  red: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
  verificacion:
    "No cargó la verificación anti-robots. Desactiva el bloqueador de anuncios o cambia a datos móviles, y recarga la página.",
};

// Mismo cálculo que el Worker: "Ana María Pérez" -> "Ana P."
const aliasPorDefecto = (nombre: string) => {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (p.length < 2) return p[0] ?? "";
  return `${p[0]} ${p[p.length - 1][0].toUpperCase()}.`;
};

const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;

const validar = (d: Datos) => {
  const e: string[] = [];
  if (!d.nombre.trim() || EMOJI.test(d.nombre)) e.push("nombre");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.push("correo");
  if (d.alias.trim().length > 40 || EMOJI.test(d.alias)) e.push("alias");
  if (!d.experiencia) e.push("experiencia");
  if (!d.acepta_terminos) e.push("acepta_terminos");
  return e;
};

type CampoTexto = "nombre" | "correo" | "alias" | "organizacion";

const Venog = () => {
  const [datos, setDatos] = useState<Datos>(INICIAL);
  const [errores, setErrores] = useState<string[]>([]);
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<"" | "nuevo" | "repetido">("");
  const [token, setToken] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const widget = useRef<string>();

  useEffect(() => {
    document.title = "Laboratorio NetClash · inscripción";
  }, []);

  // Turnstile en modo explícito: el botón queda deshabilitado hasta tener token.
  // Si el script no carga (bloqueador, red lenta) o el widget falla, se avisa qué hacer en vez de quedar esperando.
  useEffect(() => {
    let listo = false;
    const fallo = () => {
      if (!listo) setAviso(AVISOS.verificacion);
    };
    const espera = window.setTimeout(fallo, 15000);
    const montar = () => {
      if (!caja.current || !window.turnstile || widget.current) return;
      try {
        widget.current = window.turnstile.render(caja.current, {
        sitekey: TURNSTILE_SITE_KEY,
        language: "es",
        callback: (t: string) => {
          listo = true;
          setToken(t);
          setAviso((a) => (a === AVISOS.verificacion ? "" : a));
        },
        "expired-callback": () => setToken(""),
        "error-callback": () => {
          setToken("");
          setAviso(AVISOS.verificacion);
        },
        });
      } catch (e) {
        console.error("Turnstile no se pudo montar", e);
        fallo();
      }
    };
    if (window.turnstile) montar();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = montar;
      s.onerror = () => {
        listo = false;
        fallo();
      };
      document.head.appendChild(s);
    }
    return () => window.clearTimeout(espera);
  }, []);

  const poner = <K extends keyof Datos>(k: K, v: Datos[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const mal = (k: string) => errores.includes(k);

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validar(datos);
    setErrores(e);
    setAviso(e.length ? AVISOS.invalido : "");
    if (e.length || !token) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/venog/inscripcion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...datos, turnstile: token, version_terminos: TERMINOS_LAB_VERSION }),
      });
      const cuerpo = await res.json().catch(() => ({}));
      if (res.ok) {
        setResultado(cuerpo.ya_inscrito ? "repetido" : "nuevo");
        window.scrollTo(0, 0);
        return;
      }
      if (Array.isArray(cuerpo.campos)) setErrores(cuerpo.campos);
      setAviso(AVISOS[cuerpo.error] ?? AVISOS.servidor);
      // Un token de Turnstile sirve una sola vez: pedir otro para reintentar
      setToken("");
      window.turnstile?.reset(widget.current);
    } catch {
      setAviso(AVISOS.red);
      // El token pudo haberse gastado si el pedido llegó al servidor: pedir uno nuevo
      setToken("");
      window.turnstile?.reset(widget.current);
    } finally {
      setEnviando(false);
    }
  };

  const ErrorCampo = ({ k, texto = "Revisa este campo." }: { k: string; texto?: string }) =>
    mal(k) ? <p className="text-sm text-destructive">{texto}</p> : null;

  const campo = (
    k: CampoTexto,
    label: string,
    opts: { tipo?: string; auto?: string; opcional?: boolean; placeholder?: string; ayuda?: string } = {},
  ) => (
    <div className="space-y-2">
      <Label htmlFor={k}>
        {label}
        {opts.opcional && <span className="text-muted-foreground font-normal"> (opcional)</span>}
      </Label>
      <Input
        id={k}
        type={opts.tipo ?? "text"}
        autoComplete={opts.auto}
        placeholder={opts.placeholder}
        value={datos[k]}
        onChange={(e) => poner(k, e.target.value)}
        aria-invalid={mal(k)}
        className={mal(k) ? "border-destructive" : ""}
      />
      {opts.ayuda && <p className="text-sm text-muted-foreground">{opts.ayuda}</p>}
      <ErrorCampo k={k} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-20 max-w-xl">
        {resultado ? (
          <Card className="p-6 md:p-10 bg-card border-border text-center space-y-5">
            <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">{resultado === "nuevo" ? "¡Listo!" : "Ya estabas inscrito"}</h1>
            <p className="text-lg text-muted-foreground">
              {resultado === "nuevo"
                ? `Te escribimos a ${datos.correo.trim().toLowerCase()}. El 30 de noviembre te llega tu acceso.`
                : "Ese correo ya está en la lista. El 30 de noviembre te llega tu acceso."}
            </p>
            <Link to="/">
              <Button variant="default" size="lg">Conocer NetClash</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Laboratorio NetClash · del 1 al 7 de diciembre</p>
              <h1 className="text-3xl md:text-4xl font-bold">Resuelve una red rota, a tu hora</h1>
              <p className="text-muted-foreground leading-relaxed">
                Tres laboratorios, OSPF, BGP y DNS, de 30 minutos como máximo cada uno. Cada uno levanta tu propia red, y un
                evaluador te dice cuándo lo resolviste. Al cierre, el top 10.
              </p>
            </div>

            <Card className="p-5 md:p-8 bg-card border-border">
              <form onSubmit={enviar} noValidate className="space-y-6">
                {campo("nombre", "Nombre y apellido", { auto: "name" })}
                {campo("correo", "Correo", { tipo: "email", auto: "email", ayuda: "Ahí te llega el acceso." })}
                {campo("alias", "Alias para el ranking", {
                  opcional: true,
                  placeholder: aliasPorDefecto(datos.nombre) || "Ana P.",
                  ayuda: "Es lo que se publica en el top 10. Si lo dejas vacío, usamos tu nombre y la inicial del apellido.",
                })}
                {campo("organizacion", "Organización", { opcional: true, auto: "organization" })}

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium mb-3">Experiencia en redes</legend>
                  <RadioGroup value={datos.experiencia} onValueChange={(v) => poner("experiencia", v)} className="flex flex-wrap gap-5">
                    {Object.entries(EXPERIENCIAS).map(([valor, nombre]) => (
                      <div key={valor} className="flex items-center gap-2">
                        <RadioGroupItem id={`exp-${valor}`} value={valor} />
                        <Label htmlFor={`exp-${valor}`} className="font-normal">{nombre}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <ErrorCampo k="experiencia" texto="Elige una opción." />
                </fieldset>

                {/* Trampa para bots: invisible para personas */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label htmlFor="sitio">No llenar</label>
                  <input id="sitio" tabIndex={-1} autoComplete="off" value={datos.sitio} onChange={(e) => poner("sitio", e.target.value)} />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acepta_terminos"
                      checked={datos.acepta_terminos}
                      onCheckedChange={(v) => poner("acepta_terminos", v === true)}
                      aria-invalid={mal("acepta_terminos")}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acepta_terminos" className="font-normal leading-relaxed">
                      Acepto los{" "}
                      <Link to="/venog/terminos" target="_blank" className="text-primary underline hover:text-primary/90">
                        términos del laboratorio
                      </Link>
                      .
                    </Label>
                  </div>
                  <ErrorCampo k="acepta_terminos" texto="Hace falta aceptar los términos." />

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="recibe_novedades"
                      checked={datos.recibe_novedades}
                      onCheckedChange={(v) => poner("recibe_novedades", v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="recibe_novedades" className="font-normal leading-relaxed">
                      Quiero recibir novedades de NetClash
                      <span className="text-muted-foreground"> (opcional)</span>
                    </Label>
                  </div>
                </div>

                <div ref={caja} className="min-h-[65px]" />

                {aviso && (
                  <p role="alert" className="text-destructive font-medium">
                    {aviso}
                  </p>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={enviando || !token}>
                  {enviando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Inscribiendo…
                    </>
                  ) : token ? (
                    "Inscribirme"
                  ) : (
                    "Verificando que no eres un robot…"
                  )}
                </Button>
              </form>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Venog;
