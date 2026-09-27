'use client'

import { useState } from 'react'
import { AlertTriangle, ExternalLink, Plus, CheckCircle2 } from 'lucide-react'
import { GitHubIssueItem } from '@/lib/github/types'
import { useWorkfolio } from '@/lib/workfolio-store'

interface GitHubIssuesListProps {
  issues: GitHubIssueItem[]
}

export function GitHubIssuesList({ issues }: GitHubIssuesListProps) {
  const { createProblem } = useWorkfolio()
  const [ignoredIds, setIgnoredIds] = useState<string[]>([])
  const [createdIds, setCreatedIds] = useState<string[]>([])

  const activeIssues = issues.filter((i) => !ignoredIds.includes(i.id))

  const handleCreateProblem = (issue: GitHubIssueItem) => {
    createProblem(
      `[GitHub #${issue.number}] ${issue.title}`,
      `Imported from GitHub Issue #${issue.number} in ${issue.repoName}.\nURL: ${issue.url}\n\n${issue.body || 'No description provided.'}`,
      'Pending resolution plan'
    )
    setCreatedIds((prev) => [...prev, issue.id])
  }

  const handleIgnore = (id: string) => {
    setIgnoredIds((prev) => [...prev, id])
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <AlertTriangle size={14} /> GITHUB OBSERVED ISSUES
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Potential Problems to Document</h3>
        </div>
        <span className="text-[10px] text-[#f3eee4]/50">SOURCE: GITHUB</span>
      </div>

      {activeIssues.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">No open GitHub issues observed.</p>
      ) : (
        <div className="space-y-3">
          {activeIssues.slice(0, 5).map((issue) => {
            const isCreated = createdIds.includes(issue.id)
            return (
              <div
                key={issue.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 font-bold uppercase text-amber-300">
                      POTENTIAL PROBLEM
                    </span>
                    <span className="text-[#f3eee4]/60">{issue.repoName}</span>
                  </div>
                  <h4 className="mt-1.5 font-medium text-xs text-white">
                    #{issue.number} {issue.title}
                  </h4>
                  {issue.body && (
                    <p className="mt-1 text-[11px] text-[#f3eee4]/70 line-clamp-2">{issue.body}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/15 p-2 text-xs text-[#f3eee4]/70 hover:text-white"
                    title="View on GitHub"
                  >
                    <ExternalLink size={13} />
                  </a>

                  <button
                    onClick={() => handleIgnore(issue.id)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#f3eee4]/60 hover:text-white"
                  >
                    Ignore
                  </button>

                  {isCreated ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={14} /> Added to Problems
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCreateProblem(issue)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#c1a05b] px-3.5 py-1.5 text-xs font-bold uppercase text-[#08090f] hover:bg-white"
                    >
                      <Plus size={13} /> Create Problem
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
