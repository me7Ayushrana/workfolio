'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, ExternalLink, Plus, RefreshCw } from 'lucide-react'
import { GitHubPRItem, GitHubCommitItem } from '@/lib/github/types'
import { useWorkfolio } from '@/lib/workfolio-store'

interface GitHubEvidenceSuggestionsProps {
  pullRequests: GitHubPRItem[]
  commits: GitHubCommitItem[]
}

export function GitHubEvidenceSuggestions({ pullRequests, commits }: GitHubEvidenceSuggestionsProps) {
  const { logActivityEntry } = useWorkfolio()

  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [addedIds, setAddedIds] = useState<string[]>([])

  const fetchSuggestions = async () => {
    if (pullRequests.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/github/ai/suggest-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pullRequests: pullRequests.slice(0, 10) })
      })
      const data = await res.json()
      if (data.success) {
        setSuggestions(data.suggestions || [])
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvidence = (sug: any) => {
    logActivityEntry({
      work: `[Evidence from GitHub PR #${sug.sourcePrNumber}] ${sug.title}`,
      evidenceTitle: sug.title,
      evidenceUrl: sug.prUrl,
      capabilities: [sug.suggestedCapability || 'Engineering'],
      type: 'SHIP'
    })
    setAddedIds((prev) => [...prev, sug.id])
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id])
  }

  const activeSuggestions = suggestions.filter((s) => !dismissedIds.includes(s.id))

  return (
    <div className="rounded-2xl border border-[#c1a05b]/40 bg-[#0c0d14] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Sparkles size={14} /> AI GITHUB EVIDENCE DETECTOR
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Possible Evidence from Pull Requests</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Detected merged PRs that represent verifiable capability proof. User confirmation required.
          </p>
        </div>

        <button
          onClick={fetchSuggestions}
          disabled={loading || pullRequests.length === 0}
          className="flex items-center gap-2 rounded-xl bg-[#c1a05b] px-4 py-2 text-xs font-bold text-[#08090f] hover:bg-white disabled:opacity-40"
        >
          {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
          <span>{suggestions.length > 0 ? 'Rescan PRs' : 'Detect Evidence'}</span>
        </button>
      </div>

      {activeSuggestions.length === 0 ? (
        <p className="py-6 text-center text-xs text-[#f3eee4]/60">
          Click &quot;Detect Evidence&quot; to scan synchronized GitHub PRs for capability evidence items.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeSuggestions.map((sug) => {
            const isAdded = addedIds.includes(sug.id)
            return (
              <div key={sug.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#c1a05b]/20 px-2 py-0.5 text-[9px] font-bold text-[#c1a05b] uppercase">
                    POSSIBLE EVIDENCE
                  </span>
                  <span className="text-[10px] text-[#f3eee4]/50">PR #{sug.sourcePrNumber}</span>
                </div>

                <h4 className="font-serif text-lg font-light">{sug.title}</h4>
                <p className="text-xs text-[#f3eee4]/70 leading-relaxed">{sug.summary}</p>

                <div className="flex items-center gap-1.5 text-[10px] text-[#c1a05b]">
                  <strong className="uppercase">Capability:</strong> {sug.suggestedCapability}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <button
                    onClick={() => handleDismiss(sug.id)}
                    className="text-xs text-[#f3eee4]/50 hover:text-white"
                  >
                    Dismiss
                  </button>

                  {isAdded ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={14} /> Added to Evidence
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddEvidence(sug)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#c1a05b] px-3.5 py-1.5 text-xs font-bold text-[#08090f] hover:bg-white"
                    >
                      <Plus size={13} /> Add Evidence
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
