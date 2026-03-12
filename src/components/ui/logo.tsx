import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 28, text: "text-base", gap: "gap-2" },
  md: { mark: 36, text: "text-xl", gap: "gap-2.5" },
  lg: { mark: 48, text: "text-2xl", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { mark, text, gap } = sizeConfig[size];
  const fontSize = Math.round(mark * 0.5);
  const rx = Math.round(mark * 0.25);

  return (
    <div className={cn("flex items-center", gap, className)}>
      {/* eslint-disable-next-line react/no-danger */}
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="ml-grad"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx={rx} fill="url(#ml-grad)" />
        <text
          x="20"
          y="28"
          textAnchor="middle"
          fill="white"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize={fontSize}
        >
          M
        </text>
      </svg>
      {showText && (
        <span className={cn("font-semibold text-foreground", text)}>
          MeritLayer
        </span>
      )}
    </div>
  );
}
