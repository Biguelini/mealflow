import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DataTableProps {
	columns: {
		key: string;
		label: string;
		className?: string;
	}[];
	data: any[];
	renderRow: (item: any) => ReactNode;
	loading?: boolean;
	error?: string;
	emptyMessage?: string;
	className?: string;
}

export function DataTable({
	columns,
	data,
	renderRow,
	loading,
	error,
	emptyMessage = "Nenhum item encontrado",
	className,
}: DataTableProps) {
	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="animate-pulse space-y-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-12 rounded bg-muted" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (data.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="py-8 text-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardContent className="pt-6">
				<div className="space-y-2">
					<div className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-md bg-muted px-4 py-2 text-xs font-medium text-muted-foreground gap-4">
						{columns.map((col) => (
							<div key={col.key} className={col.className}>
								{col.label}
							</div>
						))}
					</div>

					<div className="space-y-2">
						{data.map((item, index) => (
							<div key={index}>{renderRow(item)}</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
