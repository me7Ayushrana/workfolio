'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Edit3, Save, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

interface ProjectAISummaryProps {
  project: any
  projectActivities: any[]
}

export function ProjectAISummary({ project, projectActivities }: ProjectAISummaryProps) {
  const { updateProjectNotes, updateProject, geminiConfig, groqConfig, aiPrimaryProvider } = useWorkfolio()

  const activeApiKey =
    aiPrimaryProvider === 'groq'
      ? groqConfig.apiKey || geminiConfig.apiKey
      : geminiConfig.apiKey || groqConfig.apiKey

  const activeModel =
    aiPrimaryProvider === 'groq' ? groqConfig.defaultModel : geminiConfig.defaultModel

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'NOT_CONFIGURED'>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableNotes, setEditableNotes] = useState(project.notes || '')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleGenerateSummary = async () => {
    setLoading(true)
    setStatus('LOADING')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/ai/project/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: activeApiKey,
          model: activeModel,
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            category: project.category,
            status: project.status
          },
          projectActivities: projectActivities.slice(0, 15),
          milestones: project.milestones || []
        })
      })

      const data = await res.json()

      if (!data.success) {
        if (data.status === 'unconfigured') {
          setStatus('NOT_CONFIGURED')
          setErrorMessage('AI is not configured yet. Please set GEMINI_API_KEY on your server.')
        } else {
          setStatus('ERROR')
          setErrorMessage(data.message || 'Failed to generate project summary.')
        }
        return
      }

      setStatus('SUCCESS')
      setSummaryData(data.summary)

      // Pre-fill editable notes with formatted summary text
      const formattedText = `
### Overview
${data.summary.whatItIs}

### Problem Solved
${data.summary.problemSolved}

### Core Technical Architecture & Built Deliverables
${data.summary.whatBuilt}

${data.summary.keyTechnicalWork?.length ? `#### Technical Highlights:\n- ${data.summary.keyTechnicalWork.join('\n- ')}` : ''}

${data.summary.challenges?.length ? `#### Challenges & Solutions:\n- ${data.summary.challenges.join('\n- ')}` : ''}

${data.summary.whatWasLearned?.length ? `#### Key Learnings:\n- ${data.summary.whatWasLearned.join('\n- ')}` : ''}

#### Current Status & Next Steps
- Status: ${data.summary.currentStatus}
${data.summary.nextSteps?.length ? `- Next: ${data.summary.nextSteps.join('\n- Next: ')}` : ''}
`.trim()

      setEditableNotes(formattedText)
    } catch (err: any) {
      setStatus('ERROR')
      setErrorMessage(err?.message || 'Network error generating summary.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSummary = () => {
    updateProjectNotes(project.id, editableNotes)
    setSavedSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="rounded-2xl border border-[#0c0d14]/15 bg-[#0c0d14] p-6 text-[#f3eee4] shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Sparkles size={14} /> AI PROJECT SUMMARY GENERATOR
          </div>
          <h3 className="mt-1 font-serif text-3xl font-light">Synthesize Project Case Study</h3>
          <p className="mt-1 text-xs text-[#f3eee4]/60">
            Synthesizes project logs, evidence, and milestones into an editable technical summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'SUCCESS' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-[#f3eee4] hover:bg-white/10"
            >
              <Edit3 size={14} /> Edit Summary
            </button>
          )}

          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#c1a05b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0c0d14] transition-all hover:bg-[#d8c8ad] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {summaryData ? 'Regenerate' : 'Generate AI Summary'}
          </button>
        </div>
      </div>

      {/* NOT CONFIGURED State */}
      {status === 'NOT_CONFIGURED' && (
        <div className="mt-5 rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-5 text-xs text-[#f3eee4]/80">
          <div className="flex items-center gap-2 font-bold text-[#c1a05b]">
            <AlertCircle size={16} /> AI is not configured yet.
          </div>
          <p className="mt-1">
            Configure your <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[#c1a05b]">GEMINI_API_KEY</code> environment variable on your server to generate project summaries.
          </p>
        </div>
      )}

      {/* ERROR State */}
      {status === 'ERROR' && (
        <div className="mt-5 rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-4 text-xs text-[#ff6b6b]">
          <p className="font-bold flex items-center gap-2"><AlertCircle size={15} /> Summary Generation Failed</p>
          <p className="mt-1 opacity-90">{errorMessage}</p>
        </div>
      )}

      {/* EDITING Mode */}
      {isEditing && (
        <div className="mt-5 space-y-4">
          <textarea
            value={editableNotes}
            onChange={(e) => setEditableNotes(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-white/20 bg-black/50 p-4 font-mono text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSummary}
              className="flex items-center gap-2 rounded-lg bg-[#c1a05b] px-4 py-2 text-xs font-bold text-[#0c0d14] hover:bg-[#d8c8ad]"
            >
              <Save size={14} /> Save Summary to Project
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs text-[#f3eee4]/70 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS Display */}
      {status === 'SUCCESS' && summaryData && !isEditing && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">WHAT IT IS</p>
              <p className="mt-2 text-xs text-[#f3eee4]/90 leading-relaxed">{summaryData.whatItIs}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">PROBLEM SOLVED</p>
              <p className="mt-2 text-xs text-[#f3eee4]/90 leading-relaxed">{summaryData.problemSolved}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">WHAT HAS BEEN BUILT</p>
            <p className="mt-2 text-xs text-[#f3eee4]/90 leading-relaxed">{summaryData.whatBuilt}</p>

            {summaryData.keyTechnicalWork?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase text-[#f3eee4]/60">KEY TECHNICAL HIGHLIGHTS</p>
                <ul className="mt-2 space-y-1 text-xs text-[#f3eee4]/80">
                  {summaryData.keyTechnicalWork.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#c1a05b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {summaryData.challenges?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">CHALLENGES & SOLUTIONS</p>
                <ul className="mt-2 space-y-1.5 text-xs text-[#f3eee4]/80">
                  {summaryData.challenges.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summaryData.whatWasLearned?.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">WHAT WAS LEARNED</p>
                <ul className="mt-2 space-y-1.5 text-xs text-[#f3eee4]/80">
                  {summaryData.whatWasLearned.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={handleSaveSummary}
              className="flex items-center gap-2 rounded-lg bg-[#c1a05b] px-4 py-2 text-xs font-bold text-[#0c0d14] hover:bg-[#d8c8ad]"
            >
              <Save size={14} /> Save Summary to Project Record
            </button>

            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={14} /> Project record updated!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
