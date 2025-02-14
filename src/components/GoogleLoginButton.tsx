"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabaseClient";

export default function GoogleLoginButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;

      // Redirigir al home después del login
      router.push("/");
    } catch (error) {
      console.error("Error iniciando sesión con Google:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión con Google.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleGoogleLogin} variant="outline">
      Iniciar Sesión con Google
    </Button>
  );
}