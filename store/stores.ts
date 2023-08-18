import { persist } from 'zustand/middleware'
import { create } from 'zustand'

export interface dateStore {
  mode: string
  startDate: Date
  endDate: Date
  repsPerDay: number
  situpsPerDay: number
  weightLiftingPerDay: number
  refundResponse: Record<string, null>
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
  setRepsPerDay: (reps: number) => void
  setSitupsPerDay: (situps: number) => void
  setWeightLiftingPerDay: (weightLifting: number) => void
  setMode: (mode: string) => void
  setRefundResponse: (data: Record<string, null>) => void
  
}

const dateStore = persist(
  (set) => ({
    startDate: new Date(),
    mode: "push-ups",
    endDate: new Date(),
    repsPerDay: 0,
    situpsPerDay: 0,
    weightLiftingPerDay: 0,
    refundResponse: {},
    setStartDate: (date: Date) => set(() => ({ startDate: new Date (date.setHours(0, 0, 0)) })),
    setEndDate: (date: Date) => set(() => ({ endDate: new Date (date.setHours(0, 0, 0)) })),
    setRepsPerDay: (reps: number) => set(() => ({ repsPerDay: reps })),
    setSitupsPerDay: (situps: number) => set(() => ({ situpsPerDay: situps })),
    setWeightLiftingPerDay: (weightLifting: number) => set(() => ({ weightLiftingPerDay: weightLifting })),
    setRefundResponse: (data: Record<string, null>) => set(() => ({data: data})),
    setMode: (mode: string) => set(() => ({ mode: mode })),
  }),
  { name: 'my-date' }
)

export const useStore = create(dateStore)