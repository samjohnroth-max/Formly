import { FormlyIcon } from "./FormlyIcon";
import { cn } from "@/lib/utils";

export type LogoSize = "sm" | "md" | "lg" | "xl";
export type LogoVariant = "default" | "white" | "dark";

interface Props {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
}

const ICON_PX: Record<LogoSize, number> = { sm: 14, md: 18, lg: 22, xl: 28 };

const TEXT_CLASS: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

const COLOR_CLASS: Record<LogoVariant, string> = {
  default: "text-[#0F4C8F]",
  white: "text-white",
  dark: "text-[#0F4C8F] dark:text-[#3B7DD8]",
};

const GAP: Record<LogoSize, string> = { sm: "gap-1.5", md: "gap-2", lg: "gap-2.5", xl: "gap-3" };

export function FormlyLogo({ size = "md", variant = "default", className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center select-none",
        GAP[size],
        COLOR_CLASS[variant],
        className
      )}
    >
      <FormlyIcon size={ICON_PX[size]} variant={variant} />
      <span className={cn("font-bold leading-none tracking-tight", TEXT_CLASS[size])}>
        Formly
      </span>
    </div>
  );
}
