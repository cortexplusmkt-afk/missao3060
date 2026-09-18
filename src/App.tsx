import { useEffect, useMemo, useState } from 'react'
import {
  Activity, BookOpen, BrainCircuit, Check, ChevronRight, Dumbbell, Footprints,
  Heart, MoonStar, Salad, Scale, ShieldCheck, Target, TimerReset, UsersRound, X, Zap,
} from 'lucide-react'
import { AxonPanel } from './components/AxonPanel'
import { BottomNav } from './components/BottomNav'
import { ProgressRing } from './components/ProgressRing'
import { WeightModal } from './components/WeightModal'
import { getMissionWindow, getRoutine, minutesFromTime } from './data/routine'
import { formatDateKey, useMissionState } from './hooks/useMissionState'
import type { MissionKind, NavView, ScheduledMission } from './types'

const kindIcons = {
  wake: Zap, walk: Footprints, work: Target, water: Activity, meal: Salad,
  reading: BookOpen, family: UsersRound, training: Dumbbell, cortex: BrainCircuit,
  closing: ShieldCheck, sleep: MoonStar, recharge: TimerReset,
} satisfies Record<MissionKind, typeof Activity>

const missionNames: Partial<Record<MissionKind, string>> = {
  training: 'TREINO', cortex: 'CORTEX+', family: 'FAMÍLIA', reading: 'LEITURA',
  water: 'HIDRATAÇÃO', meal: 'NUTRIÇÃO', work: 'TRABALHO RV', walk: 'MOVIMENTO',
}

const formatClock = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)

const shortDay = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date).replace('-feira', '').toUpperCase()

