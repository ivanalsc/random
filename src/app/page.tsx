"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import CreatePostForm from "@/components/CreatePostForm";
import PublicFeed from "@/components/PublicFeed";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Redirigir a /login si no hay sesión
      }
    };

    checkSession();
  }, [router]);


  return (
    <div>
    <h1 className="text-2xl font-bold mb-4">Crear un Nuevo Post</h1>
    <CreatePostForm />

    <h2 className="text-2xl font-bold mt-8 mb-4">Feed Público</h2>
    <PublicFeed />
  </div>
  );
}
