'use client'

import { Code, Info } from 'lucide-react'
import { GitHubRepoItem } from '@/lib/github/types'

interface GitHubLanguageAnalyticsProps {
  repositories: GitHubRepoItem[]
}

export function GitHubLanguageAnalytics({ repositories }: GitHubLanguageAnalyticsProps) {
  const langCounts: Record<string, number> = {}

  repositories.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1
    }
  })

  const total = Object.values(langCounts).reduce((a, b) => a + b, 0)
  const langEntries = Object.entries(langCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Code size={14} /> GITHUB OBSERVATION · LANGUAGE DISTRIBUTION
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Observed Technology Footprint</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Primary repository languages detected by GitHub. (Note: Language presence does not reflect skill proficiency).
          </p>
        </div>
      </div>

      {langEntries.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">No repository language data observed.</p>
      ) : (
        <div className="space-y-4">
          {/* Multi-color stacked bar */}
          <div className="flex h-3.5 w-full overflow-hidden rounded-full border border-white/15 bg-white/5">
            {langEntries.map(([lang, count], idx) => {
              const pct = Math.round((count / total) * 100)
              const colors = ['bg-[#c1a05b]', 'bg-teal-400', 'bg-purple-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400']
              return (
                <div
                  key={lang}
                  style={{ width: `${pct}%` }}
                  className={`${colors[idx % colors.length]} transition-all`}
                  title={`${lang}: ${pct}% (${count} repos)`}
                />
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {langEntries.map(([lang, count], idx) => {
              const pct = Math.round((count / total) * 100)
              return (
                <div key={lang} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="font-semibold text-white">{lang}</span>
                  <span className="text-[10px] font-mono text-[#c1a05b]">{pct}% ({count} repos)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
