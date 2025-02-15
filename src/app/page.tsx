"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import CreatePostForm from "@/components/CreatePostForm";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PublicFeed from "@/components/PublicFeed";
import MyPostsFeed from "@/components/MyPostsFeed";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Tabs defaultValue="post">
        <TabsList className="flex border-b">
          <TabsTrigger
            value="post"
            className="px-4 py-2 text-gray-600 hover:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
          >
            Nuevo Post
          </TabsTrigger>
          <TabsTrigger
            value="feed"
            className="px-4 py-2 text-gray-600 hover:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
          >
            Feed Público
          </TabsTrigger>
          <TabsTrigger
            value="my-posts"
            className="px-4 py-2 text-gray-600 hover:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
          >
            Mis posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="post">
          <h1 className="text-2xl font-bold mb-4">Crear un Nuevo Post</h1>
          <CreatePostForm />
        </TabsContent>

        <TabsContent value="feed">
          <h2 className="text-2xl font-bold mt-4 mb-4">Feed Público</h2>
          <PublicFeed />
        </TabsContent>

        <TabsContent value="my-posts">
          <h2 className="text-2xl font-bold mt-4 mb-4">Mis posts</h2>
          <MyPostsFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
