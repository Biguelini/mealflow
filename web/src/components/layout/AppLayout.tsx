import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHouseholdContext } from "@/context/HouseholdContext";
import {
	LayoutDashboard,
	BookOpen,
	Archive,
	CalendarRange,
	ShoppingBasket,
	Leaf,
	Settings,
} from "lucide-react";

type NavItem = {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
	{ label: "Dashboard", to: "/app", icon: LayoutDashboard },
	{ label: "Ingredientes", to: "/app/ingredients", icon: Leaf },
	{ label: "Receitas", to: "/app/recipes", icon: BookOpen },
	{ label: "Despensa", to: "/app/pantry", icon: Archive },
	{ label: "Plano", to: "/app/meal-plan", icon: CalendarRange },
	{ label: "Lista de compras", to: "/app/shopping-lists", icon: ShoppingBasket },
	{ label: "Configurações", to: "/app/settings", icon: Settings },
];

export function AppLayout() {
	const { user, logout } = useAuth();
	const { currentHousehold, households, setCurrentHousehold, loading, isOwner } = useHouseholdContext();

	return (
		<div className="flex min-h-screen bg-background text-foreground">
			<aside className="hidden md:flex md:w-72 md:flex-col border-r border-border bg-card shadow-sm">
				<div className="flex h-20 items-center gap-3 border-b border-border px-6 bg-primary">
					<div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
						<svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<div>
						<div className="text-xl font-bold leading-tight text-white">
							MealFlow
						</div>
						<div className="text-sm text-white/90 font-medium">
							Saúde & Nutrição
						</div>
					</div>
				</div>

				<nav className="flex-1 space-y-1.5 px-4 py-6">
					{navItems.map((item) => (
						<SidebarLink key={item.to} item={item} />
					))}
				</nav>

				<div className="border-t border-border px-5 py-4 text-xs text-muted-foreground bg-muted/30">
					<div className="mb-1 text-foreground text-sm font-medium">
						{user?.name ?? "Usuário"}
					</div>

					<div className="mt-2">
						<label htmlFor="household-select" className="block mb-1 text-xs text-muted-foreground">
							Household:
						</label>
						<select
							id="household-select"
							value={currentHousehold?.id ?? ""}
							onChange={(e) => {
								const selectedId = Number(e.target.value);
								const household = households.find((h) => h.id === selectedId);
								if (household) {
									setCurrentHousehold(household);
								}
							}}
							disabled={loading || households.length === 0}
							className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{households.length === 0 ? (
								<option value="">Nenhuma household</option>
							) : (
								households.map((household) => (
									<option key={household.id} value={household.id}>
										{household.name}
									</option>
								))
							)}
						</select>

						{!isOwner && currentHousehold && (
							<div className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-400">
								<span className="font-medium">Modo visualização:</span> Apenas o dono pode editar
							</div>
						)}
					</div>

					<button
						onClick={logout}
						className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
					>
						Sair
					</button>
				</div>
			</aside>

			<div className="flex flex-1 flex-col">
				<header className="flex h-20 items-center justify-between border-b border-border bg-card px-8 shadow-sm">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md">
							{user?.name?.[0]?.toUpperCase() ?? "U"}
						</div>
						<div>
							<span className="text-base font-bold text-foreground">
								Olá, {user?.name ?? "Usuário"}!
							</span>
							<p className="text-sm text-muted-foreground">
								Pronto para planejar refeições saudáveis?
							</p>
						</div>
					</div>

					<div className="md:hidden">
						<div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</div>
					</div>
				</header>

				<main className="flex-1 p-8 bg-muted/20">
					<div className="mx-auto max-w-7xl">
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
					"flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
					isActive
						? "bg-primary text-white shadow-md"
						: "text-foreground/70 hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
				].join(" ")
			}
		>
			<Icon className="h-5 w-5 shrink-0" />
			<span className="truncate">{item.label}</span>
		</NavLink>
	);
}
