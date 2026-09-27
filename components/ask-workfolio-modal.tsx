'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Key,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

interface AskWorkfolioModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AskWorkfolioModal({ isOpen, onClose }: AskWorkfolioModalProps) {
  const {
    activities,
    projects,
    evidence,
    skills,
    learningTracks,
    goals,
    problems,
    geminiConfig,
    groqConfig,
    aiPrimaryProvider
  } = useWorkfolio()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const activeApiKey =
    aiPrimaryProvider === 'groq'
      ? groqConfig.apiKey || geminiConfig.apiKey
      : geminiConfig.apiKey || groqConfig.apiKey

  const activeModel =
    aiPrimaryProvider === 'groq' ? groqConfig.defaultModel : geminiConfig.defaultModel

  const [messages, setMessages] = useState<
    Array<{
      id: string
      sender: 'user' | 'ai'
      answer?: string
      verifiedDataPoints?: string[]
      aiInterpretation?: string[]
      sources?: Array<{ id: string; type: string; title: string; date?: string }>
      status?: 'success' | 'unconfigured' | 'error'
      errorMessage?: string
    }>
  >([
    {
      id: 'welcome',
      sender: 'ai',
      answer:
        'Hello! I am your Workfolio AI Assistant. Ask me anything about your activities, projects, evidence, or learning tracks.',
      verifiedDataPoints: [
        'Controlled server-side tool calling enables precise data lookup across Workfolio.',
        'Verified records are strictly separated from AI suggestions.'
      ],
      sources: []
    }
  ])

  if (!isOpen) return null

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query
    if (!q.trim() || loading) return

    const userMsgId = `user-${Date.now()}`
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', answer: q }])
    if (!customQuery) setQuery('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          apiKey: activeApiKey,
          model: activeModel,
          contextData: {
            activities,
            projects,
            evidence,
            skills,
            learningTracks,
            goals,
            problems
          }
        })
      })

      const data = await res.json()

      if (!data.success) {
        if (data.status === 'unconfigured') {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              sender: 'ai',
              status: 'unconfigured',
              errorMessage: 'AI is not configured yet. Please set GEMINI_API_KEY on your server.'
            }
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              sender: 'ai',
              status: 'error',
              errorMessage: data.message || 'Failed to process question with AI.'
            }
          ])
        }
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          status: 'success',
          answer: data.answer,
          verifiedDataPoints: data.verifiedDataPoints,
          aiInterpretation: data.aiInterpretation,
          sources: data.sources
        }
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          status: 'error',
          errorMessage: err.message || 'Network error querying assistant.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const samplePrompts = [
    'What did I work on recently?',
    'What projects are currently in progress?',
    'What evidence supports my Python & AI skills?',
    'What open problems am I currently solving?'
  ]

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#090a10] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c1a05b]/10 text-[#c1a05b] border border-[#c1a05b]/30">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-light text-white">Ask Workfolio</h3>
                <span className="rounded bg-[#c1a05b]/20 px-2 py-0.5 text-[9px] font-bold text-[#c1a05b]">
                  CONTROLLED QUERY
                </span>
              </div>
              <p className="text-[10px] text-[#f3eee4]/60">Queries authentic Workfolio data via controlled server tools</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#f3eee4]/60 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c1a05b]/20 text-[#c1a05b]">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#c1a05b] text-[#08090f] font-medium'
                    : 'border border-white/10 bg-white/5 text-[#f3eee4]'
                }`}
              >
                {msg.status === 'unconfigured' ? (
                  <div className="space-y-1 text-amber-300">
                    <p className="font-bold flex items-center gap-1.5"><AlertCircle size={14} /> AI Not Configured</p>
                    <p className="text-[11px] opacity-90">{msg.errorMessage}</p>
                  </div>
                ) : msg.status === 'error' ? (
                  <div className="space-y-1 text-red-400">
                    <p className="font-bold flex items-center gap-1.5"><AlertCircle size={14} /> Error</p>
                    <p className="text-[11px] opacity-90">{msg.errorMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap">{msg.answer}</p>

                    {/* Verified Data Points */}
                    {msg.verifiedDataPoints && msg.verifiedDataPoints.length > 0 && (
                      <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px]">
                        <p className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> VERIFIED WORKFOLIO DATA
                        </p>
                        <ul className="mt-1 space-y-1 text-[#f3eee4]/90">
                          {msg.verifiedDataPoints.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Interpretation */}
                    {msg.aiInterpretation && msg.aiInterpretation.length > 0 && (
                      <div className="mt-2 rounded-lg border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-3 text-[11px]">
                        <p className="font-bold text-[#c1a05b] flex items-center gap-1">
                          <Sparkles size={12} /> AI INTERPRETATION / SUGGESTION
                        </p>
                        <ul className="mt-1 space-y-1 text-[#f3eee4]/90">
                          {msg.aiInterpretation.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Supporting Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1.5">
                          Supporting Source Records:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-black/40 border border-white/15 px-2 py-0.5 text-[10px] text-[#f3eee4]/80"
                            >
                              <span className="uppercase text-[#c1a05b] font-bold">{src.type}:</span>
                              <span>{src.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c1a05b]/20 text-[#c1a05b]">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-[#f3eee4]/70">
                <RefreshCw className="animate-spin text-[#c1a05b]" size={14} />
                <span>Executing controlled Workfolio database query...</span>
              </div>
            </div>
          )}
        </div>

        {/* PROMPT STARTERS */}
        <div className="border-t border-white/10 bg-[#08090f] p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {samplePrompts.map((promptText) => (
              <button
                key={promptText}
                onClick={() => handleSend(promptText)}
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-[#f3eee4]/70 hover:border-[#c1a05b]/40 hover:text-white"
              >
                {promptText}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your work, skills, or projects..."
              className="flex-1 rounded-xl border border-white/15 bg-[#121420] px-4 py-2.5 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/40 outline-none focus:border-[#c1a05b]"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c1a05b] text-[#08090f] hover:bg-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
