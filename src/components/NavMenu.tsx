import { useState } from "react";
import { Drawer } from "vaul";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  MapPin,
  BookOpen,
  Stamp,
  Settings as SettingsIcon,
  LogIn,
  LogOut,
  Mountain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/lib/haptics";

const NAV_ITEMS = [
  { to: "/", label: "Mappa", icon: MapPin },
  { to: "/guestbook", label: "Guestbook", icon: BookOpen },
  { to: "/progress", label: "Passaporto", icon: Stamp },
];

const NavMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { playHaptic } = useHaptics();

  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      setOpen(false);
      playHaptic('medium');
      navigate("/");
    } catch {
      toast.error("Errore durante la disconnessione. Riprova.");
    }
  };

  const handleNav = (to: string) => {
    setOpen(false);
    playHaptic('medium');
    navigate(to);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      direction="right"
    >
      {/* Hamburger trigger */}
      <Drawer.Trigger asChild>
        <button
          aria-label="Apri menu"
          onClick={() => playHaptic('light')}
          className="flex items-center justify-center w-9 h-9 sm:hidden border-2 border-black bg-white shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        {/* Overlay */}
        <Drawer.Overlay className="fixed inset-0 z-[2000] bg-black/60" />

        {/* Panel */}
        <Drawer.Content
          className={cn(
            "fixed top-0 right-0 bottom-0 z-[2001]",
            "w-[min(85vw,360px)] flex flex-col",
            "bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)]",
            "outline-none"
          )}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary border-2 border-black shadow-neo-sm flex items-center justify-center">
                <Mountain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-black uppercase leading-none">
                Menu
              </span>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                playHaptic('light');
              }}
              aria-label="Chiudi menu"
              className="w-8 h-8 border-2 border-black bg-white shadow-neo-sm flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col px-4 py-6 gap-2 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  onClick={() => handleNav(to)}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-5 border-2 border-black",
                    "font-black text-xl uppercase tracking-tight text-left w-full",
                    "transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-neo translate-x-[2px] translate-y-[2px]"
                      : "bg-white text-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  )}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t-2 border-black px-4 py-4 flex flex-col gap-2">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-secondary/30">
                  <Avatar className="w-10 h-10 border-2 border-black rounded-none">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-black rounded-none">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-black text-sm uppercase truncate leading-none">
                      {user.user_metadata?.display_name || "Utente"}
                    </p>
                    <p className="text-[10px] text-black/50 font-bold truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleNav("/settings")}
                  className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white shadow-neo-sm font-black text-sm uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Impostazioni
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white shadow-neo-sm font-black text-sm uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Esci
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav("/auth")}
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-black bg-primary text-primary-foreground shadow-neo font-black text-base uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <LogIn className="w-5 h-5" />
                Accedi
              </button>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default NavMenu;
