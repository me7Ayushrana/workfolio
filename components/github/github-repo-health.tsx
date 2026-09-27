'use client'

import { ShieldCheck, Calendar, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'
import { GitHubRepoItem } from '@/lib/github/types'

interface GitHubRepoHealthProps {
  repository: GitHubRepoItem
}

export function GitHubRepoHealth({ repository }: GitHubRepoHealthProps) {
  const lastPushDate = repository.pushedDate || repository.updatedAt
  const daysSincePush = lastPushDate
    ? Math.max(0, Math.floor((Date.now() - new Date(lastPushDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const pushObservation =
    daysSincePush === 0
      ? 'Repository received a push today.'
      : `Repository received last push ${daysSincePush} day(s) ago.`

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <ShieldCheck size={14} /> REPOSITORY HEALTH OBSERVATION
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">{repository.name} Status</h3>
        </div>
        <span className="text-[10px] text-[#f3eee4]/50">SOURCE: GITHUB</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="font-bold text-[#c1a05b] uppercase text-[10px]">PUSH RECENCY</p>
          <p className="text-[#f3eee4]/90">{pushObservation}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="font-bold text-[#c1a05b] uppercase text-[10px]">OPEN ISSUES & PRs</p>
          <p className="text-[#f3eee4]/90">
            {repository.openIssues} open issue(s) recorded on GitHub.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="font-bold text-[#c1a05b] uppercase text-[10px]">DOCUMENTATION STATUS</p>
          <p className="text-[#f3eee4]/90">
            {repository.readmeContent ? 'README file present in repository.' : 'No README file detected.'}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="font-bold text-[#c1a05b] uppercase text-[10px]">ARCHIVE & VISIBILITY</p>
          <p className="text-[#f3eee4]/90">
            {repository.isArchived ? 'Repository is archived.' : 'Repository is active.'} ({repository.visibility})
          </p>
        </div>
      </div>
    </div>
  )
}
