import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACTO, TERMINOS_LAB_VERSION, TERMINOS_LAB_VIGENCIA } from "@/lib/venog";

const Seccion = ({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold">
      <span className="text-primary">{n}.</span> {titulo}
    </h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-foreground">
      {children}
    </div>
  </section>
);

const TerminosLaboratorio = () => {
  const correo = <a href={`mailto:${CONTACTO}`} className="text-primary underline">{CONTACTO}</a>;
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6">
        <Link to="/venog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la inscripción
          </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 pb-20 max-w-3xl space-y-8">
        <p className="rounded-md border border-destructive p-3 text-destructive font-medium">
          Borrador pendiente de revisión legal.
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Términos del laboratorio NetClash</h1>
          <p className="text-muted-foreground">
            Versión {TERMINOS_LAB_VERSION} · vigente desde el {TERMINOS_LAB_VIGENCIA}
          </p>
        </div>

        <Seccion n={1} titulo="Qué es">
          <p>
            Un laboratorio en línea y gratuito de redes, del 1 al 7 de diciembre de 2026, para quienes se inscriban después de
            la charla de NetClash en VENOG. Son tres laboratorios (OSPF, BGP y DNS), de 30 minutos como máximo cada uno. Cada
            persona recibe por correo un acceso personal e intransferible.
          </p>
        </Seccion>

        <Seccion n={2} titulo="Uso aceptable">
          <p>Cada laboratorio te da una terminal con permisos dentro de una red creada solo para ti. Al inscribirte te comprometes a:</p>
          <ul>
            <li>usar la terminal solo para resolver el laboratorio, dentro de tu propia red;</li>
            <li>no intentar salir del laboratorio, llegar a otros equipos o redes, ni afectar el servidor o a otras personas;</li>
            <li>no compartir tu acceso ni publicar las soluciones mientras la semana esté abierta.</li>
          </ul>
          <p>Si detectamos un uso fuera de estas reglas, cerramos el acceso y anulamos el resultado.</p>
        </Seccion>

        <Seccion n={3} titulo="Ranking y publicación">
          <p>
            Al cierre enviamos a todas las personas inscritas el <strong>top 10</strong>, con el <strong>alias</strong> que
            elegiste, tus puntos y tu tiempo. Tu nombre completo y tu correo no se publican.
          </p>
        </Seccion>

        <Seccion n={4} titulo="Datos que guardamos">
          <ul>
            <li>Nombre, correo, alias, organización (si la diste) y nivel de experiencia.</li>
            <li>La dirección IP desde la que te inscribiste, para prevenir abusos.</li>
            <li>Tus resultados (puntos y tiempos) y los comentarios que dejes sobre cada laboratorio.</li>
          </ul>
          <p>
            Los usamos para darte acceso, enviarte los correos del laboratorio (confirmación, acceso, recordatorio y
            resultados) y mejorar los laboratorios. No los vendemos ni los cedemos. Se borran el 31 de marzo de 2027, salvo que
            hayas aceptado recibir novedades de NetClash: en ese caso conservamos tu nombre y correo hasta que pidas la baja.
          </p>
        </Seccion>

        <Seccion n={5} titulo="Sin garantías">
          <p>
            El laboratorio está en construcción y se ofrece tal cual: puede tener fallas o interrupciones. No es una
            certificación.
          </p>
        </Seccion>

        <Seccion n={6} titulo="Contacto">
          <p>Para dudas, para corregir o borrar tus datos, o para darte de baja, escribe a {correo}.</p>
        </Seccion>
      </main>
    </div>
  );
};

export default TerminosLaboratorio;
