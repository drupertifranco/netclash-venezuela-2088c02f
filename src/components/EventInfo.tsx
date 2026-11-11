import { Calendar, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { EVENTO } from "@/lib/evento";

const EventInfo = () => {
  const { t, language } = useLanguage();

  const datos = [
    { icon: <Calendar className="w-6 h-6 text-primary" />, label: t.evento.fecha, valor: EVENTO.fecha[language] },
    { icon: <MapPin className="w-6 h-6 text-primary" />, label: t.evento.lugar, valor: EVENTO.lugar[language] },
    { icon: <Users className="w-6 h-6 text-primary" />, label: t.evento.formato, valor: t.evento.formatoValor },
  ];

  return (
    <section id="evento" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl space-y-16">
        <h2 className="text-4xl md:text-5xl font-bold text-center">{t.evento.title}</h2>

        {/* Fecha, lugar y formato */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datos.map((dato) => (
            <Card key={dato.label} className="p-6 bg-card border-border flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">{dato.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{dato.label}</p>
                <p className="text-lg font-semibold">{dato.valor}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Agenda */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-center">{t.evento.agendaTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.evento.agenda.map((item) => (
              <Card key={item.titulo} className="p-6 bg-card border-border hover:border-primary/50 transition-all">
                <h4 className="text-lg font-bold text-primary mb-2">{item.titulo}</h4>
                <p className="text-muted-foreground">{item.texto}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-center">{t.evento.comoTitle}</h3>
          <ol className="space-y-4">
            {t.evento.pasos.map((paso, i) => (
              <li key={i} className="flex gap-4 items-start p-4 bg-card border border-border rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-1">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default EventInfo;
