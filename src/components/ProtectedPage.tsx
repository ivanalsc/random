"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { ReactNode } from "react";

interface ProtectedPageProps {
    children: ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return <div>Cargando...</div>;
    if (!user) {
        router.push("/login");
        return null;
    }

    return <div>Contenido protegido</div>;
    if (user) {
        return <div>{children}</div>;
    }
}