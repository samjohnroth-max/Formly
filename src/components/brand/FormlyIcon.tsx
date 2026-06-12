import { cn } from "@/lib/utils";

type Variant = "default" | "white" | "dark";

interface Props {
  size?: number;
  variant?: Variant;
  className?: string;
}

export function FormlyIcon({ size = 20, variant = "default", className }: Props) {
  if (variant === "dark") {
    // Uses currentColor so parent Tailwind dark: class controls the fill
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className={cn("shrink-0", className)}
      >
        <rect x="0" y="0" width="9" height="9" rx="2" fill="currentColor" fillOpacity={1} />
        <rect x="11" y="0" width="9" height="9" rx="2" fill="currentColor" fillOpacity={0.45} />
        <rect x="0" y="11" width="9" height="9" rx="2" fill="currentColor" fillOpacity={0.45} />
        <rect x="11" y="11" width="9" height="9" rx="2" fill="currentColor" fillOpacity={0.45} />
      </svg>
    );
  }

  const fill = variant === "white" ? "#FFFFFF" : "#0F4C8F";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect x="0" y="0" width="9" height="9" rx="2" fill={fill} fillOpacity={1} />
      <rect x="11" y="0" width="9" height="9" rx="2" fill={fill} fillOpacity={0.45} />
      <rect x="0" y="11" width="9" height="9" rx="2" fill={fill} fillOpacity={0.45} />
      <rect x="11" y="11" width="9" height="9" rx="2" fill={fill} fillOpacity={0.45} />
    </svg>
  );
}
