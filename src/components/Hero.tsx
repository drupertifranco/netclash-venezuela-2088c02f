import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import netclashLogo from "@/assets/netclash-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  const { t } = useLanguage();
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={netclashLogo} alt="NETCLASH Logo" className="h-32 w-auto" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-primary">NETCLASH:</span>
            <br />
            {t.hero.headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.open('https://forms.gle/MJRc1mGBtMsyGyX18', '_blank')}
            >
              {t.hero.registerBtn}
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{t.hero.limitedSpots}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
