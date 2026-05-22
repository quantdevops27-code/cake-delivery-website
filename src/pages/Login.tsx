import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  if (!kimiAuthUrl || !appID) {
    throw new Error("Kimi OAuth is not configured.");
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL("/api/oauth/authorize", kimiAuthUrl);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const hasKimiConfig = Boolean(
    import.meta.env.VITE_KIMI_AUTH_URL && import.meta.env.VITE_APP_ID,
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#6B3A3A]/10 flex items-center justify-center">
          <ChefHat className="h-8 w-8 text-[#6B3A3A]" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[#6B3A3A] mb-2">
          Welcome Back
        </h1>
        <p className="text-[#1A1A1A]/60 mb-8">
          Sign in to access your orders, saved addresses, and more.
        </p>
        <Button
          onClick={() => {
            window.location.href = getOAuthUrl();
          }}
          disabled={!hasKimiConfig}
          size="lg"
          className="w-full bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full"
        >
          Sign in with Kimi
        </Button>
        {!hasKimiConfig && (
          <p className="text-sm text-[#8A4A4A] mt-4">
            Kimi OAuth is not configured for this local preview.
          </p>
        )}
        <p className="text-xs text-[#1A1A1A]/40 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
