import { LogIn, LogOut, MapPin, Mountain, Settings as SettingsIcon, User as UserIcon, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavMenu from "@/components/NavMenu";

const Header = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const isHome = location.pathname === "/";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      toast.error("Errore durante la disconnessione. Riprova.");
    }
  };

  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/15">
            <Mountain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base leading-tight tracking-tight text-foreground">
              Big Bench
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-sans">
              Community Project
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-6">
          {/* Desktop nav links */}
          {[
            { to: "/", label: "Mappa", icon: MapPin },
            { to: "/guestbook", label: "Guestbook" },
            { to: "/progress", label: "Passaporto" },
          ].map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`hidden sm:flex items-center gap-1.5 text-sm transition-colors duration-150 ${
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </Link>
            );
          })}

          {/* Desktop: user avatar / login */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[1100] border-0 shadow-lg">
                  <DropdownMenuLabel>
                    <p className="font-medium text-sm truncate">
                      {user.user_metadata?.display_name || "Utente"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-normal">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="w-4 h-4 mr-2" /> Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/progress")}>
                    <UserIcon className="w-4 h-4 mr-2" /> Il mio passaporto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                    {resolvedTheme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {resolvedTheme === "dark" ? "Modalità chiara" : "Modalità scura"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                >
                  {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Button size="sm" variant="outline" onClick={() => navigate("/auth")} className="gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  Accedi
                </Button>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <div className="sm:hidden"><NavMenu /></div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
