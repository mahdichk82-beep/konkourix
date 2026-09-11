export type WeekDay = {
  date: Date
  key: string
}

export const localDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addLocalDays = (date: Date, days: number): Date => {
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  shifted.setDate(shifted.getDate() + days)
  return shifted
}

export const saturdayWeekStart = (date: Date): Date => {
  const localDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return addLocalDays(localDay, -((localDay.getDay() + 1) % 7))
}

export const buildWeek = (start: Date): WeekDay[] => Array.from(
  { length: 7 },
  (_, index) => {
    const date = addLocalDays(start, index)
    return { date, key: localDateKey(date) }
  },
)
