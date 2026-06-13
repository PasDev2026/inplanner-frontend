type CircularProgressProps = {
  percentage: number
  size?: 'sm' | 'md'
}

const sizeConfig = {
  sm: { dimension: 28, stroke: 3, fontSize: 'text-[8px]' },
  md: { dimension: 44, stroke: 4, fontSize: 'text-xs' },
}

function colorClass(pct: number): string {
  if (pct < 30) return 'stroke-red-500'
  if (pct < 70) return 'stroke-amber-500'
  return 'stroke-green-500'
}

export default function CircularProgress({ percentage, size = 'md' }: CircularProgressProps) {
  const cfg = sizeConfig[size]
  const r = (cfg.dimension - cfg.stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: cfg.dimension, height: cfg.dimension }}>
      <svg width={cfg.dimension} height={cfg.dimension} className="-rotate-90">
        <circle
          cx={cfg.dimension / 2}
          cy={cfg.dimension / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={cfg.stroke}
          className="text-gray-200"
        />
        <circle
          cx={cfg.dimension / 2}
          cy={cfg.dimension / 2}
          r={r}
          fill="none"
          strokeWidth={cfg.stroke}
          strokeLinecap="round"
          className={`transition-all duration-500 ${colorClass(percentage)}`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={`absolute font-semibold text-gray-700 ${cfg.fontSize}`}>
        {percentage}%
      </span>
    </div>
  )
}
