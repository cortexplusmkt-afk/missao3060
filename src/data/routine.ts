import type { DayRoutine, ScheduledMission } from '../types'

const weekday = (trainingTitle: string): ScheduledMission[] => [
  { time: '05:00', title: 'Despertar', detail: 'Sistema online', kind: 'wake' },
  { time: '05:10', title: 'Caminhada', detail: 'Peso opcional na farmácia', kind: 'walk' },
  { time: '05:50', title: 'Higiene / presença', kind: 'wake' },
  { time: '07:12', title: 'Trabalho RV', detail: 'Bloco operacional', kind: 'work' },
  { time: '09:00', title: 'Checkpoint de água', kind: 'water' },
  { time: '11:30', title: 'Almoço', kind: 'meal' },
  { time: '11:50', title: 'Caminhada curta', kind: 'walk' },
  { time: '12:05', title: 'Leitura', detail: 'Dale Carnegie · 10 páginas', kind: 'reading' },
  { time: '12:30', title: 'Trabalho RV', detail: 'Segundo bloco', kind: 'work' },
  { time: '17:00', title: 'Fim do expediente', kind: 'closing' },
  { time: '17:30', title: 'Modo família', detail: '90 minutos de presença', kind: 'family' },
  { time: '19:00', title: trainingTitle, kind: 'training' },
  { time: '20:15', title: 'Jantar', kind: 'meal' },
  { time: '20:30', title: 'Cortex+', detail: '60 minutos de construção', kind: 'cortex' },
  { time: '21:30', title: 'Fechamento', detail: 'Revisar e proteger a ofensiva', kind: 'closing' },
  { time: '22:00', title: 'Dormir', kind: 'sleep' },
]

export const routines: Record<number, DayRoutine> = {
  0: {
    label: 'Domingo',
    systemLabel: 'Recarga do sistema',
    missions: [
      { time: '07:00', title: 'Despertar', kind: 'wake' },
      { time: '08:00', title: 'Família', detail: 'Presença sem pressa', kind: 'family' },
      { time: '09:30', title: 'Fé / igreja', kind: 'recharge' },
      { time: '11:30', title: 'Movimento leve', kind: 'walk' },
      { time: '16:00', title: 'Revisão semanal', detail: 'Peso e cintura', kind: 'recharge' },
      { time: '17:00', title: 'Preparar a base', detail: 'Alimentação, roupas e agenda', kind: 'meal' },
      { time: '18:30', title: 'Objetivos Cortex+', detail: 'Definir 3 objetivos da semana', kind: 'cortex' },
      { time: '21:30', title: 'Dormir cedo', kind: 'sleep' },
    ],
  },
  1: { label: 'Segunda-feira', missions: weekday('Musculação') },
  2: { label: 'Terça-feira', missions: weekday('Musculação') },
  3: { label: 'Quarta-feira', missions: weekday('Cardio / mobilidade') },
  4: { label: 'Quinta-feira', missions: weekday('Musculação') },
  5: { label: 'Sexta-feira', missions: weekday('Musculação') },
  6: {
    label: 'Sábado',
    missions: [
      { time: '06:00', title: 'Despertar', kind: 'wake' },
      { time: '06:15', title: 'Caminhada longa', kind: 'walk' },
      { time: '07:15', title: 'Café / família', kind: 'family' },
      { time: '09:00', title: 'Cortex+ profundo', detail: 'Bloco sem distrações', kind: 'cortex' },
      { time: '11:00', title: 'Família / livre', kind: 'family' },
      { time: '16:00', title: 'Atividade leve / lazer', kind: 'training' },
      { time: '21:30', title: 'Fechamento', kind: 'closing' },
      { time: '22:30', title: 'Dormir', kind: 'sleep' },
    ],
  },
}

export const getRoutine = (date: Date) => routines[date.getDay()]

export const minutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getMissionWindow = (date: Date, missions: ScheduledMission[]) => {
  const now = date.getHours() * 60 + date.getMinutes()
  let current = missions[0]
  let next: ScheduledMission | undefined

  for (const mission of missions) {
    if (minutesFromTime(mission.time) <= now) current = mission
    if (minutesFromTime(mission.time) > now) {
      next = mission
      break
    }
  }

  return { current, next }
}
