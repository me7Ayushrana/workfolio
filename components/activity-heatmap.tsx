'use client'

import React, { useState } from 'react'
import { ActivityLogEntry } from '@/lib/workfolio-store'
import { Calendar, CheckCircle2, Flame, Layers, Sparkles } from 'lucide-react'

interface ActivityHeatmapProps {
  activities: ActivityLogEntry[]
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Generate 365 days history array
  const today = new Date()
  const days: { dateStr: string; count: number; dayOfWeek: number }[] = []

  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = activities.filter((a) => a.date === dateStr).length
    days.push({ dateStr, count, dayOfWeek: d.getDay() })
  }

  // Selected date entries
  const selectedEntries = activities.filter((a) => a.date === selectedDate)

  // Calculate current streak
  let currentStreak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const hasActivity = activities.some((a) => a.date === dateStr)
    if (hasActivity) {
      currentStreak++
    } else if (i > 0) {
      break
    }
  }

  // Weekly day progress (Mon-Sun of current week)
  const currentWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
    // Mon is day 1, Sun is day 0
    const targetDayIndex = (idx + 1) % 7
    const weekStart = new Date()
    const currentDay = weekStart.getDay()
    const diff = (currentDay === 0 ? -6 : 1) - currentDay + idx
    const weekDate = new Date()
    weekDate.setDate(today.getDate() + diff)
    const dateStr = weekDate.toISOString().split('T')[0]
    const count = activities.filter((a) => a.date === dateStr).length

    return { dayName, dateStr, count, isToday: dateStr === today.toISOString().split('T')[0] }
  })

  return (
    <div className="space-y-6 text-[#f3eee4]">
      {/* Weekly Progress Bar (Mon-Sun) */}
      <div className="border border-[#c1a05b]/30 bg-[#0c1612] p-5 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
          <span className="flex items-center gap-1.5"><Calendar size={13} /> THIS WEEK'S LOGGED DAYS</span>
          <span className="flex items-center gap-1 text-[#f3eee4]"><Flame size={13} className="text-[#c1a05b]" /> {currentStreak} Day Reflection Streak</span>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {currentWeekDays.map((w) => (
            <button
              key={w.dayName}
              onClick={() => setSelectedDate(w.dateStr)}
              className={`p-3 text-center border transition-all cursor-pointer ${
                selectedDate === w.dateStr
                  ? 'border-[#c1a05b] bg-[#c1a05b] text-[#0c1612] font-bold shadow-md'
                  : w.count > 0
                  ? 'border-[#2ec4b6]/40 bg-[#2ec4b6]/15 text-[#2ec4b6]'
                  : 'border-[#f3eee4]/15 bg-[#12241b] text-[#f3eee4]/60 hover:border-[#c1a05b]/50 hover:text-[#f3eee4]'
              }`}
            >
              <span className="block text-[10px] font-bold tracking-[.1em]">{w.dayName}</span>
              <span className="mt-1 block font-serif text-lg font-light">
                {w.count > 0 ? `✓` : `–`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 365-Day Activity Heatmap Grid */}
      <div className="border border-[#c1a05b]/30 bg-[#0c1612] p-6 text-[#f3eee4] shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
          <span>WORKFOLIO 365-DAY WORK & LEARNING HEATMAP</span>
          <span>{activities.length} TOTAL ENTRIES LOGGED</span>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {days.map((d, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(d.dateStr)}
                title={`${d.dateStr}: ${d.count} updates logged`}
                className={`h-3.5 w-3.5 transition-transform hover:scale-125 cursor-pointer ${
                  selectedDate === d.dateStr
                    ? 'ring-2 ring-[#c1a05b]'
                    : ''
                } ${
                  d.count === 0
                    ? 'bg-[#1a2c24]'
                    : d.count === 1
                    ? 'bg-[#9b7b3b]'
                    : d.count === 2
                    ? 'bg-[#2ec4b6]'
                    : 'bg-[#c1a05b]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em] text-[#f3eee4]/60">
          <span>Click any square to inspect entries</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <span className="h-2.5 w-2.5 bg-[#1a2c24]" />
            <span className="h-2.5 w-2.5 bg-[#9b7b3b]" />
            <span className="h-2.5 w-2.5 bg-[#2ec4b6]" />
            <span className="h-2.5 w-2.5 bg-[#c1a05b]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector Detail */}
      {selectedEntries.length > 0 ? (
        <div className="border border-[#c1a05b]/30 bg-[#0c1612] p-5 space-y-3 text-[#f3eee4]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
            <span>LOGGED ACTIVITY FOR {selectedDate}</span>
            <span>{selectedEntries.length} Update(s)</span>
          </div>

          <div className="space-y-4">
            {selectedEntries.map((act) => (
              <div key={act.id} className="border-b border-[#f3eee4]/10 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-[#c1a05b] text-[#0c1612] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.14em]">
                    {act.type}
                  </span>
                  <span className="text-[10px] font-bold text-[#f3eee4]/60">{act.time}</span>
                </div>
                <p className="font-serif text-xl font-light text-[#f3eee4]">{act.work}</p>
                {act.learning && (
                  <p className="text-xs text-[#2ec4b6]"><strong className="font-semibold">Learned:</strong> {act.learning}</p>
                )}
                {act.struggle && (
                  <p className="text-xs text-[#ff6b6b]"><strong className="font-semibold">Struggle:</strong> {act.struggle}</p>
                )}
                {act.intention && (
                  <p className="text-xs text-[#c1a05b]"><strong className="font-semibold">Next Intention:</strong> {act.intention}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[#c1a05b]/30 bg-[#0c1612] p-4 text-center text-xs text-[#f3eee4]/60">
          No entries recorded for {selectedDate}. Click "+ LOG ACTIVITY" to record your work.
        </div>
      )}
    </div>
  )
}
