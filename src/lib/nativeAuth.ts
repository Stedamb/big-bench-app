import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";

// Deep-link scheme registered in android/app/src/main/AndroidManifest.xml.
// Must also be listed under Auth → URL Configuration → Redirect URLs in the
// Supabase dashboard.
export const NATIVE_AUTH_REDIRECT = "app.bigbench://auth-callback";

export const isNativeApp = () => Capacitor.isNativePlatform();

// OAuth inside a WebView is blocked by Google, so on native we open the
// system browser (Custom Tab) and return via deep link with a PKCE code.
export const signInWithGoogleNative = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: NATIVE_AUTH_REDIRECT,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  await Browser.open({ url: data.url });
};

// Mounted once at app level: catches the auth-callback deep link, exchanges
// the code for a session, and closes the Custom Tab.
export const useNativeAuthCallback = () => {
  useEffect(() => {
    if (!isNativeApp()) return;

    const sub = CapApp.addListener("appUrlOpen", async ({ url }) => {
      if (!url.startsWith(NATIVE_AUTH_REDIRECT)) return;
      try {
        const code = new URL(url).searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } finally {
        // Best-effort: not all Android browsers support programmatic close.
        Browser.close().catch(() => {});
      }
    });

    return () => {
      sub.then((s) => s.remove());
    };
  }, []);
};
