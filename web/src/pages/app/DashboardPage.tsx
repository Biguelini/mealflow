import { useEffect, useMemo, useState } from "react";
import moment, { type Moment } from "moment";

import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { PageHeader, PageContainer, ErrorMessage, LoadingState } from "@/components/common";

moment.locale("pt-br");

type TopRecipe = {
	recipe_id: number;
	name: string;
	usage_count: number;
};

type TopIngredient = {
	ingredient_id: number;
	name: string;
	total_quantity: string | number;
};

type WeeklySummary = {
	planned_meals: number;
	completed_meals: number;
	top_recipes: TopRecipe[];
	top_ingredients: TopIngredient[];
	week_start: string;
	week_end: string;
};

export function DashboardPage() {
	const { currentHousehold } = useHouseholdContext();
	const [weekStart, setWeekStart] = useState<Moment>(() =>
		moment().startOf("isoWeek")
	);
	const [summary, setSummary] = useState<WeeklySummary | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const weekLabel = useMemo(() => {
		const year = weekStart.isoWeekYear();
		const week = String(weekStart.isoWeek()).padStart(2, "0");
		return `${year}-W${week}`;
	}, [weekStart]);

	const weekRangeLabel = useMemo(() => {
		const end = moment(weekStart).add(6, "day");
		return `${weekStart.format("DD [de] MMM.")} – ${end.format(
			"DD [de] MMM."
		)}`;
	}, [weekStart]);

	function goToOtherWeek(delta: number) {
		setWeekStart((prev) => moment(prev).add(delta, "week").startOf("isoWeek"));
	}

	async function loadSummary() {
		setLoading(true);
		setError(null);
		setSummary(null);

		try {
			const data = await apiFetch<WeeklySummary>(
				"/dashboard/weekly-summary",
				{
					method: "POST",
					data: {
						household_id: currentHousehold?.id,
						week: weekLabel,
					},
				}
			);
			setSummary(data);
		} catch (err: any) {
			console.error(err);
			setError(
				err.message ?? "Erro ao carregar dados do dashboard desta semana."
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadSummary();
	}, [weekLabel, currentHousehold?.id]);

	const planned = summary?.planned_meals ?? 0;
	const completed = summary?.completed_meals ?? 0;
	const completionPct =
		planned > 0 ? Math.round((completed / planned) * 100) : 0;

	const maxRecipeUsage = summary?.top_recipes?.[0]?.usage_count ?? 0;
	const maxIngredientUsage =
		summary?.top_ingredients?.[0]
			? Number(summary.top_ingredients[0].total_quantity)
			: 0;

	const isCurrentWeek = useMemo(() => {
		const now = moment().startOf("isoWeek");
		return weekStart.isSame(now, "day");
	}, [weekStart]);

	function goToCurrentWeek() {
		setWeekStart(moment().startOf("isoWeek"));
	}

	return (
		<PageContainer>
			<div className="flex flex-col gap-4">
				<PageHeader
					title="Dashboard"
					description="Visão geral das suas refeições planejadas e dos ingredientes mais usados."
				/>

				<div className="flex items-center justify-center sm:justify-end gap-2">
					{!isCurrentWeek && (
						<Button
							variant="outline"
							size="sm"
							onClick={goToCurrentWeek}
							className="text-xs"
						>
							<CalendarDays className="mr-1.5 h-3.5 w-3.5" />
							Hoje
						</Button>
					)}
					<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => goToOtherWeek(-1)}
							className="h-8 w-8"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div className="min-w-[180px] sm:min-w-[200px] text-center text-sm font-semibold">
							{weekRangeLabel}
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => goToOtherWeek(1)}
							className="h-8 w-8"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			{loading && (
				<LoadingState message="Carregando dados do dashboard..." />
			)}

			{!loading && (
				<>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm">Refeições planejadas</CardTitle>
								<CardDescription>Para a semana selecionada</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{planned}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm">Refeições realizadas</CardTitle>
								<CardDescription>
									Considerando dias até hoje
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{completed}</div>
								<div className="mt-2 h-2 rounded-full bg-muted">
									<div
										className="h-2 rounded-full bg-primary transition-all"
										style={{ width: `${Math.min(completionPct, 100)}%` }}
									/>
								</div>
								<p className="mt-1 text-xs text-muted-foreground">
									{completionPct}% das refeições planejadas já aconteceram.
								</p>
							</CardContent>
						</Card>

						<Card className="sm:col-span-2 lg:col-span-1">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm">Semana</CardTitle>
								<CardDescription>Resumo de período</CardDescription>
							</CardHeader>
							<CardContent>
								{summary ? (
									<div className="space-y-1 text-sm">
										<div>
											Início:{" "}
											<span className="font-medium">
												{moment(summary.week_start).format("DD/MM/YYYY")}
											</span>
										</div>
										<div>
											Fim:{" "}
											<span className="font-medium">
												{moment(summary.week_end).format("DD/MM/YYYY")}
											</span>
										</div>
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Nenhum dado carregado ainda.
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">
									Top 5 receitas mais usadas
								</CardTitle>
								<CardDescription>Na semana selecionada</CardDescription>
							</CardHeader>
							<CardContent>
								{summary && summary.top_recipes.length > 0 ? (
									<div className="space-y-2">
										{summary.top_recipes.map((r) => {
											const pct =
												maxRecipeUsage > 0
													? (r.usage_count / maxRecipeUsage) * 100
													: 0;
											return (
												<div key={r.recipe_id} className="space-y-1">
													<div className="flex items-center justify-between text-xs">
														<span className="truncate">{r.name}</span>
														<span className="text-muted-foreground">
															{r.usage_count}x
														</span>
													</div>
													<div className="h-2 rounded-full bg-muted">
														<div
															className="h-2 rounded-full bg-primary transition-all"
															style={{ width: `${pct || 5}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Nenhuma receita usada nesta semana.
									</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm">
									Ingredientes mais usados
								</CardTitle>
								<CardDescription>
									Soma aproximada das quantidades das receitas da semana
								</CardDescription>
							</CardHeader>
							<CardContent>
								{summary && summary.top_ingredients.length > 0 ? (
									<div className="space-y-2">
										{summary.top_ingredients.map((ing) => {
											const total = Number(ing.total_quantity);
											const pct =
												maxIngredientUsage > 0
													? (total / maxIngredientUsage) * 100
													: 0;

											return (
												<div key={ing.ingredient_id} className="space-y-1">
													<div className="flex items-center justify-between text-xs">
														<span className="truncate">{ing.name}</span>
														<span className="text-muted-foreground">
															{total.toLocaleString("pt-BR", {
																maximumFractionDigits: 1,
															})}
														</span>
													</div>
													<div className="h-2 rounded-full bg-muted">
														<div
															className="h-2 rounded-full bg-primary/80 transition-all"
															style={{ width: `${pct || 5}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Nenhum ingrediente calculado para esta semana.
									</p>
								)}
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</PageContainer>
	);
}
