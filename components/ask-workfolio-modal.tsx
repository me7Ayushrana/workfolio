'use client'

import { useState } from 'react'
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  RefreshCw
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
    problems
  } = useWorkfolio()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

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
        'Hello. I am your Workfolio AI Assistant. Ask me anything about your activities, projects, evidence, or learning tracks.',
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
              errorMessage: 'AI is not configured yet. Please set GEMINI_API_KEY or GROQ_API_KEY on your server or connect a key in Settings.'
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
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm font-sans">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-[#29302A] bg-[#141614] text-[#F5F2EB] shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#29302A] bg-[#171A17] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#202420] text-[#C1A05B] border border-[#29302A]">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-normal text-[#F5F2EB]">Ask Workfolio</h3>
                <span className="rounded bg-[#2A4232] border border-[#3D5C47] px-2 py-0.5 text-[10px] font-medium text-[#7EC896]">
                  Controlled Query
                </span>
              </div>
              <p className="text-xs text-[#A0A5A0]">Queries authentic Workfolio data via controlled server tools</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1.5 text-[#A0A5A0] hover:bg-[#202420] hover:text-[#F5F2EB] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#111311]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#202420] text-[#C1A05B] border border-[#29302A]">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-md p-4 text-xs leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-[#2A4232] border-[#3D5C47] text-[#F5F2EB]'
                    : 'bg-[#171A17] border-[#29302A] text-[#F5F2EB]'
                }`}
              >
                {msg.status === 'unconfigured' ? (
                  <div className="space-y-1 text-[#D9B263]">
                    <p className="font-medium flex items-center gap-1.5"><AlertCircle size={14} /> AI Not Configured</p>
                    <p className="text-[11px] opacity-90">{msg.errorMessage}</p>
                  </div>
                ) : msg.status === 'error' ? (
                  <div className="space-y-1 text-[#E07A7A]">
                    <p className="font-medium flex items-center gap-1.5"><AlertCircle size={14} /> Provider Error</p>
                    <p className="text-[11px] opacity-90">{msg.errorMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap leading-normal text-xs">{msg.answer}</p>

                    {/* Verified Data Points */}
                    {msg.verifiedDataPoints && msg.verifiedDataPoints.length > 0 && (
                      <div className="mt-3 rounded border border-[#2A5236] bg-[#1B3322] p-3 text-[11px]">
                        <p className="font-semibold text-[#7EC896] flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified Workfolio Records
                        </p>
                        <ul className="mt-1 space-y-1 text-[#F5F2EB]/90">
                          {msg.verifiedDataPoints.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Interpretation */}
                    {msg.aiInterpretation && msg.aiInterpretation.length > 0 && (
                      <div className="mt-2 rounded border border-[#544126] bg-[#332717] p-3 text-[11px]">
                        <p className="font-semibold text-[#D9B263] flex items-center gap-1">
                          <Sparkles size={12} /> AI Interpretation
                        </p>
                        <ul className="mt-1 space-y-1 text-[#F5F2EB]/90">
                          {msg.aiInterpretation.map((pt, i) => (
                            <li key={i}>• {pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Supporting Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-[#29302A]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#C1A05B] mb-1.5">
                          Supporting Sources:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-[#202420] border border-[#29302A] px-2 py-0.5 text-[10px] text-[#A0A5A0]"
                            >
                              <span className="uppercase text-[#C1A05B] font-medium">{src.type}:</span>
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#202420] text-[#F5F2EB] border border-[#29302A]">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#202420] text-[#C1A05B] border border-[#29302A]">
                <Bot size={14} />
              </div>
              <div className="flex items-center gap-2 rounded border border-[#29302A] bg-[#171A17] px-4 py-2.5 text-xs text-[#A0A5A0]">
                <RefreshCw className="animate-spin text-[#C1A05B]" size={14} />
                <span>Executing controlled Workfolio tool query...</span>
              </div>
            </div>
          )}
        </div>

        {/* PROMPT STARTERS */}
        <div className="border-t border-[#29302A] bg-[#171A17] p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((promptText) => (
              <button
                key={promptText}
                onClick={() => handleSend(promptText)}
                className="rounded border border-[#29302A] bg-[#111311] px-2.5 py-1 text-[11px] text-[#A0A5A0] hover:border-[#C1A05B] hover:text-[#F5F2EB] transition-colors cursor-pointer"
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
              className="flex-1 rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#555] focus:border-[#C1A05B] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex h-9 w-9 items-center justify-center rounded bg-[#C1A05B] text-[#111311] hover:bg-[#D4AF37] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
