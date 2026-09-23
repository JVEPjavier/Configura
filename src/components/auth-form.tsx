"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function submit(formData: FormData) {
    setPending(true);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");
    const result = isRegister
      ? await authClient.signUp.email({ name, email, password, callbackURL: "/app" })
      : await authClient.signIn.email({ email, password, callbackURL: "/app" });
    setPending(false);
    if (result.error) {
      toast.error(result.error.message ?? "No pudimos completar la operación.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form action={submit} className="space-y-5">
      {isRegister && (
        <div className="space-y-2">
          <Label htmlFor="name">Tu nombre</Label>
          <Input id="name" name="name" required minLength={2} placeholder="Javier" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required placeholder="tu@correo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Un momento…" : isRegister ? "Crear mi cuenta" : "Entrar a Configura"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <Link
          className="font-semibold text-foreground underline"
          href={isRegister ? "/login" : "/registro"}
        >
          {isRegister ? "Inicia sesión" : "Crea una"}
        </Link>
      </p>
    </form>
  );
}
