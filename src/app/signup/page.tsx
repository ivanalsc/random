"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../utils/supabaseClient";
import GoogleSignupButton from "@/components/GoogleSignUpButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
    } catch (error) {
      console.error("Error registrando usuario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al registrarse.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-center">Crear cuenta</h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            Regístrate para comenzar a usar la aplicación
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                O regístrate con
              </span>
            </div>
          </div>

          <GoogleSignupButton />
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Button variant="link" className="px-0 font-normal h-auto" onClick={() => router.push("/login")}>
              Inicia sesión
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}