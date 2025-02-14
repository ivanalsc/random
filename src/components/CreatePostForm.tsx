"use client"; // Necesario para usar hooks en Next.js 13+

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabaseClient";

type FormValues = {
  type: "book" | "series" | "music";
  title: string;
  description: string;
  image: FileList;
  isPublic: boolean;
};

export default function CreatePostForm() {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      // Obtener el usuario autenticado
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        throw new Error("Usuario no autenticado");
      }

      const user_id = userData.user.id;
      const user_email = userData.user.email;

      console.log("User ID:", user_id); // Depuración

      // Verificar si el usuario existe en la tabla `users`
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .single();

      console.log("Existing User:", existingUser); // Depuración
      console.log("User Error:", userError); // Depuración

      if (userError || !existingUser) {
        // Si el usuario no existe, crearlo
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user_id,
            email: user_email,
            username: user_email?.split("@")[0], // Generar un nombre de usuario a partir del correo
          },
        ]);

        if (insertError) throw insertError;
      }

      // Subir la imagen a Supabase Storage
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

      // Insertar el post en la tabla 'posts'
      const { error } = await supabase.from("posts").insert([
        {
          type: data.type,
          title: data.title,
          description: data.description,
          image_url: imageUrl,
          is_public: data.isPublic,
          user_id: user_id, // Usar el user_id válido
        },
      ]);

      if (error) throw error;

      // Mostrar notificación de éxito
      toast({
        title: "Post creado",
        description: "Tu post ha sido registrado exitosamente.",
      });

      // Reiniciar el formulario
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Tipo</Label>
        <select
          {...register("type", { required: true })}
          className="block w-full p-2 border rounded"
        >
          <option value="book">Libro</option>
          <option value="series">Serie</option>
          <option value="music">Música</option>
        </select>
      </div>

      <div>
        <Label>Título</Label>
        <Input
          {...register("title", { required: true })}
          placeholder="Título del post"
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          {...register("description")}
          placeholder="Descripción del post"
        />
      </div>

      <div>
        <Label>Imagen</Label>
        <Input
          type="file"
          {...register("image")}
          accept="image/*"
        />
      </div>

      <div>
        <Label>
          <input
            type="checkbox"
            {...register("isPublic")}
            className="mr-2"
          />
          ¿Post público?
        </Label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creando..." : "Crear Post"}
      </Button>
    </form>
  );
}