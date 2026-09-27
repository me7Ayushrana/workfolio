'use client'

import { useState } from 'react'
import { GitCommit, Calendar, Filter, Sparkles } from 'lucide-react'
import { GitHubCommitItem } from '@/lib/github/types'

interface GitHubHeatmapProps {
  commits: GitHubCommitItem[]
  repoNames?: string[]
}

export function GitHubHeatmap({ commits, repoNames = [] }: GitHubHeatmapProps) {
  const [daysFilter, setDaysFilter] = useState<365 | 90 | 30 | 7>(90)
  const [selectedRepo, setSelectedRepo] = useState<string>('ALL')

  const filteredCommits = commits.filter((c) => {
    if (selectedRepo !== 'ALL' && c.repoName !== selectedRepo) return false
    const commitDate = new Date(c.date).getTime()
    const cutoff = Date.now() - daysFilter * 86400000
    return commitDate >= cutoff
  })

  // Generate date grid for heatmap
  const totalCells = daysFilter === 365 ? 120 : daysFilter === 90 ? 60 : daysFilter === 30 ? 30 : 7
  const cells = Array.from({ length: totalCells }).map((_, idx) => {
    const dateObj = new Date(Date.now() - (totalCells - 1 - idx) * 86400000)
    const dateStr = dateObj.toISOString().split('T')[0]
    const count = filteredCommits.filter((c) => c.date === dateStr).length

    return {
      dateStr,
      count
    }
  })

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <GitCommit size={14} /> GITHUB OBSERVATION · OBSERVED COMMIT HEATMAP
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">GitHub Contribution Rhythm</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Observed external GitHub commits. Distinct from user-recorded Workfolio activity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Repo Selector */}
          {repoNames.length > 0 && (
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs text-[#f3eee4] outline-none"
            >
              <option value="ALL">All Repositories</option>
              {repoNames.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg border border-white/15 bg-white/5 p-1 text-xs">
            {([365, 90, 30, 7] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDaysFilter(d)}
                className={`rounded px-2.5 py-1 transition-all ${
                  daysFilter === d ? 'bg-[#c1a05b] font-bold text-[#08090f]' : 'text-[#f3eee4]/70 hover:text-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-1.5 items-center justify-start">
          {cells.map((cell, i) => {
            const intensity =
              cell.count === 0
                ? 'bg-white/5 border border-white/10'
                : cell.count === 1
                ? 'bg-[#c1a05b]/30 border border-[#c1a05b]/50'
                : cell.count < 4
                ? 'bg-[#c1a05b]/60 border border-[#c1a05b]'
                : 'bg-[#c1a05b] border border-white'

            return (
              <div
                key={cell.dateStr || i}
                title={`${cell.dateStr}: ${cell.count} commit(s)`}
                className={`h-4 w-4 rounded-xs transition-all hover:scale-125 ${intensity}`}
              />
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px] text-[#f3eee4]/50">
          <span>SOURCE: GITHUB (OBSERVED DATA ONLY)</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="h-3 w-3 rounded-xs bg-white/5 border border-white/10" />
            <span className="h-3 w-3 rounded-xs bg-[#c1a05b]/30" />
            <span className="h-3 w-3 rounded-xs bg-[#c1a05b]/60" />
            <span className="h-3 w-3 rounded-xs bg-[#c1a05b]" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
