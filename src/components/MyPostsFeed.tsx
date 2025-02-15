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
  is_public: boolean;
  likes: number;
  liked_by_user: boolean;
};

export default function MyPostsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase
          .from("posts")
          .select(
            `*,
            likes (count),
            liked_by_user:likes (user_id)`
          )
          .eq("user_id", user.id) // Solo mis posts
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Formatear datos
        const formattedPosts = data.map((post: any) => ({
          ...post,
          likes: post.likes[0]?.count || 0,
          liked_by_user: post.liked_by_user.some(
            (like: any) => like.user_id === user.id
          ),
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching my posts:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus posts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [toast]);

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
          <p className="text-center text-gray-600">No has publicado nada aún.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">{post.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {post.type} {post.is_public ? "(Público)" : "(Privado)"}
                </CardDescription>
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
