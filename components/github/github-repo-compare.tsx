'use client'

import { useState } from 'react'
import { GitBranch, Folder, Code, GitCommit, GitPullRequest, AlertTriangle } from 'lucide-react'
import { GitHubRepoItem, GitHubCommitItem, GitHubPRItem, GitHubIssueItem } from '@/lib/github/types'

interface GitHubRepoCompareProps {
  repositories: GitHubRepoItem[]
  commits: GitHubCommitItem[]
  pullRequests: GitHubPRItem[]
  issues: GitHubIssueItem[]
}

export function GitHubRepoCompare({ repositories, commits, pullRequests, issues }: GitHubRepoCompareProps) {
  const [repoId1, setRepoId1] = useState<string>(repositories[0]?.id || '')
  const [repoId2, setRepoId2] = useState<string>(repositories[1]?.id || repositories[0]?.id || '')

  const repo1 = repositories.find((r) => r.id === repoId1)
  const repo2 = repositories.find((r) => r.id === repoId2)

  const getRepoStats = (repo?: GitHubRepoItem) => {
    if (!repo) return null
    const rCommits = commits.filter((c) => c.repoName === repo.fullName)
    const rPrs = pullRequests.filter((p) => p.repoName === repo.fullName)
    const rIssues = issues.filter((i) => i.repoName === repo.fullName)

    return {
      name: repo.name,
      fullName: repo.fullName,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.openIssues,
      commitsCount: rCommits.length,
      prsCount: rPrs.length,
      mergedPrs: rPrs.filter((p) => p.state === 'MERGED').length,
      issuesCount: rIssues.length,
      updatedAt: repo.updatedAt
    }
  }

  const stats1 = getRepoStats(repo1)
  const stats2 = getRepoStats(repo2)

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <GitBranch size={14} /> GITHUB REPOSITORY COMPARISON
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Side-by-Side Architectural Metrics</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Compare repository structure, activity, and contribution density for deep understanding.
          </p>
        </div>
      </div>

      {repositories.length < 2 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">
          Connect at least 2 GitHub repositories to enable repository comparison.
        </p>
      ) : (
        <>
          {/* Repository Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Select Repository A</label>
              <select
                value={repoId1}
                onChange={(e) => setRepoId1(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-xs text-white outline-none"
              >
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Select Repository B</label>
              <select
                value={repoId2}
                onChange={(e) => setRepoId2(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-xs text-white outline-none"
              >
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          {stats1 && stats2 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">
                    <th className="py-2">Metric</th>
                    <th className="py-2 text-center">{stats1.name}</th>
                    <th className="py-2 text-center">{stats2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Primary Language</td>
                    <td className="py-2.5 text-center font-bold text-white">{stats1.language}</td>
                    <td className="py-2.5 text-center font-bold text-white">{stats2.language}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Synchronized Commits</td>
                    <td className="py-2.5 text-center font-serif text-lg text-[#c1a05b]">{stats1.commitsCount}</td>
                    <td className="py-2.5 text-center font-serif text-lg text-[#c1a05b]">{stats2.commitsCount}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Pull Requests (Total / Merged)</td>
                    <td className="py-2.5 text-center font-medium">{stats1.prsCount} ({stats1.mergedPrs} merged)</td>
                    <td className="py-2.5 text-center font-medium">{stats2.prsCount} ({stats2.mergedPrs} merged)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Open Issues</td>
                    <td className="py-2.5 text-center font-medium">{stats1.openIssues}</td>
                    <td className="py-2.5 text-center font-medium">{stats2.openIssues}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Stars / Forks</td>
                    <td className="py-2.5 text-center font-medium">⭐ {stats1.stars} · 🍴 {stats1.forks}</td>
                    <td className="py-2.5 text-center font-medium">⭐ {stats2.stars} · 🍴 {stats2.forks}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#f3eee4]/70">Last Pushed / Updated</td>
                    <td className="py-2.5 text-center text-[10px] text-[#f3eee4]/60">{stats1.updatedAt}</td>
                    <td className="py-2.5 text-center text-[10px] text-[#f3eee4]/60">{stats2.updatedAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
