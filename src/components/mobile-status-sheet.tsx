"use client";

import { useState } from "react";
import { Check, Clock, AlertCircle, Circle, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceStatus =
  | "pending"
  | "in_progress"
  | "met"
  | "overdue"
  | "not_applicable";

interface MobileStatusSheetProps {
  itemId: string;
  description: string;
  currentStatus: ComplianceStatus;
  onStatusChange: (itemId: string, newStatus: ComplianceStatus) => void;
  onClose: () => void;
}

const statusOptions: Array<{
  status: ComplianceStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
  activeClassName: string;
}> = [
  {
    status: "met",
    label: "Done",
    icon: <Check className="w-5 h-5" />,
    className: "border-green-700 text-green-300 hover:bg-green-900/30",
    activeClassName: "bg-green-900/50 border-green-600",
  },
  {
    status: "in_progress",
    label: "Working on it",
    icon: <Clock className="w-5 h-5" />,
    className: "border-blue-700 text-blue-300 hover:bg-blue-900/30",
    activeClassName: "bg-blue-900/50 border-blue-600",
  },
  {
    status: "overdue",
    label: "Past due",
    icon: <AlertCircle className="w-5 h-5" />,
    className: "border-red-700 text-red-300 hover:bg-red-900/30",
    activeClassName: "bg-red-900/50 border-red-600",
  },
  {
    status: "pending",
    label: "Not started",
    icon: <Circle className="w-5 h-5" />,
    className: "border-slate-600 text-slate-300 hover:bg-slate-700/50",
    activeClassName: "bg-slate-700/50 border-slate-500",
  },
];

export function MobileStatusSheet({
  itemId,
  description,
  currentStatus,
  onStatusChange,
  onClose,
}: MobileStatusSheetProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleStatusSelect = (status: ComplianceStatus) => {
    onStatusChange(itemId, status);
    handleClose();
  };

  const handleSkip = () => {
    onStatusChange(itemId, "not_applicable");
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-50 transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-slate-800 rounded-t-2xl border-t border-slate-700 transition-transform duration-200 ease-out",
          isClosing ? "translate-y-full" : "translate-y-0"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white line-clamp-2">
              {description}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status options */}
        <div className="px-4 pb-4 space-y-2">
          {statusOptions.map((option) => (
            <button
              key={option.status}
              onClick={() => handleStatusSelect(option.status)}
              className={cn(
                "w-full h-[60px] flex items-center justify-center gap-3 rounded-xl border-2 font-medium transition-colors",
                option.className,
                currentStatus === option.status && option.activeClassName
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className={cn(
              "w-full py-3 text-sm text-slate-400 hover:text-slate-300 transition-colors",
              currentStatus === "not_applicable" && "text-slate-200"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <Minus className="w-4 h-4" />
              Skip this step
            </span>
          </button>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  );
}
