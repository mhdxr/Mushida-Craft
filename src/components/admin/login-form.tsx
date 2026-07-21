"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message || "Login gagal.");
        return;
      }
      // Cookie sesi admin sudah di-set oleh API route (HTTP-only).
      router.replace("/admin/dashboard");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
  };

  return (
    <div className="w-full space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke toko
      </Link>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-border/50 bg-white p-8 shadow-sm"
        noValidate
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush-50 text-primary ring-1 ring-primary/10">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-muted-foreground">
              Masuk untuk mengelola produk & testimoni.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 p-3 text-center text-xs text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full tracking-wide" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memeriksa...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>
    </div>
  );
}
