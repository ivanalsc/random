"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/app/utils/supabaseClient";
import { useToast } from "@/hooks/use-toast";

type Post = {
  id: string;
  type: "book" | "series" | "music";
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  user_id: string;
  likes: number; // Nuevo campo para contar likes
  liked_by_user: boolean; // Nuevo campo para saber si el usuario actual dio like
};

export default function PublicFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        const { data, error } = await supabase
          .from("posts")
          .select(
            `*,
            likes (count),
            liked_by_user:likes (user_id)`
          )
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Datos obtenidos:", data); // Depuración

        // Formatear los datos para incluir el conteo de likes y si el usuario actual dio like
        const formattedPosts = data.map((post: any) => ({
          ...post,
          likes: post.likes[0]?.count || 0,
          liked_by_user: post.liked_by_user.some(
            (like: any) => like.user_id === user?.id
          ),
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los posts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  const handleLike = async (postId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para dar like.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar si el usuario ya dio like al post
      const { data: existingLike, error: likeError } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (likeError && likeError.code !== "PGRST116") {
        // PGRST116 es el código de error cuando no se encuentra ningún registro
        throw likeError;
      }

      if (existingLike) {
        // Si ya dio like, eliminarlo
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) throw deleteError;

        // Actualizar el estado local para reflejar que se quitó el like
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes - 1, liked_by_user: false }
              : post
          )
        );
      } else {
        // Si no dio like, agregarlo
        const { error: insertError } = await supabase.from("likes").insert([
          {
            post_id: postId,
            user_id: user.id,
          },
        ]);

        if (insertError) throw insertError;

        // Actualizar el estado local para reflejar que se dio like
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes + 1, liked_by_user: true }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error al manejar el like:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al manejar el like.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-center text-gray-600">No hay posts públicos para mostrar.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">{post.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">{post.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.description}</p>
                {post.image_url && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${post.image_url}`}
                    alt={post.title}
                    className="mt-4 rounded-lg w-full h-64 object-cover"
                  />
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant={post.liked_by_user ? "default" : "outline"}
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2"
                  >
                    {post.liked_by_user ? "Te gusta" : "Me gusta"} ({post.likes})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}