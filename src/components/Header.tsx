import { LogIn, LogOut, MapPin, Mountain, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
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
    <header className="relative z-[1000] bg-white border-b-2 sm:border-b-4 border-black">
      <div className="container py-2 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-none bg-primary border-2 border-black shadow-neo-sm flex items-center justify-center group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
            <Mountain className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-2xl font-black uppercase leading-none tracking-tight">
              Big Bench
            </span>
            <span className="text-[8px] sm:text-xs text-black font-bold uppercase tracking-widest">
              Community Project
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-8">
          {/* Desktop nav links — hidden on mobile */}
          <Link
            to="/"
            className={`hidden sm:flex text-sm font-black uppercase tracking-widest transition-colors hover:text-primary items-center gap-1 ${
              isHome ? "text-primary" : "text-black"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Mappa
          </Link>
          <Link
            to="/guestbook"
            className={`hidden sm:block text-sm font-black uppercase tracking-widest transition-colors hover:text-primary ${
              location.pathname === "/guestbook" ? "text-primary" : "text-black"
            }`}
          >
            Guestbook
          </Link>
          <Link
            to="/progress"
            className={`hidden sm:block text-sm font-black uppercase tracking-widest transition-colors hover:text-primary ${
              location.pathname === "/progress" ? "text-primary" : "text-black"
            }`}
          >
            Passaporto
          </Link>

          {/* Desktop: user avatar / login */}
          <div className="hidden sm:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt="Avatar"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[1100]">
                  <DropdownMenuLabel className="font-editorial">
                    <p className="font-display font-bold text-sm truncate">
                      {user.user_metadata?.display_name || "Utente"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-normal">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/progress")}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Il mio passaporto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => navigate("/auth")}
                className="gap-1.5 h-8"
              >
                <LogIn className="w-3.5 h-3.5" />
                Accedi
              </Button>
            )}
          </div>

          {/* Hamburger — visible on all sizes, replaces everything on mobile */}
          <NavMenu />
        </nav>
      </div>

      <div className="editorial-rule-double" />
    </header>
  );
};

export default Header;
