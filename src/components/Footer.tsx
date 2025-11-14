import { useLanguage } from "@/contexts/LanguageContext";
import netclashIcon from "@/assets/netclash-icon.png";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <img src={netclashIcon} alt="NETCLASH" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground">
              {t.footer.copyright}
            </span>
          </div>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground">
            {t.footer.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
