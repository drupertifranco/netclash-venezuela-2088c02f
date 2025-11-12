import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center space-y-8">
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold">
            Stop Simulating.
            <br />
            <span className="text-primary">Start Competing.</span>
          </h2>
          
          {/* Subheadline */}
          <p className="text-xl text-muted-foreground">
            Spots are limited. Register now to secure your place in Venezuela's top networking competition.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="lg">
              Register Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button variant="outline-light" size="lg">
              Sponsor the Event
              <Briefcase className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
