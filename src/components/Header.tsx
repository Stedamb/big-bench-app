import { MapPin, Mountain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="relative z-[1000] bg-card border-b border-border">
      {/* Top decorative rule */}
      <div className="editorial-rule-thick" />
      
      <div className="container py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
            <Mountain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold leading-tight tracking-tight">
              Big Bench
            </span>
            <span className="text-xs text-muted-foreground font-editorial italic">
              Community Project
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isHome ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Mappa
            </span>
          </Link>
          <Link
            to="/progress"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/progress" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Progresso
          </Link>
        </nav>
      </div>

      {/* Bottom decorative double rule */}
      <div className="editorial-rule-double" />
    </header>
  );
};

export default Header;
