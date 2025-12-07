import { type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	isLoading?: boolean;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Buscar...",
	isLoading,
}: SearchBarProps) {
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="pl-10"
				disabled={isLoading}
			/>
		</div>
	);
}

interface ListHeaderProps {
	title?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	actionButton?: {
		label: string;
		onClick: () => void;
		loading?: boolean;
	};
}

export function ListHeader({
	title,
	searchValue = "",
	onSearchChange,
	searchPlaceholder,
	actionButton,
}: ListHeaderProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex-1">
				{title && <h2 className="text-lg font-semibold">{title}</h2>}
			</div>

			<div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
				{onSearchChange !== undefined && (
					<SearchBar
						value={searchValue}
						onChange={onSearchChange}
						placeholder={searchPlaceholder}
					/>
				)}

				{actionButton && (
					<Button
						onClick={actionButton.onClick}
						disabled={actionButton.loading}
						className="w-full md:w-auto"
					>
						<Plus className="mr-2 h-4 w-4" />
						{actionButton.label}
					</Button>
				)}
			</div>
		</div>
	);
}

interface ListContainerProps {
	children: ReactNode;
}

export function ListContainer({ children }: ListContainerProps) {
	return <div className="space-y-4">{children}</div>;
}
