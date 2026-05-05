import { Mountain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10 sm:py-12 bg-card">
      <div className="container text-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <Mountain className="w-5 h-5 text-primary" />
          <span className="font-display font-bold tracking-widest text-base sm:text-lg uppercase">
            BigBenchApp
          </span>
        </div>

        {/* Divider */}
        <div className="editorial-rule max-w-xs mx-auto mb-5" />

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5">
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Mappa
          </Link>
          <Link
            to="/community"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Comunità
          </Link>
          <Link
            to="/progress"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Passaporto
          </Link>
          <Link
            to="/privacy"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/cookies"
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            Cookie Policy
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          © {year} BigBenchApp · Tutti i diritti riservati
        </p>
      </div>
    </footer>
  );
};

export default Footer;
