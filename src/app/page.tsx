import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoProduct, demoStore } from "@/lib/demo";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          configura<span className="text-accent">.</span>
        </Link>
        <div className="flex gap-3">
          <Button nativeButton={false} variant="ghost" render={<Link href="/login" />}>
            Entrar
          </Button>
          <Button nativeButton={false} render={<Link href="/registro" />}>
            Crear cuenta <ArrowUpRight />
          </Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-7 w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
            <Sparkles /> Personalización sin código
          </Badge>
          <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.04em] text-balance md:text-7xl">
            Haz que cada producto se sienta <span className="text-accent">único.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
            Crea experiencias de compra personalizadas para tu marca, sin tocar una línea de código.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button nativeButton={false} size="lg" render={<Link href="/registro" />}>
              Empezar a configurar <ArrowUpRight />
            </Button>
            <Button
              nativeButton={false}
              size="lg"
              variant="outline"
              render={<Link href="#ejemplo" />}
            >
              Ver ejemplo
            </Button>
          </div>
          <ul className="mt-10 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-[#84997b]" /> Opciones, precios y reglas en un solo
              lugar
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-[#84997b]" /> Diseñado para marcas pequeñas con criterio
            </li>
          </ul>
        </div>
        <div
          id="ejemplo"
          className="relative rounded-3xl border border-border bg-card p-5 shadow-[0_24px_80px_rgba(28,28,27,.12)] md:p-8"
        >
          <div className="relative flex items-center justify-between border-b border-border pb-5">
            <div>
              <p className="text-sm text-muted-foreground">{demoStore.name}</p>
              <h2 className="mt-1 text-lg font-semibold">Tu producto, configurado.</h2>
            </div>
            <Badge variant="outline">Vista previa</Badge>
          </div>
          <div className="relative mt-7 aspect-square rounded-2xl bg-[#ddd1bf] p-7">
            <div className="absolute inset-x-12 bottom-8 top-14 rounded-b-[40%] rounded-t-[30%] border-[14px] border-[#f5efe5] bg-[#d96846] shadow-xl" />
            <div className="absolute right-[18%] top-[35%] size-20 rounded-full border-[13px] border-[#f5efe5]" />
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">{demoStore.description}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h3 className="text-xl font-semibold">{demoProduct.name}</h3>
              <span className="whitespace-nowrap font-medium">{demoProduct.price}</span>
            </div>
            <div className="mt-5 grid gap-2">
              {demoProduct.options.map((option) => (
                <div
                  key={option}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                  <span>{option}</span>
                  <span className="text-muted-foreground">Elegir</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
