interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ values, width = 80, height = 24, className }: SparklineProps) {
  if (values.length < 2) {
    return <svg width={width} height={height} className={className} />;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pad = 2;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className={className}>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}
