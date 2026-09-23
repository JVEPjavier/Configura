import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-14 block text-xl font-semibold tracking-tight">
        configura<span className="text-accent">.</span>
      </Link>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Empecemos por lo básico</p>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Crea tu cuenta.</h1>
      <AuthForm mode="register" />
    </div>
  );
}
