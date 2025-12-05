import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div className="flex-1">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="space-y-6">{children}</div>;
}

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-relaxed">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-destructive/60 hover:text-destructive transition-colors rounded-lg p-1 hover:bg-destructive/10"
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
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-base font-medium text-muted-foreground">{message}</span>
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
    <Card className="shadow-card border-2 border-dashed">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
          {icon && <div className="text-5xl text-muted-foreground/60">{icon}</div>}
          <div className="max-w-md">
            <p className="text-lg font-bold text-foreground">{title}</p>
            {description && (
              <p className="mt-2 text-base text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
