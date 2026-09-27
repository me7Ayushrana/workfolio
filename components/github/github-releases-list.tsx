'use client'

import { useState } from 'react'
import { Tag, ExternalLink, Plus, CheckCircle2 } from 'lucide-react'
import { GitHubReleaseItem } from '@/lib/github/types'
import { useWorkfolio } from '@/lib/workfolio-store'

interface GitHubReleasesListProps {
  releases: GitHubReleaseItem[]
  projectId?: string
}

export function GitHubReleasesList({ releases, projectId }: GitHubReleasesListProps) {
  const { addProjectMilestone, logActivityEntry } = useWorkfolio()
  const [convertedMilestones, setConvertedMilestones] = useState<string[]>([])
  const [convertedEvidence, setConvertedEvidence] = useState<string[]>([])

  const handleConvertToMilestone = (rel: GitHubReleaseItem) => {
    if (projectId) {
      addProjectMilestone(projectId, `[Release ${rel.tagName}] ${rel.name}`)
    }
    setConvertedMilestones((prev) => [...prev, rel.id])
  }

  const handleConvertToEvidence = (rel: GitHubReleaseItem) => {
    logActivityEntry({
      work: `[GitHub Release ${rel.tagName}] ${rel.name}`,
      evidenceTitle: `Release ${rel.tagName}: ${rel.name}`,
      evidenceUrl: rel.url,
      capabilities: ['GitHub'],
      type: 'SHIP'
    })
    setConvertedEvidence((prev) => [...prev, rel.id])
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Tag size={14} /> GITHUB RELEASES
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Observed Product Releases</h3>
        </div>
        <span className="text-[10px] text-[#f3eee4]/50">SOURCE: GITHUB</span>
      </div>

      {releases.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">No GitHub releases published.</p>
      ) : (
        <div className="space-y-3">
          {releases.map((rel) => {
            const isMilestone = convertedMilestones.includes(rel.id)
            const isEvidence = convertedEvidence.includes(rel.id)

            return (
              <div
                key={rel.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 font-bold uppercase text-purple-300">
                      {rel.tagName}
                    </span>
                    <span className="text-[#f3eee4]/60">{rel.publishedDate}</span>
                  </div>
                  <h4 className="mt-1 font-medium text-xs text-white">{rel.name}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <a
                    href={rel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/15 p-2 text-[#f3eee4]/70 hover:text-white"
                  >
                    <ExternalLink size={13} />
                  </a>

                  {projectId && (
                    <button
                      onClick={() => handleConvertToMilestone(rel)}
                      disabled={isMilestone}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#f3eee4]/80 hover:text-white disabled:opacity-50"
                    >
                      {isMilestone ? 'Added to Milestones' : '+ Project Milestone'}
                    </button>
                  )}

                  <button
                    onClick={() => handleConvertToEvidence(rel)}
                    disabled={isEvidence}
                    className="rounded-lg bg-[#c1a05b] px-3.5 py-1.5 text-xs font-bold uppercase text-[#08090f] hover:bg-white disabled:opacity-50"
                  >
                    {isEvidence ? 'Added to Evidence' : '+ Evidence'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
