import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Camera, Loader2, LogOut, User as UserIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Nome richiesto").max(100),
  username: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9_]*$/i, "Solo lettere, numeri e underscore")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  avatar_url: z.string().trim().url("URL non valido").max(500).optional().or(z.literal("")),
});

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) {
      // Without a user there is nothing to load; clear the spinner so the
      // redirect effect (above) can handle the unauthenticated state without
      // leaving the page stuck on the loading indicator.
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, username, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setDisplayName(data.display_name ?? "");
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatar_url ?? user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? "");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = profileSchema.safeParse({
      display_name: displayName,
      username,
      bio,
      avatar_url: avatarUrl,
    });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: parsed.data.display_name,
        username: parsed.data.username || null,
        bio: parsed.data.bio || null,
        avatar_url: parsed.data.avatar_url || null,
      });
    setSaving(false);
    if (error) {
      if (error.code === "23505") toast.error("Username già in uso");
      else toast.error(error.message);
      return;
    }
    toast.success("Profilo aggiornato");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Disconnesso");
    navigate("/", { replace: true });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'immagine deve essere inferiore a 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bench-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("bench-photos")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar caricato. Salva il profilo per confermare.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore durante il caricamento";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const initials = (displayName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="container max-w-2xl py-8 lg:py-12">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Profilo Utente
          </p>
          <h1 className="font-display text-4xl font-bold">Impostazioni</h1>
          <div className="editorial-rule-double my-4" />
        </div>

        <form onSubmit={handleSave} className="bg-card border border-border rounded-md p-6 space-y-6">
          {/* Avatar with hover upload */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-16 h-16 ring-2 ring-border">
                <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground font-display font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Carica foto profilo"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="font-display font-bold text-lg">{displayName || "Utente"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="editorial-rule" />

          <div className="space-y-1.5">
            <Label htmlFor="display_name" className="text-xs uppercase tracking-wider">
              Nome
            </Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Il tuo nome"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={40}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs uppercase tracking-wider">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Raccontaci qualcosa di te..."
              maxLength={500}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1 gap-2 h-11">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserIcon className="w-4 h-4" />}
              Salva modifiche
            </Button>
          </div>
        </form>

        <div className="mt-6 bg-card border border-border rounded-md p-6">
          <h2 className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Account
          </h2>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full gap-2 h-11"
          >
            <LogOut className="w-4 h-4" />
            Esci
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
