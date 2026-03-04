import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-heading text-lg font-extrabold text-primary">QTF</span>
          </div>

          <p className="font-mono text-xs text-muted-foreground text-center">
            © 2026 QTF — National Forensic Sciences University, Chennai Campus
          </p>

          <div className="flex items-center gap-6">
            <a href="#about" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#register" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Register
            </a>
            <a href="#contact" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
