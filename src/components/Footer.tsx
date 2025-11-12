import netclashIcon from "@/assets/netclash-icon.png";

const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <img src={netclashIcon} alt="NETCLASH" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground">
              © 2025 NETCLASH. All rights reserved.
            </span>
          </div>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground">
            Venezuela's Premier Networking Competition
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
