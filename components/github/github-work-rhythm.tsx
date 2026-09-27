'use client'

import { Clock, Calendar, Activity } from 'lucide-react'
import { GitHubCommitItem } from '@/lib/github/types'

interface GitHubWorkRhythmProps {
  commits: GitHubCommitItem[]
}

export function GitHubWorkRhythm({ commits }: GitHubWorkRhythmProps) {
  // Analyze commit days
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  commits.forEach((c) => {
    if (c.date) {
      const day = new Date(c.date).getDay()
      weekdayCounts[day]++
    }
  })

  const maxWeekdayCount = Math.max(...weekdayCounts, 1)
  const mostActiveDayIdx = weekdayCounts.indexOf(Math.max(...weekdayCounts))
  const mostActiveDay = weekdayNames[mostActiveDayIdx]

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Clock size={14} /> GITHUB OBSERVATION · WORK RHYTHM
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">GitHub Work Rhythm Patterns</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Observed timestamp patterns across synchronized commits. (Descriptive activity rhythm, not a score).
          </p>
        </div>
        <span className="text-[10px] text-[#f3eee4]/50">SOURCE: GITHUB</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekday Distribution */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Commit Activity by Weekday</p>
          <div className="flex items-end justify-between gap-2 h-28 pt-4">
            {weekdayNames.map((name, idx) => {
              const count = weekdayCounts[idx]
              const heightPct = Math.round((count / maxWeekdayCount) * 100) || 5
              return (
                <div key={name} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-xs bg-[#c1a05b] transition-all hover:bg-white"
                    title={`${name}: ${count} commit(s)`}
                  />
                  <span className="text-[10px] font-bold text-[#f3eee4]/60">{name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rhythm Insights */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Observed Rhythm Highlights</p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
              <span className="text-[#f3eee4]/70">Most Active Day</span>
              <span className="font-serif text-lg text-[#c1a05b] font-light">{mostActiveDay}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
              <span className="text-[#f3eee4]/70">Total Observed Commits</span>
              <span className="font-serif text-lg text-white font-light">{commits.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
