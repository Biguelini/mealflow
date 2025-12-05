import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenericFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  error?: string | null;
  saveLabel?: string;
  cancelLabel?: string;
}

export function GenericFormDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  isSaving = false,
  error,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
}: GenericFormDialogProps) {
  const handleSave = async () => {
    try {
      await onSave();
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel?.();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {children}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            {cancelLabel}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Salvando..." : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
