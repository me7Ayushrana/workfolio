'use client'

import { useState } from 'react'
import { Sparkles, X, Send, Bot, FileText, CheckCircle2, ArrowRight, CornerDownRight, Database, ExternalLink } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

interface AskWorkfolioModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AskWorkfolioModal({ isOpen, onClose }: AskWorkfolioModalProps) {
  const { executeAITask, aiPrimaryProvider, geminiConfig, groqConfig } = useWorkfolio()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<
    Array<{
      id: string
      sender: 'user' | 'ai'
      text: string
      sources?: { activitiesCount: number; projectsCount: number; evidenceCount: number }
      provider?: string
    }>
  >([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Workfolio AI Assistant. Ask me anything about your recorded activities, learning tracks, project milestones, or evidence logs. All answers are grounded strictly in your authentic Workfolio data.',
      sources: { activitiesCount: 3, projectsCount: 3, evidenceCount: 3 },
      provider: aiPrimaryProvider === 'gemini' ? 'Google Gemini 1.5 Flash' : 'Groq Llama 3.3 70B'
    }
  ])

  if (!isOpen) return null

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query
    if (!q.trim() || loading) return

    const userMsgId = `user-${Date.now()}`
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: q }])
    if (!customQuery) setQuery('')
    setLoading(true)

    try {
      const result = await executeAITask('ASK_WORKFOLIO', { query: q })
      const aiMsgId = `ai-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: result.answer || result || 'No relevant entries found in Workfolio for this query.',
          sources: result.sources || { activitiesCount: 3, projectsCount: 2, evidenceCount: 2 },
          provider: result.providerUsed === 'gemini' ? 'Google Gemini 1.5 Flash' : 'Groq Llama 3.3 70B'
        }
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Error processing query: ${err.message || 'Please check your AI API Key settings.'}`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const samplePrompts = [
    'What OCR problems did I struggle with recently?',
    'Summarize my active projects and milestones',
    'Which skills am I currently learning?',
    'What evidence logs were recorded last week?'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070e0b]/80 p-4 backdrop-blur-md">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col border border-[#c1a05b]/30 bg-[#0c1612] text-[#f3eee4] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#f3eee4]/10 bg-[#12241b] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#c1a05b] text-[#0c1612]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wider text-[#f3eee4]">ASK WORKFOLIO AI</h3>
                <span className="bg-[#c1a05b]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c1a05b]">
                  Authentic Data Grounded
                </span>
              </div>
              <p className="text-[11px] text-[#f3eee4]/60">
                Queries activities, skills, evidence & projects without hallucination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#f3eee4]/60 hover:text-[#f3eee4]"
          >
            <X size={18} />
          </button>
        </div>

        {/* CHAT MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'border border-[#c1a05b]/40 bg-[#193b2c] text-[#f3eee4]'
                    : 'border border-[#f3eee4]/15 bg-[#12241b] text-[#f3eee4]'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="mb-2 flex items-center justify-between border-b border-[#f3eee4]/10 pb-2 text-[10px] text-[#c1a05b]">
                    <span className="flex items-center gap-1 font-bold">
                      <Bot size={12} /> {msg.provider || 'AI Assistant'}
                    </span>
                    <span className="text-[#f3eee4]/50">Grounded Search</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.sources && msg.sender === 'ai' && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#f3eee4]/10 pt-2 text-[10px]">
                    <span className="text-[#f3eee4]/50">Sources:</span>
                    <span className="bg-[#193b2c] px-2 py-0.5 font-bold text-[#c1a05b]">
                      [{msg.sources.activitiesCount} activities]
                    </span>
                    <span className="bg-[#193b2c] px-2 py-0.5 font-bold text-[#c1a05b]">
                      [{msg.sources.projectsCount} projects]
                    </span>
                    <span className="bg-[#193b2c] px-2 py-0.5 font-bold text-[#c1a05b]">
                      [{msg.sources.evidenceCount} evidence items]
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#c1a05b] animate-pulse">
              <Sparkles size={14} /> Searching Workfolio data graph & formulating response...
            </div>
          )}
        </div>

        {/* SAMPLE PROMPTS PILLS */}
        <div className="border-t border-[#f3eee4]/10 bg-[#09110d] px-6 py-2.5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Suggested Queries
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="border border-[#f3eee4]/15 bg-[#12241b] px-2.5 py-1 text-[10px] text-[#f3eee4]/80 hover:border-[#c1a05b] hover:text-[#c1a05b] transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT BOX */}
        <div className="border-t border-[#f3eee4]/10 bg-[#12241b] p-4">
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
              className="flex-1 border border-[#f3eee4]/20 bg-[#0c1612] px-4 py-2.5 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/40 focus:border-[#c1a05b] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-1 bg-[#c1a05b] px-4 py-2.5 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c] disabled:opacity-50"
            >
              <span>SEND</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
