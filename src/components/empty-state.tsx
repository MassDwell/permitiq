import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.15)" }}
      >
        <span className="text-[#14B8A6] [&>svg]:h-8 [&>svg]:w-8">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-[#F1F5F9] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#475569] max-w-xs mb-6 leading-relaxed">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button onClick={action.onClick} className="bg-[#14B8A6] hover:bg-[#0D9488] text-white">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94A3B8" }}
              className="hover:bg-white/5"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
