import { Zap, Target, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const NetworkWar = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: t.networkWar.features.labs.title,
      description: t.networkWar.features.labs.description
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: t.networkWar.features.competitive.title,
      description: t.networkWar.features.competitive.description
    },
    {
      icon: <Trophy className="w-8 h-8 text-primary" />,
      title: t.networkWar.features.visibility.title,
      description: t.networkWar.features.visibility.description
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            {t.networkWar.title}
          </h2>
        </div>
        
        {/* Description */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            {t.networkWar.subtitle}
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all hover:scale-105 hover:shadow-xl group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NetworkWar;
