import { CheckCircle2 } from "lucide-react";

const TargetAudience = () => {
  const audienceTypes = [
    "Professional Network Engineer",
    "Telecommunications Specialist",
    "Bright University Student",
    "IT or Networking Professor"
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Are You Ready for the <span className="text-primary">Challenge?</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            NETCLASH is built for the best. If you are a...
          </p>
        </div>
        
        {/* Audience List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {audienceTypes.map((type, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all"
            >
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="font-medium">{type}</span>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xl font-bold text-primary">
          ...then this is your arena.
        </p>
      </div>
    </section>
  );
};

export default TargetAudience;
