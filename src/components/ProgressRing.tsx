interface ProgressRingProps {
  percentage: number
  completed: number
  total: number
}

export function ProgressRing({ percentage, completed, total }: ProgressRingProps) {
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const arc = circumference * 0.82
  const offset = arc * (1 - percentage / 100)

  return (
    <div className="progress-ring" aria-label={`${percentage}% das missões concluídas`}>
      <span className="hud-orbit hud-orbit-one" aria-hidden="true" />
      <span className="hud-orbit hud-orbit-two" aria-hidden="true" />
      <svg viewBox="0 0 200 200" role="img" aria-hidden="true">
        <circle className="ring-track" cx="100" cy="100" r={radius} strokeDasharray={`${arc} ${circumference}`} />
        <circle className="ring-value" cx="100" cy="100" r={radius} strokeDasharray={`${arc} ${circumference}`} strokeDashoffset={offset} />
      </svg>
      <div className="ring-copy">
        <strong>{percentage}<em>%</em></strong>
        <span>SISTEMA DO DIA</span>
        <small>{String(completed).padStart(2, '0')} / {String(total).padStart(2, '0')} MISSÕES</small>
      </div>
      <span className="hud-index hud-index-a" aria-hidden="true">01</span>
      <span className="hud-index hud-index-b" aria-hidden="true">60</span>
    </div>
  )
}
