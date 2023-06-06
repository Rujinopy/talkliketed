import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import { parseISO } from 'date-fns'

interface dateStore {
  startDate: Date
  endDate: Date
  repsPerDay: number
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
  setRepsPerDay: (reps: number) => void
}

const dateStore = persist(
  (set) => ({
    startDate: new Date(),
    endDate: new Date(),
    repsPerDay: 0,
    setStartDate: (date: Date) => set(() => ({ startDate: new Date (date.setHours(0, 0, 0)) })),
    setEndDate: (date: Date) => set(() => ({ endDate: new Date (date.setHours(23, 59, 59)) })),
    setRepsPerDay: (reps: number) => set(() => ({ repsPerDay: reps })),
  }),
  { name: 'my-date' }
)

export const useStore = create(dateStore)