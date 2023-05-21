import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import { parseISO } from 'date-fns'
interface dateStore {
  startDate: Date
  endDate: Date
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
}

const dateStore = persist(
  (set) => ({
    startDate: new Date(),
    endDate: new Date(),
    setStartDate: (date: Date) => set(() => ({ startDate: date })),
    setEndDate: (date: Date) => set(() => ({ endDate: date }))
  }),
  { name: 'my-date' }
)

export const useStore = create(dateStore)