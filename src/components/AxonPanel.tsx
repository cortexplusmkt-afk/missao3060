import type { DailyProgress } from '../types'

interface AxonPanelProps {
  now: Date
  progress: DailyProgress
  percentage: number
  isSunday: boolean
}

const getMessage = (now: Date, progress: DailyProgress, percentage: number, isSunday: boolean) => {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (isSunday) return 'Hoje o objetivo é recarregar o sistema e preparar a próxima semana.'
  if (minutes >= 21 * 60 && percentage < 100) return 'Sua ofensiva está em risco. Feche as missões pendentes.'
  if (minutes >= 20 * 60 + 30 && progress.cortex === 0) return 'Sua empresa não vai construir a si mesma.'
  if (minutes >= 15 * 60 && progress.water < 2) return `Você está ${2 - progress.water} garrafa${progress.water === 1 ? '' : 's'} atrás do ritmo ideal.`
  if (minutes < 10 * 60) return 'O sistema está online. Execute a primeira missão.'
  if (percentage === 100) return 'Protocolo diário concluído. Ofensiva protegida.'
  return 'Ritmo nominal. Mantenha a execução da próxima missão.'
}

export function AxonPanel({ now, progress, percentage, isSunday }: AxonPanelProps) {
  return (
    <section className="axon-panel" aria-labelledby="axon-title">
      <div className="axon-core" aria-hidden="true"><i /><i /><span /></div>
      <div className="axon-copy">
        <div className="axon-status"><i /> AXON // ONLINE</div>
        <p id="axon-title">{getMessage(now, progress, percentage, isSunday)}</p>
      </div>
      <div className="axon-signal" aria-hidden="true"><i /><i /><i /><i /></div>
    </section>
  )
}
