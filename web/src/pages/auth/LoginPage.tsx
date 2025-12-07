import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation() as any;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const from = location.state?.from?.pathname ?? "/";

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await login(email, password);
			navigate(from, { replace: true });
		} catch (err: any) {
			setError(err.message ?? "Erro ao fazer login.");
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
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>

						<CardTitle className="text-2xl text-center font-bold text-foreground">
							Bem-vindo ao MealFlow
						</CardTitle>

						<CardDescription className="text-center text-sm">
							Acesse seu painel para planejar refeições saudáveis
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
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>

							<Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
								{loading ? "Entrando..." : "Entrar"}
							</Button>

							<p className="text-sm text-muted-foreground text-center pt-1">
								Não tem conta ainda?{" "}
								<Link
									to="/register"
									className="text-primary font-semibold underline-offset-4 hover:underline"
								>
									Criar conta
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
