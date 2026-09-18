import type { LucideIcon } from 'lucide-react'

interface MissionCardProps {
  icon: LucideIcon
  label: string
  value: string
  progress?: number
  actionLabel?: string
  onAction?: () => void
  onOpen?: () => void
  complete?: boolean
  warning?: boolean
}

export function MissionCard({
  icon: Icon,
  label,
  value,
  progress,
  actionLabel,
  onAction,
  onOpen,
  complete = false,
  warning = false,
}: MissionCardProps) {
  const Wrapper = onOpen ? 'button' : 'article'

  return (
    <Wrapper
      className={`mission-card${complete ? ' is-complete' : ''}${warning ? ' is-warning' : ''}`}
      {...(onOpen ? { type: 'button' as const, onClick: onOpen } : {})}
    >
      <span className="metric-icon" aria-hidden="true"><Icon size={19} strokeWidth={1.8} /></span>
      <span className="metric-content">
        <span className="metric-label">{label}</span>
        <strong>{value}</strong>
        {typeof progress === 'number' ? (
          <span className="metric-track" aria-hidden="true">
            <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </span>
        ) : null}
      </span>
      {onAction && actionLabel ? (
        <button
          className="metric-action"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onAction()
          }}
          aria-label={`${actionLabel} em ${label}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </Wrapper>
  )
}
