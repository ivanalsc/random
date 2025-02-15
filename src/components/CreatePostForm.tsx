"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabaseClient";

type FormValues = {
  type: "book" | "series-movie" | "music";
  title: string;
  description: string;
  image: FileList;
  isPublic: boolean;
};

export default function CreatePostForm() {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        throw new Error("Usuario no autenticado");
      }

      const user_id = userData.user.id;
      const user_email = userData.user.email;

      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .single();

      if (userError || !existingUser) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user_id,
            email: user_email,
            username: user_email?.split("@")[0],
          },
        ]);

        if (insertError) throw insertError;
      }

      let imageUrl = "";
      if (data.image && data.image[0]) {
        const file = data.image[0];
        const filePath = `public/${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        imageUrl = uploadData.path;
      }

      const { error } = await supabase.from("posts").insert([
        {
          type: data.type,
          title: data.title,
          description: data.description,
          image_url: imageUrl,
          is_public: data.isPublic,
          user_id: user_id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Post creado",
        description: "Tu post ha sido registrado exitosamente.",
      });

      reset();
    } catch (error) {
      console.error("Error creando el post:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear el post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-center">Crear nuevo post</h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            Comparte tu contenido favorito con la comunidad
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de contenido</Label>
              <select
                {...register("type", { required: true })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background"
              >
                <option value="book">📚 Libro</option>
                <option value="series-movies">🎬 Serie o película</option>
                <option value="music">🎵 Música</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                {...register("title", { required: true })}
                placeholder="¿Qué quieres compartir?"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                {...register("description")}
                placeholder="Cuéntanos más sobre este contenido..."
                className="min-h-[120px] w-full"
              />
            </div>

            <div className="space-y-2">
      <Label>Imagen de portada</Label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
          >
            <span>Sube un archivo</span>
            <Input
              id="file-upload"
              type="file"
              className="sr-only"
              {...register("image")}
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          <p className="pl-1">o arrastra y suelta</p>
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-green-600">✅ Imagen cargada</p>
              <img
                src={imagePreview}
                alt="Previsualización"
                className="mt-2 max-w-xs h-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Visibilidad</Label>
                <p className="text-sm text-gray-500">
                  Determina quién puede ver tu post
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch {...register("isPublic")} />
                <Label>Público</Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creando post..." : "Publicar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}