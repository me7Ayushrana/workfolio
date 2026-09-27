'use client'

import { GitCommit, GitPullRequest, Folder, Activity, Sparkles, Milestone, CheckCircle2 } from 'lucide-react'
import { GitHubCommitItem, GitHubPRItem, GitHubReleaseItem } from '@/lib/github/types'
import { ActivityLogEntry } from '@/lib/workfolio-store'

interface TimelineEvent {
  id: string
  source: 'GITHUB' | 'WORKFOLIO'
  type: string
  title: string
  date: string
  details?: string
  url?: string
}

interface GitHubProjectTimelineProps {
  repoName?: string
  commits?: GitHubCommitItem[]
  pullRequests?: GitHubPRItem[]
  releases?: GitHubReleaseItem[]
  workfolioActivities?: ActivityLogEntry[]
}

export function GitHubProjectTimeline({
  repoName,
  commits = [],
  pullRequests = [],
  releases = [],
  workfolioActivities = []
}: GitHubProjectTimelineProps) {
  // Merge and sort all events chronologically
  const events: TimelineEvent[] = []

  // Add GitHub Commits
  commits.forEach((c) => {
    events.push({
      id: `commit-${c.sha}`,
      source: 'GITHUB',
      type: 'COMMIT',
      title: `Commit: ${c.message}`,
      date: c.date,
      url: c.url
    })
  })

  // Add GitHub PRs
  pullRequests.forEach((pr) => {
    events.push({
      id: `pr-${pr.id}`,
      source: 'GITHUB',
      type: 'PULL_REQUEST',
      title: `PR #${pr.number} (${pr.state}): ${pr.title}`,
      date: pr.createdDate,
      url: pr.url
    })
  })

  // Add GitHub Releases
  releases.forEach((rel) => {
    events.push({
      id: `rel-${rel.id}`,
      source: 'GITHUB',
      type: 'RELEASE',
      title: `Release ${rel.tagName}: ${rel.name}`,
      date: rel.publishedDate,
      url: rel.url
    })
  })

  // Add Workfolio Activities
  workfolioActivities.forEach((act) => {
    events.push({
      id: `wf-act-${act.id}`,
      source: 'WORKFOLIO',
      type: act.type || 'ACTIVITY',
      title: act.work,
      date: act.date,
      details: act.learning || act.struggle
    })
  })

  // Sort newest first
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Folder size={14} /> UNIFIED PROJECT TIMELINE
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Evolution & Work Provenance</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Reconstructs project history combining observed GitHub events and user Workfolio logs.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">No timeline events recorded yet for this project.</p>
      ) : (
        <div className="relative border-l border-white/15 pl-6 space-y-6 my-4">
          {events.slice(0, 15).map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Event node indicator */}
              <div
                className={`absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                  evt.source === 'GITHUB'
                    ? 'border-[#c1a05b] bg-[#c1a05b]/20 text-[#c1a05b]'
                    : 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {evt.source === 'GITHUB' ? <GitCommit size={12} /> : <Activity size={12} />}
              </div>

              <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-4 transition-all group-hover:border-white/20">
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`rounded px-2 py-0.5 font-bold uppercase ${
                      evt.source === 'GITHUB'
                        ? 'bg-[#c1a05b]/20 text-[#c1a05b] border border-[#c1a05b]/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {evt.source} EVENT · {evt.type}
                  </span>
                  <span className="text-[#f3eee4]/50 font-mono">{evt.date}</span>
                </div>

                <h4 className="mt-1 font-medium text-xs text-white leading-relaxed">{evt.title}</h4>
                {evt.details && <p className="text-[11px] text-[#f3eee4]/70 leading-relaxed">{evt.details}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
