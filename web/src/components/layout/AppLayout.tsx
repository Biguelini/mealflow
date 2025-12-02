import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold tracking-tight">MealFlow</h1>
          <p className="text-xs text-muted-foreground">
            Planejamento de refeições
          </p>
        </div>

        <nav className="p-4 text-sm space-y-2 text-muted-foreground">
          <div className="cursor-pointer hover:text-foreground">Dashboard</div>
          <div className="cursor-pointer hover:text-foreground">Receitas</div>
          <div className="cursor-pointer hover:text-foreground">Despensa</div>
          <div className="cursor-pointer hover:text-foreground">
            Plano semanal
          </div>
          <div className="cursor-pointer hover:text-foreground">
            Lista de compras
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 border-b bg-card">
          <span className="text-sm text-muted-foreground">
            Bem-vindo(a) à sua cozinha organizada
          </span>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          )}
        </header>

        <section className="flex-1 p-4 bg-background">{children}</section>
      </main>
    </div>
  );
}
