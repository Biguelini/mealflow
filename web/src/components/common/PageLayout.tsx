import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="flex-1 min-w-0">
				<h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
					{title}
				</h1>

				{description && (
					<p className="mt-1 sm:mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
				)}
			</div>

			{action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
		</div>
	);
}

interface PageContainerProps {
	children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
	return <div className="space-y-5 h-full flex flex-col">{children}</div>;
}

interface ErrorMessageProps {
	message: string;
	onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
	return (
		<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
			<div className="flex items-start justify-between gap-3">
				<p className="font-medium leading-relaxed">{message}</p>

				{onDismiss && (
					<button
						onClick={onDismiss}
						className="text-destructive/60 hover:text-destructive transition-colors rounded p-0.5 hover:bg-destructive/10"
					>
						✕
					</button>
				)}
			</div>
		</div>
	);
}

interface LoadingStateProps {
	message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center justify-center gap-3 py-8">
					<Loader2 className="h-5 w-5 animate-spin text-primary" />

					<span className="text-sm font-medium text-muted-foreground">{message}</span>
				</div>
			</CardContent>
		</Card>
	);
}

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
	icon?: ReactNode;
}

export function EmptyState({
	title,
	description,
	action,
	icon,
}: EmptyStateProps) {
	return (
		<Card className="border-dashed">
			<CardContent className="pt-6">
				<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
					{icon && <div className="text-4xl text-muted-foreground/50">{icon}</div>}
					<div className="max-w-sm">
						<p className="text-base font-semibold text-foreground">{title}</p>

						{description && (
							<p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
						)}
					</div>

					{action && <div className="mt-2">{action}</div>}
				</div>
			</CardContent>
		</Card>
	);
}
