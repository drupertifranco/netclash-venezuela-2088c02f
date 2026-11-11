import Hero from "@/components/Hero";
import EventInfo from "@/components/EventInfo";
import NetworkWar from "@/components/NetworkWar";
import Opportunity from "@/components/Opportunity";
import TargetAudience from "@/components/TargetAudience";
import Partners from "@/components/Partners";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <LanguageSwitcher />
      <Hero />
      <EventInfo />
      <NetworkWar />
      <Opportunity />
      <TargetAudience />
      <Partners />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Index;
