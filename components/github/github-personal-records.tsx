'use client'

import { Trophy, GitCommit, Folder, Calendar } from 'lucide-react'
import { GitHubRepoItem, GitHubCommitItem } from '@/lib/github/types'

interface GitHubPersonalRecordsProps {
  repositories: GitHubRepoItem[]
  commits: GitHubCommitItem[]
}

export function GitHubPersonalRecords({ repositories, commits }: GitHubPersonalRecordsProps) {
  // Compute Most Active Repo
  const repoCounts: Record<string, number> = {}
  commits.forEach((c) => {
    repoCounts[c.repoName] = (repoCounts[c.repoName] || 0) + 1
  })
  const topRepo = Object.entries(repoCounts).sort((a, b) => b[1] - a[1])[0]

  // Compute Top Commit Day
  const dateCounts: Record<string, number> = {}
  commits.forEach((c) => {
    dateCounts[c.date] = (dateCounts[c.date] || 0) + 1
  })
  const topDay = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Trophy size={14} /> GITHUB PERSONAL RECORDS
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Observed Contribution Milestones</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Personal records supported by real GitHub commit and repository data.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#c1a05b]">
            <Folder size={12} /> MOST ACTIVE REPOSITORY
          </div>
          <p className="font-serif text-xl text-white">{topRepo ? topRepo[0] : 'N/A'}</p>
          <p className="text-[10px] text-[#f3eee4]/60">{topRepo ? `${topRepo[1]} synchronized commits` : 'No commits recorded'}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#c1a05b]">
            <Calendar size={12} /> HIGHEST COMMIT DAY
          </div>
          <p className="font-serif text-xl text-white">{topDay ? topDay[0] : 'N/A'}</p>
          <p className="text-[10px] text-[#f3eee4]/60">{topDay ? `${topDay[1]} commits in 24 hours` : 'No commits recorded'}</p>
        </div>
      </div>
    </div>
  )
}
