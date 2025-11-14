import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FinalCTA = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-8">
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold">
            {t.finalCta.title}
            <br />
            <span className="text-primary">{t.finalCta.subtitle}</span>
          </h2>
          
          {/* Subheadline */}
          <p className="text-xl text-muted-foreground">
            {t.finalCta.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg">
              {t.finalCta.registerBtn}
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button variant="outline-light" size="lg">
              {t.finalCta.sponsorBtn}
              <Briefcase className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
