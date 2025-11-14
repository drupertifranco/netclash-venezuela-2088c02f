import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Patrocinio = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button and language switcher */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.language === 'es' ? 'Volver' : 'Back'}
          </Button>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            {t.sponsorship.title}
          </h1>
          <p className="text-xl md:text-2xl text-primary font-semibold">
            {t.sponsorship.subtitle}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.sponsorship.description}
          </p>
        </div>
      </section>

      {/* Action Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Schedule Session Card */}
          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t.sponsorship.scheduleTitle}</CardTitle>
              <CardDescription>
                {t.sponsorship.scheduleDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                variant="default"
                onClick={() => window.open('https://calendly.com/netclash-info/30min', '_blank')}
              >
                {t.sponsorship.scheduleBtn}
              </Button>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t.sponsorship.formTitle}</CardTitle>
              <CardDescription>
                {t.sponsorship.formDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                variant="default"
                onClick={() => window.open('https://forms.gle/sponsorship-form', '_blank')}
              >
                {t.sponsorship.formBtn}
              </Button>
            </CardContent>
          </Card>

          {/* Download Card */}
          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t.sponsorship.downloadTitle}</CardTitle>
              <CardDescription>
                {t.sponsorship.downloadDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => {
                  // Crear un enlace temporal para descargar
                  const link = document.createElement('a');
                  link.href = '/netclash-sponsorship.pdf';
                  link.download = 'NETCLASH-Sponsorship-Presentation.pdf';
                  link.click();
                }}
              >
                {t.sponsorship.downloadBtn}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t.sponsorship.benefits.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.sponsorship.benefits.items.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-lg text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-b from-primary/10 to-transparent p-8 rounded-lg border border-primary/20">
          <h3 className="text-2xl md:text-3xl font-bold">
            {t.language === 'es' ? '¿Listo para patrocinar?' : 'Ready to sponsor?'}
          </h3>
          <p className="text-muted-foreground">
            {t.language === 'es' 
              ? 'Contacta con nuestro equipo para discutir cómo tu marca puede ser parte de NETCLASH.' 
              : 'Contact our team to discuss how your brand can be part of NETCLASH.'}
          </p>
          <Button 
            size="lg"
            onClick={() => window.open('https://calendly.com/netclash-info/30min', '_blank')}
          >
            {t.sponsorship.scheduleBtn}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Patrocinio;
