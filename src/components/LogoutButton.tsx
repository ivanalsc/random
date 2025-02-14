"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/app/utils/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Redirigir al usuario a la página de inicio de sesión
      router.push("/login");

      // Mostrar notificación de éxito
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Cerrar Sesión
    </Button>
  );
}