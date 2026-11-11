import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { TERMINOS_VERSION } from "@/lib/evento";

const INICIAL = {
  nombre: "",
  correo: "",
  telefono: "",
  ciudad: "",
  pais: "Venezuela",
  perfil: "",
  organizacion: "",
  experiencia: "",
  modalidad: "",
  equipo: "",
  linkedin: "",
  acepta_terminos: false,
  comparte_perfil: false,
  recibe_novedades: false,
  sitio: "", // campo trampa para bots, oculto
};
type Datos = typeof INICIAL;

// Mismas reglas que worker/index.ts; el Worker vuelve a validar
const validar = (d: Datos) => {
  const e: string[] = [];
  for (const k of ["nombre", "ciudad", "pais", "perfil", "experiencia", "modalidad"] as const) {
    if (!d[k].trim()) e.push(k);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.push("correo");
  if (d.modalidad === "equipo" && !d.equipo.trim()) e.push("equipo");
  if (d.linkedin.trim() && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(d.linkedin.trim())) e.push("linkedin");
  if (!d.acepta_terminos) e.push("acepta_terminos");
  return e;
};

const Registro = () => {
  const { t, language } = useLanguage();
  const r = t.registro;
  const [datos, setDatos] = useState<Datos>(INICIAL);
  const [errores, setErrores] = useState<string[]>([]);
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const poner = <K extends keyof Datos>(k: K, v: Datos[K]) => setDatos((d) => ({ ...d, [k]: v }));
  const mal = (k: string) => errores.includes(k);

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validar(datos);
    setErrores(e);
    setAviso(e.length ? r.errores.invalido : "");
    if (e.length) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...datos, idioma: language, version_terminos: TERMINOS_VERSION }),
      });
      if (res.ok) {
        setListo(true);
        window.scrollTo(0, 0);
        return;
      }
      const cuerpo = await res.json().catch(() => ({}));
      if (Array.isArray(cuerpo.campos)) setErrores(cuerpo.campos);
      setAviso((r.errores as Record<string, string>)[cuerpo.error] ?? r.errores.servidor);
    } catch {
      setAviso(r.errores.red);
    } finally {
      setEnviando(false);
    }
  };

  const Opcional = () => <span className="text-muted-foreground font-normal"> ({r.opcional})</span>;
  const ErrorCampo = ({ k }: { k: string }) => (mal(k) ? <p className="text-sm text-destructive">{r.revisar}</p> : null);

  const texto = (k: keyof Datos, label: string, opts: { tipo?: string; opcional?: boolean; auto?: string } = {}) => (
    <div className="space-y-2">
      <Label htmlFor={k}>
        {label}
        {opts.opcional && <Opcional />}
      </Label>
      <Input
        id={k}
        type={opts.tipo ?? "text"}
        autoComplete={opts.auto}
        value={datos[k] as string}
        onChange={(e) => poner(k, e.target.value)}
        aria-invalid={mal(k)}
        className={mal(k) ? "border-destructive" : ""}
      />
      <ErrorCampo k={k} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {r.back}
          </Button>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="container mx-auto px-4 pb-20 max-w-2xl">
        {listo ? (
          <Card className="p-8 md:p-12 bg-card border-border text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-3xl md:text-4xl font-bold">{r.listoTitle}</h1>
            <p className="text-lg text-muted-foreground">{r.listoTexto}</p>
            <Link to="/">
              <Button variant="default" size="lg">{r.listoVolver}</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="text-center space-y-4 mb-10">
              <h1 className="text-4xl md:text-5xl font-bold">{r.title}</h1>
              <p className="text-lg text-muted-foreground">{r.subtitle}</p>
            </div>

            <Card className="p-6 md:p-8 bg-card border-border">
              <form onSubmit={enviar} noValidate className="space-y-6">
                {texto("nombre", r.nombre, { auto: "name" })}
                {texto("correo", r.correo, { tipo: "email", auto: "email" })}
                {texto("telefono", r.telefono, { tipo: "tel", opcional: true, auto: "tel" })}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {texto("ciudad", r.ciudad, { auto: "address-level2" })}
                  {texto("pais", r.pais, { auto: "country-name" })}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perfil">{r.perfil}</Label>
                  <Select value={datos.perfil} onValueChange={(v) => poner("perfil", v)}>
                    <SelectTrigger id="perfil" aria-invalid={mal("perfil")} className={mal("perfil") ? "border-destructive" : ""}>
                      <SelectValue placeholder={r.perfilPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(r.perfiles).map(([valor, nombre]) => (
                        <SelectItem key={valor} value={valor}>{nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorCampo k="perfil" />
                </div>

                {texto("organizacion", r.organizacion, { opcional: true, auto: "organization" })}

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium mb-3">{r.experiencia}</legend>
                  <RadioGroup value={datos.experiencia} onValueChange={(v) => poner("experiencia", v)} className="flex flex-wrap gap-6">
                    {Object.entries(r.experiencias).map(([valor, nombre]) => (
                      <div key={valor} className="flex items-center gap-2">
                        <RadioGroupItem id={`exp-${valor}`} value={valor} />
                        <Label htmlFor={`exp-${valor}`} className="font-normal">{nombre}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <ErrorCampo k="experiencia" />
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium mb-3">{r.modalidad}</legend>
                  <RadioGroup value={datos.modalidad} onValueChange={(v) => poner("modalidad", v)} className="flex flex-wrap gap-6">
                    {Object.entries(r.modalidades).map(([valor, nombre]) => (
                      <div key={valor} className="flex items-center gap-2">
                        <RadioGroupItem id={`mod-${valor}`} value={valor} />
                        <Label htmlFor={`mod-${valor}`} className="font-normal">{nombre}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <ErrorCampo k="modalidad" />
                </fieldset>

                {datos.modalidad === "equipo" && (
                  <div className="space-y-2">
                    {texto("equipo", r.equipo)}
                    <p className="text-sm text-muted-foreground">{r.equipoAyuda}</p>
                  </div>
                )}

                {texto("linkedin", r.linkedin, { tipo: "url", opcional: true })}

                {/* Trampa para bots: invisible para personas */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label htmlFor="sitio">No llenar</label>
                  <input id="sitio" tabIndex={-1} autoComplete="off" value={datos.sitio} onChange={(e) => poner("sitio", e.target.value)} />
                </div>

                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="flex items-start gap-3 pt-4">
                    <Checkbox
                      id="acepta_terminos"
                      checked={datos.acepta_terminos}
                      onCheckedChange={(v) => poner("acepta_terminos", v === true)}
                      aria-invalid={mal("acepta_terminos")}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acepta_terminos" className="font-normal leading-relaxed">
                      {r.aceptaAntes}
                      <Link to="/terminos" target="_blank" className="text-primary underline hover:text-primary/90">
                        {r.aceptaLink}
                      </Link>
                      .
                    </Label>
                  </div>
                  <ErrorCampo k="acepta_terminos" />

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="comparte_perfil"
                      checked={datos.comparte_perfil}
                      onCheckedChange={(v) => poner("comparte_perfil", v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="comparte_perfil" className="font-normal leading-relaxed">
                      {r.comparte}
                      <Opcional />
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="recibe_novedades"
                      checked={datos.recibe_novedades}
                      onCheckedChange={(v) => poner("recibe_novedades", v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="recibe_novedades" className="font-normal leading-relaxed">
                      {r.novedades}
                      <Opcional />
                    </Label>
                  </div>
                </div>

                {aviso && (
                  <p role="alert" className="text-destructive font-medium">
                    {aviso}
                  </p>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {r.enviando}
                    </>
                  ) : (
                    r.enviar
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

export default Registro;
