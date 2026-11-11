import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { EVENTO, TERMINOS_VERSION, TERMINOS_VIGENCIA } from "@/lib/evento";

const Seccion = ({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) => (
  <section id={`s${n}`} className="space-y-3">
    <h2 className="text-2xl font-bold">
      <span className="text-primary">{n}.</span> {titulo}
    </h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-foreground">
      {children}
    </div>
  </section>
);

const Terminos = () => {
  const { language } = useLanguage();
  const contacto = EVENTO.contacto ? (
    <a href={`mailto:${EVENTO.contacto}`} className="text-primary underline">{EVENTO.contacto}</a>
  ) : (
    <strong>[correo de contacto por definir]</strong>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "es" ? "Volver" : "Back"}
          </Button>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="container mx-auto px-4 pb-20 max-w-3xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">Términos y condiciones</h1>
          <p className="text-lg text-muted-foreground">
            Participación en NETCLASH y Política de privacidad. Versión {TERMINOS_VERSION}, vigente desde el {TERMINOS_VIGENCIA}.
          </p>
          {language === "en" && (
            <p className="p-4 bg-card border border-border rounded-lg">
              These terms are available in Spanish only. The Spanish version is the binding one.
            </p>
          )}
        </div>

        <Seccion n={1} titulo="Quién organiza">
          <p>
            NETCLASH es una competencia de redes por equipos organizada por el equipo de NETCLASH (en adelante, «la
            Organización»). Para cualquier consulta sobre estos términos o sobre tus datos, escribe a {contacto}.
          </p>
        </Seccion>

        <Seccion n={2} titulo="Aceptación">
          <p>
            Al enviar el formulario de inscripción aceptas estos términos y la política de privacidad de la sección 9. Si no
            estás de acuerdo, no te inscribas.
          </p>
        </Seccion>

        <Seccion n={3} titulo="Quién puede participar">
          <ul>
            <li>Personas mayores de 18 años. Los menores de edad pueden participar con autorización escrita de su representante legal, que la Organización puede pedir antes del evento.</li>
            <li>Profesionales, estudiantes, docentes y cualquier persona interesada en redes.</li>
            <li>Quienes preparan o evalúan los desafíos no pueden competir.</li>
          </ul>
        </Seccion>

        <Seccion n={4} titulo="Inscripción y cupos">
          <ul>
            <li>Una inscripción por persona, con datos verdaderos.</li>
            <li>Los cupos son limitados. Enviar el formulario no garantiza un lugar: la Organización confirma cada cupo por correo. Si se agotan, quedas en lista de espera.</li>
            <li>Los equipos se forman con el nombre indicado en la inscripción. A quienes se inscriban sin equipo, la Organización les asigna uno. La Organización define cuántas personas forman un equipo y puede reorganizar los equipos incompletos.</li>
            <li>Puedes cancelar tu inscripción cuando quieras escribiendo al correo de contacto.</li>
            <li>La Organización puede anular inscripciones duplicadas o con datos falsos.</li>
          </ul>
        </Seccion>

        <Seccion n={5} titulo="Reglas de la competencia">
          <ul>
            <li>Cada equipo recibe un laboratorio propio durante el tiempo de juego. Solo pueden usarlo los integrantes de ese equipo.</li>
            <li>
              <strong>Está prohibido:</strong> atacar, saturar o intentar entrar a la infraestructura del evento más allá de lo
              que pide cada desafío; interferir con los laboratorios de otros equipos; atacar sistemas de terceros o de
              internet; y compartir accesos, credenciales o soluciones con otros equipos mientras dure la competencia.
            </li>
            <li>Cada desafío puede tener reglas propias, que se anuncian al comenzar.</li>
            <li>Los puntos los asigna un sistema de verificación automática. Ante fallas técnicas, la Organización puede pausar la competencia, reiniciar laboratorios o ajustar puntajes. Los empates y las disputas los resuelve el jurado, y su decisión es final.</li>
            <li>Romper estas reglas puede costar puntos o la descalificación del equipo.</li>
          </ul>
        </Seccion>

        <Seccion n={6} titulo="Conducta">
          <p>
            Esperamos un trato respetuoso hacia participantes, jurado, patrocinadores y personal. No toleramos acoso ni
            discriminación de ningún tipo. La Organización puede retirar del evento a quien no cumpla esta norma.
          </p>
        </Seccion>

        <Seccion n={7} titulo="Premios">
          <ul>
            <li>Los premios se anuncian antes del evento y pueden cambiar según lo que aporten los patrocinadores.</li>
            <li>Son personales e intransferibles y no se cambian por dinero, salvo que se indique lo contrario.</li>
            <li>Para entregarlos, la Organización puede pedir un documento de identidad. Los impuestos o gastos que genere un premio corren por cuenta de quien lo recibe.</li>
          </ul>
        </Seccion>

        <Seccion n={8} titulo="Imagen y difusión">
          <p>
            Durante el evento se tomarán fotos y videos que la Organización y sus patrocinadores pueden usar, sin pago, para
            difundir NETCLASH. La tabla de posiciones, con los nombres de los equipos, se proyecta durante el evento y puede
            publicarse. Si no quieres aparecer en fotos o videos, avísalo en la mesa de registro el día del evento.
          </p>
        </Seccion>

        <Seccion n={9} titulo="Privacidad y datos personales">
          <ul>
            <li><strong>Qué datos recogemos:</strong> los del formulario (nombre, correo, teléfono, ciudad, país, perfil, empresa o universidad, nivel, equipo y LinkedIn) y tus resultados en la competencia.</li>
            <li><strong>Para qué:</strong> gestionar tu inscripción, formar los equipos, enviarte información del evento y preparar estadísticas que no identifican a nadie.</li>
            <li><strong>Patrocinadores y reclutadores:</strong> solo les compartimos tu nombre, correo, LinkedIn y resultados si marcaste esa casilla en el formulario. Puedes retirar esa autorización cuando quieras.</li>
            <li><strong>Novedades:</strong> solo te escribimos sobre próximas ediciones si marcaste esa casilla.</li>
            <li><strong>No vendemos tus datos.</strong></li>
            <li><strong>Dónde se guardan:</strong> en la infraestructura de Cloudflare, Inc., que presta el alojamiento y la base de datos de este sitio. Sus servidores pueden estar fuera de Venezuela.</li>
            <li><strong>Cuánto tiempo:</strong> hasta 12 meses después del evento. Si aceptaste recibir novedades, conservamos tu nombre y correo hasta que pidas la baja.</li>
            <li><strong>Tus derechos:</strong> puedes pedir acceso a tus datos, corregirlos o borrarlos y retirar tus autorizaciones escribiendo a {contacto}, conforme al derecho de habeas data del artículo 28 de la Constitución de la República Bolivariana de Venezuela.</li>
          </ul>
        </Seccion>

        <Seccion n={10} titulo="Propiedad intelectual">
          <p>
            Los desafíos, laboratorios, configuraciones y el software de la competencia pertenecen a la Organización y no
            pueden copiarse ni redistribuirse. Terminada la competencia, puedes publicar tus propias soluciones o writeups,
            salvo que la Organización avise que un desafío se usará de nuevo.
          </p>
        </Seccion>

        <Seccion n={11} titulo="Responsabilidad">
          <ul>
            <li>Cada participante cuida sus equipos y pertenencias. La Organización no responde por pérdidas, robos o daños.</li>
            <li>Si llevas tu propia computadora, eres responsable de ella y de su software.</li>
            <li>La Organización no responde por fallas de internet, electricidad u otras causas fuera de su control que afecten la competencia.</li>
          </ul>
        </Seccion>

        <Seccion n={12} titulo="Cambios y cancelación">
          <p>
            La Organización puede cambiar la fecha, la sede, el formato o estos términos, y puede cancelar el evento por
            causas de fuerza mayor. Los cambios se avisan por correo a las personas inscritas y se publican en esta página
            con un nuevo número de versión.
          </p>
        </Seccion>

        <Seccion n={13} titulo="Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier controversia se
            intentará resolver primero de forma amistosa; si no es posible, se someterá a los tribunales competentes de
            Caracas.
          </p>
        </Seccion>
      </main>
    </div>
  );
};

export default Terminos;
