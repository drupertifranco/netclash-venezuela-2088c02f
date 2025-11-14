import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
        className="gap-2"
      >
        <Globe className="w-4 h-4" />
        {language === 'es' ? 'EN' : 'ES'}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
