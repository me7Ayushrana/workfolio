'use client'

import { GitPullRequest, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import { GitHubPRItem } from '@/lib/github/types'

interface GitHubPRAnalyticsProps {
  pullRequests: GitHubPRItem[]
}

export function GitHubPRAnalytics({ pullRequests }: GitHubPRAnalyticsProps) {
  const totalPRs = pullRequests.length
  const mergedPRs = pullRequests.filter((p) => p.state === 'MERGED').length
  const openPRs = pullRequests.filter((p) => p.state === 'OPEN').length
  const closedPRs = pullRequests.filter((p) => p.state === 'CLOSED').length

  const mergeRate = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <GitPullRequest size={14} /> GITHUB PULL REQUEST ANALYTICS
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Pull Request Velocity & Outcomes</h3>
        </div>
        <span className="rounded bg-[#c1a05b]/20 px-2.5 py-1 text-[10px] font-bold text-[#c1a05b]">
          SOURCE: GITHUB
        </span>
      </div>

      {totalPRs === 0 ? (
        <div className="py-8 text-center text-xs text-[#f3eee4]/60">
          No pull request activity synchronized yet. Connect GitHub to track PR metrics.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-[#f3eee4]/60">Total PRs</span>
              <p className="mt-1 font-serif text-3xl font-light text-[#c1a05b]">{totalPRs}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Merged PRs</span>
              <p className="mt-1 font-serif text-3xl font-light text-emerald-400">{mergedPRs}</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-300">Open PRs</span>
              <p className="mt-1 font-serif text-3xl font-light text-amber-300">{openPRs}</p>
            </div>
            <div className="rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-[#c1a05b]">Merge Rate</span>
              <p className="mt-1 font-serif text-3xl font-light text-[#c1a05b]">{mergeRate}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Recent Pull Requests</p>
            <div className="space-y-2">
              {pullRequests.slice(0, 5).map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        pr.state === 'MERGED'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : pr.state === 'OPEN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {pr.state}
                    </span>
                    <div>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#f3eee4] hover:text-[#c1a05b] flex items-center gap-1"
                      >
                        <span>#{pr.number} {pr.title}</span>
                        <ExternalLink size={12} />
                      </a>
                      <span className="text-[10px] text-[#f3eee4]/50">{pr.repoName} · Created {pr.createdDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
