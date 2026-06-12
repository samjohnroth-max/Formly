interface DotGridProps {
  className?: string;
  dotColor?: string;
  dotOpacity?: number;
  spacing?: number;
  radius?: number;
}

export function DotGrid({
  className = "",
  dotColor = "#0F4C8F",
  dotOpacity = 0.05,
  spacing = 20,
  radius = 1.5,
}: DotGridProps) {
  const id = `dot-${spacing}-${radius}`.replace(/\./g, "_");
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r={radius} fill={dotColor} fillOpacity={dotOpacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
