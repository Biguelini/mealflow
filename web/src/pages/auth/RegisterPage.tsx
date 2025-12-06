import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-9 h-9 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-foreground">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Comece a organizar refeições saudáveis para sua casa
            </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 font-medium">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>

            <p className="text-sm text-muted-foreground text-center pt-1">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold underline-offset-4 hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
