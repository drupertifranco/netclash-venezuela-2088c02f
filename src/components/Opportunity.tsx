import { Target, Award, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const Opportunity = () => {
  const benefits = [
    {
      icon: <Target className="w-10 h-10 text-primary" />,
      title: "GET DISCOVERED",
      description: "Showcase your skills directly to CTOs and managers from Venezuela's leading ISPs, Data Centers, and tech companies who are actively recruiting."
    },
    {
      icon: <Award className="w-10 h-10 text-primary" />,
      title: "WIN STRATEGIC PRIZES",
      description: "Compete for a grand prize designed to accelerate your career, including high-level certifications (like CCIE/JNCIE paths), professional-grade lab equipment, or specialized bootcamps."
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "CONNECT WITH THE INDUSTRY",
      description: "This is the ultimate networking event. Meet the leaders, mentors, and peers who are defining the future of telecommunications in Venezuela."
    }
  ];

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            This is More Than a Competition.
            <br />
            <span className="text-primary">It's Your Next Career Move.</span>
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
