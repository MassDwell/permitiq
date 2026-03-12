import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 24, text: "text-sm", gap: "gap-2" },
  md: { mark: 30, text: "text-base", gap: "gap-2.5" },
  lg: { mark: 42, text: "text-xl", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { mark, text, gap } = sizeConfig[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      <Image
        src="/logo-mark.jpg"
        alt="MeritLayer"
        width={mark}
        height={mark}
        className="shrink-0 rounded-md"
        priority
      />
      {showText && (
        <span className={cn("font-bold tracking-tight text-[#F1F5F9]", text)}>
          MeritLayer
        </span>
      )}
    </div>
  );
}
