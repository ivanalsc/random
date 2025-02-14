import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Obtener la sesión del usuario
  const { data: { session } } = await supabase.auth.getSession();

  // Si no hay sesión y el usuario intenta acceder a una ruta protegida, redirigir a /login
  if (!session && request.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

// Configura las rutas a las que se aplicará el middleware
export const config = {
  matcher: ["/", "/home", "/dashboard"], // Rutas protegidas
};