import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 26, text: "text-sm", gap: "gap-2" },
  md: { mark: 32, text: "text-base", gap: "gap-2.5" },
  lg: { mark: 44, text: "text-xl", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { mark, text, gap } = sizeConfig[size];
  const rx = Math.round(mark * 0.25);

  return (
    <div className={cn("flex items-center", gap, className)}>
      <svg width={mark} height={mark} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="ml-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx={rx} fill="url(#ml-grad)" />
        <path d="M8 22V10L13 18L16 13L19 18L24 10V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {showText && (
        <span className={cn("font-bold tracking-tight text-[#F1F5F9]", text)}>
          MeritLayer
        </span>
      )}
    </div>
  );
}