function App() {
  const [now, setNow] = useState(() => new Date())
  const [view, setView] = useState<NavView>('today')
  const [weightOpen, setWeightOpen] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [stepsDraft, setStepsDraft] = useState('')
  const mission = useMissionState(now)
  const routine = getRoutine(now)
  const missionWindow = useMemo(() => getMissionWindow(now, routine.missions), [now, routine])
  const isSunday = now.getDay() === 0

  useEffect(() => {
    const update = () => setNow(new Date())
    const delay = 60000 - (Date.now() % 60000)
    let interval: number | undefined
    const timeout = window.setTimeout(() => {
      update()
      interval = window.setInterval(update, 60000)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  const openSteps = () => {
    setStepsDraft(mission.progress.steps ? String(mission.progress.steps) : '')
    setStepsOpen(true)
  }

  const saveSteps = (event: React.FormEvent) => {
    event.preventDefault()
    mission.setSteps(Number(stepsDraft.replace(/\D/g, '')) || 0)
    setStepsOpen(false)
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {view === 'today' ? (
          <TodayView
            now={now}
            routineLabel={routine.systemLabel}
            current={missionWindow.current}
            next={missionWindow.next}
            mission={mission}
            isSunday={isSunday}
            onWeight={() => setWeightOpen(true)}
            onSteps={openSteps}
          />
        ) : (
          <>
            <CompactHeader now={now} dayNumber={mission.dayNumber} streak={mission.state.streak} />
            {view === 'agenda' ? <AgendaView now={now} /> : null}
            {view === 'streak' ? <StreakView dayNumber={mission.dayNumber} streak={mission.state.streak} days={mission.state.days} startDate={mission.state.startDate} /> : null}
            {view === 'profile' ? <ProfileView latestWeight={mission.latestWeight?.value} onReset={mission.reset} /> : null}
          </>
        )}
      </main>

      <BottomNav active={view} onChange={setView} />
      <WeightModal open={weightOpen} currentWeight={mission.latestWeight?.value} onClose={() => setWeightOpen(false)} onSave={mission.saveWeight} />
      {stepsOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setStepsOpen(false) }}>
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="steps-title">
            <button className="modal-close" type="button" onClick={() => setStepsOpen(false)} aria-label="Fechar"><X size={20} /></button>
            <span className="modal-icon"><Footprints size={22} /></span>
            <p className="eyebrow">MOVIMENTO</p>
            <h2 id="steps-title">Informar passos</h2>
            <p className="modal-help">Use o total mostrado no celular ou relógio.</p>
            <form onSubmit={saveSteps}>
              <label className="weight-input"><span className="sr-only">Quantidade de passos</span><input autoFocus inputMode="numeric" value={stepsDraft} onChange={(event) => setStepsDraft(event.target.value)} placeholder="12000" /><span>passos</span></label>
              <button className="primary-button" type="submit">ATUALIZAR PASSOS</button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}

type MissionHook = ReturnType<typeof useMissionState>

function CompactHeader({ now, dayNumber, streak }: { now: Date; dayNumber: number; streak: number }) {
  return (
    <header className="compact-header">
      <div><span>MISSÃO</span><strong>30—60</strong></div>
      <p>{shortDay(now)} // DIA {String(dayNumber).padStart(2, '0')}</p>
      <div className="compact-streak"><strong>🔥 {String(streak).padStart(2, '0')}</strong><span>OFENSIVA</span></div>
    </header>
  )
}

interface TodayViewProps {
  now: Date
  routineLabel?: string
  current: ScheduledMission
  next?: ScheduledMission
  mission: MissionHook
  isSunday: boolean
  onWeight: () => void
  onSteps: () => void
}

function TodayView({ now, routineLabel, current, next, mission, isSunday, onWeight, onSteps }: TodayViewProps) {
  const CurrentIcon = kindIcons[current.kind]
  const missionComplete = isCurrentMissionComplete(current.kind, mission)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const delayed = !missionComplete && minutesNow - minutesFromTime(current.time) >= 45
  const currentAction = getCurrentAction(current.kind, mission, onSteps)
  const workoutLabel = isSunday ? 'MOVIMENTO' : now.getDay() === 3 ? 'CARDIO' : 'TREINO'
  const currentTitle = missionNames[current.kind] ?? current.title.toUpperCase()
  const currentSpec = current.kind === 'training' ? `${current.title.toUpperCase()} / 60 MIN` : (current.detail ?? 'PROTOCOLO EM EXECUÇÃO').toUpperCase()

  return (
    <div className="today-view">
      <section className="hero-system">
        <header className="hero-header">
          <div className="hero-brand"><h1>MISSÃO <span>30—60</span></h1><p>{shortDay(now)} // DIA {String(mission.dayNumber).padStart(2, '0')} DE 60</p></div>
          <div className="hero-streak"><strong>🔥 {String(mission.state.streak).padStart(2, '0')}</strong><span>OFENSIVA</span></div>
        </header>
        <div className="hero-instrument">
          <ProgressRing percentage={mission.percentage} completed={mission.completedCount} total={7} />
          <time className="live-clock">{formatClock(now)} <span>LOCAL</span></time>
        </div>
        {routineLabel ? <div className="recharge-banner"><TimerReset size={14} /> RECARGA DO SISTEMA</div> : null}
      </section>

      <section className={`current-mission ${delayed ? 'is-delayed' : ''} ${missionComplete ? 'is-complete' : ''}`}>
        <div className="mission-state"><span><i /> {missionComplete ? 'CONCLUÍDA' : delayed ? 'PENDENTE' : 'AGORA'}</span><time>// {current.time}</time></div>
        <div className="mission-symbol" aria-hidden="true"><CurrentIcon size={25} strokeWidth={1.5} /></div>
        <h2>{currentTitle}</h2>
        <p>{currentSpec}</p>
        {currentAction ? (
          <button className="mission-command" type="button" onClick={currentAction}>{missionComplete ? <><Check size={16} /> MISSÃO CONCLUÍDA</> : '[ CONCLUIR MISSÃO ]'}</button>
        ) : <div className="mission-active-line"><span /> MISSÃO EM CURSO</div>}
      </section>

      <section className="next-mission" aria-label="Próxima missão">
        <span>PRÓXIMA</span><strong>{next ? `${next.time} — ${next.title.toUpperCase()}` : 'CICLO DIÁRIO ENCERRADO'}</strong><ChevronRight size={17} />
      </section>

      <section className="quick-status" aria-label="Status rápido">
        <button type="button" onClick={() => mission.increment('water', 1)}><span>ÁGUA</span><strong>{mission.progress.water} <em>/ 4</em></strong><small>TOQUE +1</small></button>
        <button type="button" onClick={onSteps}><span>PASSOS</span><strong>{mission.progress.steps.toLocaleString('pt-BR')}</strong><small>ATUALIZAR</small></button>
        <button type="button" onClick={() => mission.increment('reading', 1)}><span>LEITURA</span><strong>{mission.progress.reading} <em>/ 10</em></strong><small>TOQUE +1</small></button>
      </section>

      <section className="operations" aria-label="Controles do protocolo">
        <div className="operations-label"><span>PROTOCOLOS</span><small>{mission.completedCount} / 7 SINCRONIZADOS</small></div>
        <div className="operation-row">
          <div><BrainCircuit size={17} /><span><small>CORTEX+</small><strong>{mission.progress.cortex} / 60 MIN</strong></span></div>
          <button type="button" onClick={() => mission.increment('cortex', 15)}>+15 MIN</button>
        </div>
        <div className="operation-row">
          <div><Heart size={17} /><span><small>FAMÍLIA</small><strong>{mission.progress.family} / 90 MIN</strong></span></div>
          <button type="button" onClick={() => mission.increment('family', 15)}>+15 MIN</button>
        </div>
        <button className="operation-row operation-link" type="button" onClick={onWeight}>
          <div><Scale size={17} /><span><small>PESO · DURANTE A CAMINHADA</small><strong>{mission.latestWeight ? `${mission.latestWeight.value.toFixed(1).replace('.', ',')} KG` : 'NÃO REGISTRADO'}</strong></span></div><ChevronRight size={17} />
        </button>
        <div className="operation-checks">
          <button className={mission.progress.workout ? 'complete' : ''} type="button" onClick={() => mission.toggle('workout')}><Dumbbell size={16} /><span>{workoutLabel}</span>{mission.progress.workout ? <Check size={15} /> : <i />}</button>
          <button className={mission.progress.nutrition ? 'complete' : ''} type="button" onClick={() => mission.toggle('nutrition')}><Salad size={16} /><span>NUTRIÇÃO</span>{mission.progress.nutrition ? <Check size={15} /> : <i />}</button>
        </div>
      </section>

      <AxonPanel now={now} progress={mission.progress} percentage={mission.percentage} isSunday={isSunday} />
    </div>
  )
}

function isCurrentMissionComplete(kind: MissionKind, mission: MissionHook) {
  if (kind === 'water') return mission.progress.water >= 4
  if (kind === 'walk') return mission.progress.steps >= 12000
  if (kind === 'reading') return mission.progress.reading >= 10
  if (kind === 'cortex') return mission.progress.cortex >= 60
  if (kind === 'family') return mission.progress.family >= 90
  if (kind === 'training') return mission.progress.workout
  if (kind === 'meal') return mission.progress.nutrition
  return false
}

function getCurrentAction(kind: MissionKind, mission: MissionHook, onSteps: () => void) {
  if (kind === 'water') return () => mission.increment('water', 1)
  if (kind === 'walk') return onSteps
  if (kind === 'reading') return () => mission.increment('reading', 1)
  if (kind === 'cortex') return () => mission.increment('cortex', 15)
  if (kind === 'family') return () => mission.increment('family', 15)
  if (kind === 'training') return () => mission.toggle('workout')
  if (kind === 'meal') return () => mission.toggle('nutrition')
  return undefined
}

function AgendaView({ now }: { now: Date }) {
  const routine = getRoutine(now)
  const window = getMissionWindow(now, routine.missions)
  return (
    <section className="inner-view agenda-view">
      <div className="inner-title"><p className="eyebrow">ROTA DO DIA</p><h2>Agenda operacional</h2><span>{routine.missions.length} checkpoints</span></div>
      <ol className="timeline">{routine.missions.map((item) => { const Icon = kindIcons[item.kind]; const isCurrent = item === window.current; return <li key={`${item.time}-${item.title}`} className={isCurrent ? 'current' : ''}><time>{item.time}</time><span className="timeline-node"><Icon size={16} /></span><div><strong>{item.title}</strong>{item.detail ? <small>{item.detail}</small> : null}</div>{isCurrent ? <em>AGORA</em> : null}</li> })}</ol>
    </section>
  )
}

interface StreakViewProps { dayNumber: number; streak: number; days: MissionHook['state']['days']; startDate: string }

function StreakView({ dayNumber, streak, days, startDate }: StreakViewProps) {
  const cells = Array.from({ length: 60 }, (_, index) => {
    const date = new Date(`${startDate}T00:00:00`); date.setDate(date.getDate() + index)
    const day = days[formatDateKey(date)]
    const done = day ? [day.water >= 4, day.steps >= 12000, day.reading >= 10, day.cortex >= 60, day.family >= 90, day.workout, day.nutrition].every(Boolean) : false
    return { number: index + 1, done }
  })
  return (
    <section className="inner-view streak-view"><div className="inner-title"><p className="eyebrow">CONTINUIDADE</p><h2>Ofensiva 30—60</h2><span>Disciplina visível</span></div>
      <div className="streak-hero"><span>🔥</span><div><small>OFENSIVA ATUAL</small><strong>{streak} DIA{streak === 1 ? '' : 'S'}</strong></div></div>
      <div className="days-grid" aria-label="Calendário de 60 dias">{cells.map((cell) => <span key={cell.number} className={`${cell.done ? 'done' : ''}${cell.number === dayNumber ? ' current' : ''}`}>{cell.done ? <Check size={13} /> : cell.number}</span>)}</div>
      <div className="calendar-legend"><span><i className="legend-current" />Hoje</span><span><i className="legend-done" />Protocolo completo</span></div>
    </section>
  )
}

function ProfileView({ latestWeight, onReset }: { latestWeight?: number; onReset: () => void }) {
  const parameters = [['Peso inicial', '100 kg'], ['Peso atual', latestWeight ? `${latestWeight.toFixed(1).replace('.', ',')} kg` : 'Não registrado'], ['Altura', '1,67 m'], ['Água', '3,2 L · 4 garrafas'], ['Passos', '12.000 / dia'], ['Leitura', '10 páginas / dia']]
  return (
    <section className="inner-view profile-view"><div className="inner-title"><p className="eyebrow">CONFIGURAÇÃO</p><h2>Parâmetros da missão</h2><span>Perfil operacional</span></div>
      <div className="profile-avatar"><span><Target size={28} /></span><div><small>OPERADOR</small><strong>MISSÃO 30—60</strong></div></div>
      <dl>{parameters.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <button className="reset-button" type="button" onClick={() => { if (window.confirm('Resetar todo o progresso e o histórico de peso deste dispositivo?')) onReset() }}><TimerReset size={17} /> Resetar dados de teste</button>
      <p className="storage-note"><ShieldCheck size={14} /> Dados armazenados somente neste navegador.</p>
    </section>
  )
}

export default App
