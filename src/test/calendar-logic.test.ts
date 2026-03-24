import { describe, it, expect } from 'vitest'

// Pure date logic mirroring Calendar.tsx helpers

function getWeekDays(referenceDate: Date): Date[] {
  const d = new Date(referenceDate)
  const dow = d.getDay() // 0=Sun
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return day
  })
}

function getMonthData(referenceDate: Date): { date: Date; currentMonth: boolean }[][] {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // 0=Mon

  const cells: { date: Date; currentMonth: boolean }[] = []

  // Days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(firstDay)
    d.setDate(firstDay.getDate() - i - 1)
    cells.push({ date: d, currentMonth: false })
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), currentMonth: true })
  }
  // Fill to complete last row
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push({ date: next, currentMonth: false })
  }

  // Split into weeks
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function getRangeForWeek(days: Date[]): { start: string; end: string } {
  return { start: localDateStr(days[0]), end: localDateStr(days[6]) }
}

// Use local Date constructor (year, month-1, day) to avoid UTC timezone issues
const mar23 = new Date(2026, 2, 23) // Monday
const mar25 = new Date(2026, 2, 25) // Wednesday
const mar29 = new Date(2026, 2, 29) // Sunday

function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('Week view — getWeekDays', () => {
  it('returns 7 days starting on Monday', () => {
    const days = getWeekDays(mar23)
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1) // Monday
    expect(days[6].getDay()).toBe(0) // Sunday
  })

  it('anchors correctly from a mid-week date', () => {
    const days = getWeekDays(mar25)
    expect(localDateStr(days[0])).toBe('2026-03-23')
    expect(localDateStr(days[6])).toBe('2026-03-29')
  })

  it('anchors correctly from Sunday', () => {
    const days = getWeekDays(mar29)
    expect(localDateStr(days[0])).toBe('2026-03-23')
  })

  it('consecutive days differ by exactly 1 day', () => {
    const days = getWeekDays(mar23)
    for (let i = 1; i < days.length; i++) {
      const diff = days[i].getTime() - days[i - 1].getTime()
      expect(diff).toBe(24 * 60 * 60 * 1000)
    }
  })
})

describe('Month view — getMonthData', () => {
  it('returns rows of 7 cells', () => {
    const weeks = getMonthData(new Date(2026, 2, 1)) // March 2026
    for (const week of weeks) {
      expect(week).toHaveLength(7)
    }
  })

  it('all 31 days of March 2026 are present as currentMonth', () => {
    const weeks = getMonthData(new Date(2026, 2, 1))
    const marchDays = weeks.flat().filter(c => c.currentMonth)
    expect(marchDays).toHaveLength(31)
  })

  it('first day of month is in the correct weekday column', () => {
    // March 1 2026 is a Sunday → column index 6 (Mon=0 … Sun=6)
    const weeks = getMonthData(new Date(2026, 2, 1))
    const firstRow = weeks[0]
    const marchFirst = firstRow.find(c => c.currentMonth && c.date.getDate() === 1)!
    expect(firstRow.indexOf(marchFirst)).toBe(6)
  })

  it('total cell count is a multiple of 7', () => {
    const weeks = getMonthData(new Date(2026, 1, 1)) // February 2026
    expect(weeks.flat().length % 7).toBe(0)
  })
})

describe('Range computation for data fetch', () => {
  it('week range spans Mon–Sun', () => {
    const days = getWeekDays(new Date(2026, 2, 23)) // local date
    const range = getRangeForWeek(days)
    expect(range.start).toBe('2026-03-23')
    expect(range.end).toBe('2026-03-29')
  })
})
