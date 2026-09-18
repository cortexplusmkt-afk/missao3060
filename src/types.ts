export type NavView = 'today' | 'agenda' | 'streak' | 'profile'

export type MissionKind =
  | 'wake'
  | 'walk'
  | 'work'
  | 'water'
  | 'meal'
  | 'reading'
  | 'family'
  | 'training'
  | 'cortex'
  | 'closing'
  | 'sleep'
  | 'recharge'

export interface ScheduledMission {
  time: string
  title: string
  detail?: string
  kind: MissionKind
}

export interface DayRoutine {
  label: string
  systemLabel?: string
  missions: ScheduledMission[]
}

export interface DailyProgress {
  water: number
  steps: number
  reading: number
  cortex: number
  family: number
  workout: boolean
  nutrition: boolean
}

export interface WeightEntry {
  date: string
  value: number
}

export interface MissionState {
  version: 1
  startDate: string
  streak: number
  days: Record<string, DailyProgress>
  weightHistory: WeightEntry[]
}

export type NumericMetric = keyof Pick<
  DailyProgress,
  'water' | 'steps' | 'reading' | 'cortex' | 'family'
>
