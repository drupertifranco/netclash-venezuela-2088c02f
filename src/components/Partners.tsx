import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import netclashIcon from "@/assets/netclash-icon.png";

const Partners = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            {t.partners.title} <span className="text-primary">{t.partners.talentScouts}</span>
          </h2>
        </div>
        
        {/* Partner Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[1, 2, 3].map((item) => (
            <Card 
              key={item}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all flex items-center justify-center aspect-video"
            >
              <img 
                src={netclashIcon} 
                alt="Partner Logo" 
                className="h-20 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </Card>
          ))}
        </div>
        
        <p className="text-center text-muted-foreground mt-8 text-sm">
          {t.partners.subtitle}
        </p>
      </div>
    </section>
  );
};

export default Partners;
