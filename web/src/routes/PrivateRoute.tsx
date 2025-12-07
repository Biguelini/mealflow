import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type PrivateRouteProps = {
	children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<span className="text-sm text-muted-foreground">Carregando...</span>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
}
