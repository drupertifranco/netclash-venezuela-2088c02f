import { Target, Award, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Opportunity = () => {
  const { t } = useLanguage();
  
  const benefits = [
    {
      icon: <Target className="w-10 h-10 text-primary" />,
      title: t.opportunity.benefits.talent.title,
      description: t.opportunity.benefits.talent.description
    },
    {
      icon: <Award className="w-10 h-10 text-primary" />,
      title: t.opportunity.benefits.prizes.title,
      description: t.opportunity.benefits.prizes.description
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: t.opportunity.benefits.network.title,
      description: t.opportunity.benefits.network.description
    }
  ];

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            {t.opportunity.title}
          </h2>
        </div>
        
        {/* Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border hover:border-primary/50 transition-all group"
            >
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg inline-block group-hover:bg-primary/20 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-primary">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Opportunity;
