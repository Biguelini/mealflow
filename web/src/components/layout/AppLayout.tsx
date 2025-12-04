import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  CalendarRange,
  ShoppingBasket,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/app", icon: LayoutDashboard },
  { label: "Receitas", to: "/app/recipes", icon: BookOpen },
  { label: "Despensa", to: "/app/pantry", icon: Archive },
  { label: "Plano", to: "/app/meal-plan", icon: CalendarRange },
  { label: "Lista de compras", to: "/app/shopping-lists", icon: ShoppingBasket },
  { label: "Configurações", to: "/app/settings", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  const currentHouseholdName = "Minha casa";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            MF
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              MealFlow
            </div>
            <div className="text-xs text-muted-foreground">
              Planejamento de refeições
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div className="mb-1 text-foreground text-sm font-medium">
            {user?.name ?? "Usuário"}
          </div>
          <div className="truncate">Household: {currentHouseholdName}</div>
          <button
            onClick={logout}
            className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {currentHouseholdName}
            </span>
            <span className="text-sm font-medium">
              Olá, {user?.name ?? "Usuário"}
            </span>
          </div>

          <div className="md:hidden text-xs text-muted-foreground">
            Menu na lateral em telas maiores
          </div>
        </header>

        <main className="flex-1 p-4">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/app"}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
