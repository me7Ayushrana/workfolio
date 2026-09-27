'use client'

import { useState } from 'react'
import { Sparkles, Calendar, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function WeeklyReflectionSection() {
  const {
    activities,
    projects,
    learningTracks,
    problems,
    goals,
    evidence
  } = useWorkfolio()

  const [timeframe, setTimeframe] = useState<'current' | 'previous' | 'custom'>('current')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR' | 'NOT_CONFIGURED'>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reflectionData, setReflectionData] = useState<any | null>(null)
  const [showSupportingRecords, setShowSupportingRecords] = useState(false)

  const timeframeLabel =
    timeframe === 'current'
      ? 'Current Week'
      : timeframe === 'previous'
      ? 'Previous Week'
      : 'Last 30 Days'
  const dateRangeLabel = timeframeLabel

  const handleGenerateReflection = async () => {
    setLoading(true)
    setStatus('LOADING')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/ai/reflection/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange: timeframeLabel,
          context: {
            activities: activities.slice(0, 20),
            projects,
            learningTracks,
            goals,
            problems,
            evidence
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
          setErrorMessage(data.message || 'Failed to generate reflection.')
        }
        return
      }

      if (data.reflection?.summary?.includes('Not enough activity')) {
        setStatus('EMPTY')
      } else {
        setStatus('SUCCESS')
      }
      setReflectionData(data.reflection)
    } catch (err: any) {
      setStatus('ERROR')
      setErrorMessage(err?.message || 'Network error generating reflection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-[#0c0d14]/15 bg-[#0c0d14] p-6 text-[#f3eee4] shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Sparkles size={14} /> AI WEEKLY REFLECTION
          </div>
          <h3 className="mt-1 font-serif text-3xl font-light">Synthesize your weekly impact</h3>
          <p className="mt-1 text-xs text-[#f3eee4]/60">
            Ground insights directly in your authentic Workfolio activity logs and project milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg border border-white/15 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setTimeframe('current')}
              className={`rounded px-2.5 py-1 transition-all ${
                timeframe === 'current' ? 'bg-[#c1a05b] font-semibold text-[#0c0d14]' : 'text-[#f3eee4]/70 hover:text-white'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setTimeframe('previous')}
              className={`rounded px-2.5 py-1 transition-all ${
                timeframe === 'previous' ? 'bg-[#c1a05b] font-semibold text-[#0c0d14]' : 'text-[#f3eee4]/70 hover:text-white'
              }`}
            >
              Previous Week
            </button>
            <button
              onClick={() => setTimeframe('custom')}
              className={`rounded px-2.5 py-1 transition-all ${
                timeframe === 'custom' ? 'bg-[#c1a05b] font-semibold text-[#0c0d14]' : 'text-[#f3eee4]/70 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <button
            onClick={handleGenerateReflection}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#c1a05b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0c0d14] transition-all hover:bg-[#d8c8ad] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {reflectionData ? 'Regenerate' : 'Generate Reflection'}
          </button>
        </div>
      </div>

      {/* IDLE State */}
      {status === 'IDLE' && (
        <div className="py-12 text-center">
          <Calendar className="mx-auto text-[#c1a05b]/50" size={32} />
          <h4 className="mt-3 font-serif text-xl">Ready to reflect on your progress</h4>
          <p className="mt-1 text-xs text-[#f3eee4]/60 max-w-md mx-auto">
            Click &quot;Generate Reflection&quot; to compile your activities, problem resolutions, and learnings from {dateRangeLabel}.
          </p>
        </div>
      )}

      {/* LOADING State */}
      {status === 'LOADING' && (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="mx-auto animate-spin text-[#c1a05b]" size={28} />
          <p className="font-serif text-lg">Analyzing Workfolio records from {dateRangeLabel}...</p>
          <p className="text-xs text-[#f3eee4]/50">Synthesizing activities, learnings, and open intentions into an editorial reflection</p>
        </div>
      )}

      {/* NOT CONFIGURED State */}
      {status === 'NOT_CONFIGURED' && (
        <div className="mt-6 rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-5 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#c1a05b]">
            <AlertCircle size={16} /> AI is not configured yet.
          </div>
          <p className="mt-2 text-[#f3eee4]/80">
            To enable AI Weekly Reflection, set your <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[#c1a05b]">GEMINI_API_KEY</code> environment variable on your server or add your key in Settings.
          </p>
        </div>
      )}

      {/* ERROR State */}
      {status === 'ERROR' && (
        <div className="mt-6 rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-5 text-xs text-[#ff6b6b]">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={16} /> Reflection Generation Failed
          </div>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      {/* EMPTY State */}
      {status === 'EMPTY' && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <AlertCircle className="mx-auto text-[#c1a05b]" size={24} />
          <h4 className="mt-2 font-serif text-lg font-light">Insufficient Activity Logged</h4>
          <p className="mt-1 text-xs text-[#f3eee4]/60 max-w-md mx-auto">
            Not enough activity has been recorded for a meaningful weekly reflection. Log daily work entries to enable deep AI weekly synthesis.
          </p>
        </div>
      )}

      {/* SUCCESS State */}
      {status === 'SUCCESS' && reflectionData && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">EDITORIAL SUMMARY</p>
            <p className="mt-2 font-serif text-lg leading-relaxed text-[#f3eee4]">{reflectionData.summary}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Work & Progress */}
            {reflectionData.workedOn?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">KEY WORK COMPLETED</p>
                <ul className="mt-3 space-y-2 text-xs text-[#f3eee4]/80">
                  {reflectionData.workedOn.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c1a05b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learnings */}
            {reflectionData.learned?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">CONCEPTS & SKILLS LEARNED</p>
                <ul className="mt-3 space-y-2 text-xs text-[#f3eee4]/80">
                  {reflectionData.learned.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c1a05b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Problems Encountered / Solved */}
            {(reflectionData.problemsEncountered?.length > 0 || reflectionData.problemsSolved?.length > 0) && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">PROBLEMS & BLOCKERS</p>
                <div className="mt-3 space-y-2 text-xs">
                  {reflectionData.problemsSolved?.map((item: string, idx: number) => (
                    <p key={`sol-${idx}`} className="text-emerald-400/90 flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>Solved: {item}</span>
                    </p>
                  ))}
                  {reflectionData.problemsEncountered?.map((item: string, idx: number) => (
                    <p key={`enc-${idx}`} className="text-[#f3eee4]/70 flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>Encountered: {item}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Next Focus */}
            {reflectionData.suggestedFocusNextWeek?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">RECOMMENDED FOCUS FOR NEXT WEEK</p>
                <ul className="mt-3 space-y-2 text-xs text-[#f3eee4]/80">
                  {reflectionData.suggestedFocusNextWeek.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ArrowRight size={14} className="mt-0.5 text-[#c1a05b] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Supporting Workfolio Records Chip */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => setShowSupportingRecords(!showSupportingRecords)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#f3eee4]/80 transition-all hover:bg-white/10"
            >
              <span>Supporting Records [{activities.length} activities analyzed]</span>
              {showSupportingRecords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showSupportingRecords && (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-[#c1a05b]">
                      <span>{act.date || 'Recent'}</span>
                      <span className="uppercase">{act.type}</span>
                    </div>
                    <p className="mt-1 font-medium text-[#f3eee4]">{act.work}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
