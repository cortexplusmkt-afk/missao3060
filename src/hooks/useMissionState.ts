import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DailyProgress, MissionState, NumericMetric } from '../types'

const STORAGE_KEY = 'missao-30-60:web:v1'

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyDay = (): DailyProgress => ({
  water: 0,
  steps: 0,
  reading: 0,
  cortex: 0,
  family: 0,
  workout: false,
  nutrition: false,
})

const createInitialState = (): MissionState => ({
  version: 1,
  startDate: formatDateKey(new Date()),
  streak: 1,
  days: {},
  weightHistory: [],
})

const loadState = (): MissionState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return createInitialState()
    const parsed = JSON.parse(stored) as Partial<MissionState>
    if (parsed.version !== 1 || !parsed.startDate || !parsed.days) return createInitialState()
    return {
      ...createInitialState(),
      ...parsed,
      streak: Math.max(1, Number(parsed.streak) || 1),
      weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
    }
  } catch {
    return createInitialState()
  }
}

const metricLimits: Record<NumericMetric, number> = {
  water: 4,
  steps: 50000,
  reading: 100,
  cortex: 240,
  family: 360,
}

export function useMissionState(now: Date) {
  const [state, setState] = useState<MissionState>(loadState)
  const dateKey = formatDateKey(now)
  const progress = state.days[dateKey] ?? emptyDay()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const updateDay = useCallback(
    (updater: (day: DailyProgress) => DailyProgress) => {
      setState((previous) => {
        const day = previous.days[dateKey] ?? emptyDay()
        return { ...previous, days: { ...previous.days, [dateKey]: updater(day) } }
      })
    },
    [dateKey],
  )

  const increment = useCallback(
    (metric: NumericMetric, amount: number) => {
      updateDay((day) => ({
        ...day,
        [metric]: Math.min(metricLimits[metric], Math.max(0, day[metric] + amount)),
      }))
    },
    [updateDay],
  )

  const setSteps = useCallback(
    (steps: number) => {
      updateDay((day) => ({ ...day, steps: Math.min(50000, Math.max(0, steps)) }))
    },
    [updateDay],
  )

  const toggle = useCallback(
    (metric: 'workout' | 'nutrition') => {
      updateDay((day) => ({ ...day, [metric]: !day[metric] }))
    },
    [updateDay],
  )

  const saveWeight = useCallback(
    (value: number) => {
      setState((previous) => ({
        ...previous,
        weightHistory: [
          ...previous.weightHistory.filter((entry) => entry.date !== dateKey),
          { date: dateKey, value },
        ].sort((a, b) => a.date.localeCompare(b.date)),
      }))
    },
    [dateKey],
  )

  const reset = useCallback(() => {
    const fresh = createInitialState()
    localStorage.removeItem(STORAGE_KEY)
    setState(fresh)
  }, [])

  const latestWeight = state.weightHistory.at(-1)
  const completedCount = useMemo(
    () =>
      [
        progress.water >= 4,
        progress.steps >= 12000,
        progress.reading >= 10,
        progress.cortex >= 60,
        progress.family >= 90,
        progress.workout,
        progress.nutrition,
      ].filter(Boolean).length,
    [progress],
  )
  const percentage = Math.round((completedCount / 7) * 100)

  const start = new Date(`${state.startDate}T00:00:00`)
  const current = new Date(`${dateKey}T00:00:00`)
  const dayNumber = Math.min(60, Math.max(1, Math.floor((current.getTime() - start.getTime()) / 86400000) + 1))

  return {
    state,
    progress,
    percentage,
    completedCount,
    dayNumber,
    latestWeight,
    increment,
    setSteps,
    toggle,
    saveWeight,
    reset,
  }
}
