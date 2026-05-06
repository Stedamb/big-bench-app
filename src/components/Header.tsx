import { LogIn, LogOut, MapPin, Mountain, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isHome = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="relative z-[1000] bg-card border-b border-border">
      <div className="editorial-rule-thick" />

      <div className="container py-3 flex items-center justify-between">
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

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isHome ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mappa</span>
            </span>
          </Link>
          <Link
            to="/guestbook"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/guestbook" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="hidden sm:inline">Guestbook</span>
            <span className="sm:hidden">Guest.</span>
          </Link>
          <Link
            to="/progress"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/progress" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="hidden sm:inline">Passaporto</span>
            <span className="sm:hidden">Pass.</span>
          </Link>

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
        </nav>
      </div>

      <div className="editorial-rule-double" />
    </header>
  );
};

export default Header;
