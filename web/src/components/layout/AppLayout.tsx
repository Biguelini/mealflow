import { useState } from "react";
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
	LogOut,
	ChevronDown,
	Menu,
	X,
} from "lucide-react";

type NavItem = {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
	{ label: "Dashboard", to: "/", icon: LayoutDashboard },
	{ label: "Ingredientes", to: "/ingredients", icon: Leaf },
	{ label: "Receitas", to: "/recipes", icon: BookOpen },
	{ label: "Despensa", to: "/pantry", icon: Archive },
	{ label: "Plano", to: "/meal-plan", icon: CalendarRange },
	{ label: "Lista de compras", to: "/shopping-lists", icon: ShoppingBasket },
	{ label: "Configurações", to: "/settings", icon: Settings },
];

export function AppLayout() {
	const { user, logout } = useAuth();
	const { currentHousehold, households, setCurrentHousehold, loading, isOwner } = useHouseholdContext();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="flex h-full overflow-hidden bg-background text-foreground">
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			<aside className={`
				fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out
				md:static md:w-64 md:translate-x-0 md:flex
				${mobileMenuOpen ? 'flex translate-x-0' : '-translate-x-full'}
			`}>
				<div className="flex h-16 items-center justify-between gap-3 border-b border-border px-5">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
							<svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<div>
							<div className="text-lg font-bold text-foreground">MealFlow</div>
							<div className="text-xs text-muted-foreground">Planeje suas refeições</div>
						</div>
					</div>

					<button
						onClick={() => setMobileMenuOpen(false)}
						className="md:hidden h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-3 py-4">
					<div className="space-y-1">
						{navItems.map((item) => (
							<SidebarLink
								key={item.to}
								item={item}
								onClick={() => setMobileMenuOpen(false)}
							/>
						))}
					</div>
				</nav>

				<div className="border-t border-border px-4 py-4">
					<label className="block mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Household
					</label>
					<div className="relative">
						<select
							value={currentHousehold?.id ?? ""}
							onChange={(e) => {
								const selectedId = Number(e.target.value);
								const household = households.find((h) => h.id === selectedId);
								if (household) {
									setCurrentHousehold(household);
								}
							}}
							disabled={loading || households.length === 0}
							className="w-full appearance-none rounded-lg border border-border bg-background pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
						<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					</div>

					{!isOwner && currentHousehold && (
						<div className="mt-3 rounded-lg bg-accent border border-accent-foreground/10 px-3 py-2 text-xs text-accent-foreground">
							<span className="font-medium">Modo visualização:</span> Apenas o dono pode editar
						</div>
					)}
				</div>
			</aside>

			<div className="flex flex-1 flex-col overflow-hidden">
				<header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 shrink-0">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setMobileMenuOpen(true)}
							className="md:hidden h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
						>
							<Menu className="h-5 w-5" />
						</button>

						<div className="md:hidden flex items-center gap-2">
							<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
								<svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<span className="font-bold text-foreground">MealFlow</span>
						</div>
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
								{user?.name?.[0]?.toUpperCase() ?? "U"}
							</div>
							<span className="hidden sm:inline text-sm font-medium text-foreground">
								{user?.name ?? "Usuário"}
							</span>
						</div>
						<button
							onClick={logout}
							className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
							title="Sair"
						>
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Sair</span>
						</button>
					</div>
				</header>

				<main className="flex-1 overflow-auto bg-muted/30">
					<div className="min-h-full px-4 sm:px-6 lg:px-16 pt-6 sm:pt-8 pb-12 sm:pb-16">
						<div className="mx-auto max-w-7xl">
							<Outlet />
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
	const Icon = item.icon;

	return (
		<NavLink
			to={item.to}
			end={item.to === "/"}
			onClick={onClick}
			className={({ isActive }) =>
				[
					"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
					isActive
						? "bg-primary text-primary-foreground shadow-sm"
						: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
				].join(" ")
			}
		>
			<Icon className="h-5 w-5 shrink-0" />
			<span className="truncate">{item.label}</span>
		</NavLink>
	);
}
