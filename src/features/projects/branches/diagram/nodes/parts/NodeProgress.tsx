type NodeProgressProps = {
  percentage: number
}

export default function NodeProgress({ percentage }: NodeProgressProps) {
  const value = Math.round(percentage)

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {value}%
      </span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-success transition-all"
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  )
}
