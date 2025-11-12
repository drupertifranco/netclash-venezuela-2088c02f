import { Zap, Network, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";

const NetworkWar = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Live Labs",
      description: "Hands-on network challenges in real-time environments"
    },
    {
      icon: <Network className="w-8 h-8 text-primary" />,
      title: "Routing Challenge",
      description: "Master OSPF, BGP, and complex network protocols"
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "Automation",
      description: "Deploy modern network automation solutions"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            The First Live <span className="text-primary">"Network War"</span> for
            <br />
            Venezuela's Top Talent
          </h2>
        </div>
        
        {/* Description */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            NETCLASH is not a test. It's a high-stakes, practical "network hackathon" where professionals, 
            students, and professors solve real-world network challenges. Participants will face live labs 
            involving complex routing (OSPF, BGP), network automation, and high-pressure troubleshooting 
            scenarios. This is your arena to prove your expertise.
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
