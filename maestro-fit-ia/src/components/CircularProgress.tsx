'use client';

interface CircularProgressProps {
  value: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  goal,
  size = 140,
  strokeWidth = 12,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-stone-100 dark:stroke-stone-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-brand-600 transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
