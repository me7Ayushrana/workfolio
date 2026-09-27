'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, X, Play } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

interface NextActionItem {
  id: string
  title: string
  reason: string
  projectId?: string
  projectName?: string
  relatedGoal?: string
  relatedProblem?: string
  suggestedAction: string
  supportingRecords: Array<{
    id: string
    title: string
    type: 'activity' | 'problem' | 'goal' | 'project'
  }>
}

export function NextActionSection() {
  const {
    activities,
    projects,
    goals,
    problems,
    learningTracks,
    evidence,
    logActivityEntry
  } = useWorkfolio()

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR' | 'NOT_CONFIGURED'>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actions, setActions] = useState<NextActionItem[]>([])
  const [startedIds, setStartedIds] = useState<string[]>([])

  const fetchNextActions = async () => {
    setLoading(true)
    setStatus('LOADING')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/ai/next-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            activities: activities.slice(0, 15),
            projects: projects.slice(0, 10),
            goals: goals.slice(0, 10),
            problems: problems.slice(0, 10),
            learningTracks: learningTracks.slice(0, 10),
            evidence: evidence.slice(0, 10)
          }
        })
      })

      const data = await res.json()

      if (!data.success) {
        if (data.status === 'unconfigured') {
          setStatus('NOT_CONFIGURED')
          setErrorMessage('AI is not configured yet. Please set GEMINI_API_KEY on your server.')
        } else {
          setStatus('ERROR')
          setErrorMessage(data.message || 'Failed to fetch AI next actions.')
        }
        return
      }

      const suggestions = data.suggestions || []
      if (suggestions.length === 0) {
        setStatus('EMPTY')
      } else {
        setStatus('SUCCESS')
        setActions(suggestions)
      }
    } catch (err: any) {
      setStatus('ERROR')
      setErrorMessage(err?.message || 'Network error fetching next actions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNextActions()
    // eslint-disable-next-deps
  }, [])

  const handleStartAction = (action: NextActionItem) => {
    // Actually log an activity intention or update record
    logActivityEntry({
      work: `Started next action: ${action.title}`,
      intention: action.suggestedAction,
      projectId: action.projectId || undefined,
      type: 'BUILD',
      capabilities: ['Action Plan']
    })
    setStartedIds((prev) => [...prev, action.id])
  }

  const handleDismiss = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <section className="rounded-2xl border border-[#0c0d14]/15 bg-[#0c0d14] p-6 text-[#f3eee4] shadow-sm md:p-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Sparkles size={14} /> AI NEXT ACTION RECOMMENDER
          </div>
          <h3 className="mt-1 font-serif text-3xl font-light">What should you work on next?</h3>
          <p className="mt-1 text-xs text-[#f3eee4]/60">
            Intelligent recommendations derived from open blockers, unfinished intentions, and project status.
          </p>
        </div>

        <button
          onClick={fetchNextActions}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-[#f3eee4] transition-all hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* LOADING State */}
      {status === 'LOADING' && (
        <div className="py-10 text-center space-y-2">
          <RefreshCw className="mx-auto animate-spin text-[#c1a05b]" size={24} />
          <p className="text-xs text-[#f3eee4]/60">Evaluating open problems, intentions, and active goals...</p>
        </div>
      )}

      {/* NOT CONFIGURED State */}
      {status === 'NOT_CONFIGURED' && (
        <div className="mt-5 rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-5 text-xs text-[#f3eee4]/80">
          <div className="flex items-center gap-2 font-bold text-[#c1a05b]">
            <AlertCircle size={16} /> AI is not configured yet.
          </div>
          <p className="mt-1">
            Configure your <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[#c1a05b]">GEMINI_API_KEY</code> on your server to receive personalized next action suggestions.
          </p>
        </div>
      )}

      {/* ERROR State */}
      {status === 'ERROR' && (
        <div className="mt-5 rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-xs text-[#ff6b6b]">
          <p className="font-bold flex items-center gap-2"><AlertCircle size={15} /> Unable to load next actions</p>
          <p className="mt-1 opacity-90">{errorMessage}</p>
        </div>
      )}

      {/* EMPTY State */}
      {status === 'EMPTY' && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-6 text-center text-xs text-[#f3eee4]/60">
          No pending actions identified. All intentions and goals are currently up to date!
        </div>
      )}

      {/* SUCCESS State */}
      {status === 'SUCCESS' && actions.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {actions.map((act) => {
            const isStarted = startedIds.includes(act.id)
            return (
              <div
                key={act.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#c1a05b]/50"
              >
                <button
                  onClick={() => handleDismiss(act.id)}
                  className="absolute right-4 top-4 text-[#f3eee4]/40 hover:text-white"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#c1a05b]/20 px-2 py-0.5 text-[9px] font-bold uppercase text-[#c1a05b]">
                      RECOMMENDED ACTION
                    </span>
                    {act.projectName && (
                      <span className="text-[10px] text-[#f3eee4]/60">Project: {act.projectName}</span>
                    )}
                  </div>

                  <h4 className="mt-3 font-serif text-2xl font-light leading-snug">{act.title}</h4>

                  <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-[#f3eee4]/80">
                    <strong className="text-[#c1a05b]">Why:</strong> {act.reason}
                  </div>

                  {act.suggestedAction && (
                    <p className="mt-3 text-xs text-[#f3eee4]/70">
                      <strong className="text-white">Action:</strong> {act.suggestedAction}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  {isStarted ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={14} /> Logged to Workfolio
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartAction(act)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#c1a05b] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0c0d14] transition-all hover:bg-[#d8c8ad]"
                    >
                      <Play size={12} fill="currentColor" /> Start This
                    </button>
                  )}

                  {act.supportingRecords?.length > 0 && (
                    <span className="text-[10px] text-[#f3eee4]/50">
                      Backed by {act.supportingRecords.length} Workfolio record(s)
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
