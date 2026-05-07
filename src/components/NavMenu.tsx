import { useState } from "react";
import { Drawer } from "vaul";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Menu, X, MapPin, BookOpen, Stamp,
  Settings as SettingsIcon, LogIn, LogOut, Mountain, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/",          label: "Mappa",      icon: MapPin   },
  { to: "/guestbook", label: "Guestbook",  icon: BookOpen },
  { to: "/progress",  label: "Passaporto", icon: Stamp    },
];

const NavMenu = () => {
  const [open, setOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try { await signOut(); setOpen(false); navigate("/"); }
    catch { toast.error("Errore durante la disconnessione. Riprova."); }
  };

  const handleNav = (to: string) => { setOpen(false); navigate(to); };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
      {/* Trigger */}
      <Drawer.Trigger asChild>
        <button
          aria-label="Apri menu"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <Menu className="w-4 h-4" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[2000] bg-black/30 backdrop-blur-sm" />

        <Drawer.Content
          className={cn(
            "fixed top-0 right-0 bottom-0 z-[2001]",
            "w-[min(82vw,320px)] flex flex-col",
            "bg-background border-l border-border shadow-lg",
            "outline-none"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mountain className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display text-base text-foreground">Big Bench</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Chiudi menu"
              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col px-3 py-4 gap-1 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  onClick={() => handleNav(to)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full",
                    active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Bottom: theme + user */}
          <div className="border-t border-border px-3 py-4 flex flex-col gap-1">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 w-full"
            >
              {resolvedTheme === "dark"
                ? <><Sun className="w-4 h-4" /> Modalità chiara</>
                : <><Moon className="w-4 h-4" /> Modalità scura</>
              }
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden leading-tight">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.display_name || "Utente"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNav("/settings")}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 w-full"
                >
                  <SettingsIcon className="w-4 h-4" /> Impostazioni
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/8 transition-all duration-150 w-full"
                >
                  <LogOut className="w-4 h-4" /> Esci
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav("/auth")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all duration-150 w-full"
              >
                <LogIn className="w-4 h-4" /> Accedi
              </button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default NavMenu;
