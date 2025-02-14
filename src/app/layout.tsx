"use client"

import "./globals.css";
import { Inter } from "next/font/google";
import LogoutButton from "@/components/LogoutButton";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">BookFeed</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span>{user.email}</span>
              <LogoutButton />
            </div>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}