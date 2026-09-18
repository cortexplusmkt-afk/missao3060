import { CalendarDays, Crosshair, Flame, UserRound } from 'lucide-react'
import type { NavView } from '../types'

interface BottomNavProps {
  active: NavView
  onChange: (view: NavView) => void
}

const items = [
  { id: 'today' as const, label: 'Hoje', icon: Crosshair },
  { id: 'agenda' as const, label: 'Agenda', icon: CalendarDays },
  { id: 'streak' as const, label: 'Ofensiva', icon: Flame },
  { id: 'profile' as const, label: 'Perfil', icon: UserRound },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} className={active === id ? 'active' : ''} type="button" onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
          <Icon size={19} strokeWidth={active === id ? 2.2 : 1.6} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
