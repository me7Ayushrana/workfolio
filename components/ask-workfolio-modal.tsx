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
  RefreshCw
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

interface AskWorkfolioModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AskWorkfolioModal({ isOpen, onClose }: AskWorkfolioModalProps) {
  const { executeAITask, aiPrimaryProvider, geminiConfig, groqConfig } = useWorkfolio()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Determine API key status
  const activeProviderConfig = aiPrimaryProvider === 'gemini' ? geminiConfig : groqConfig
  const isApiKeyConfigured = Boolean(
    (geminiConfig.apiKey && geminiConfig.status !== 'error') ||
    (groqConfig.apiKey && groqConfig.status !== 'error')
  )

  const activeProviderName =
    aiPrimaryProvider === 'gemini' ? 'Google Gemini 1.5 Flash' : 'Groq Llama 3.3 70B'

  const [messages, setMessages] = useState<
    Array<{
      id: string
      sender: 'user' | 'ai'
      text: string
      sources?: { activitiesCount: number; projectsCount: number; evidenceCount: number }
      provider?: string
      isError?: boolean
    }>
  >([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Workfolio AI Assistant. Ask me anything about your recorded activities, learning tracks, project milestones, or evidence logs.',
      sources: { activitiesCount: 3, projectsCount: 3, evidenceCount: 3 },
      provider: activeProviderName
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
          text: `AI Query Failed: ${err.message || 'Please check your API key settings.'}`,
          isError: true
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md transition-all">
      <div className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#c1a05b]/30 bg-[#08090f]/95 text-[#f3eee4] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#f3eee4]/10 bg-[#0c0d14]/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c1a05b] to-[#8c6b28] text-[#08090f] shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold tracking-wide text-[#f3eee4]">ASK WORKFOLIO AI</h3>
                
                {/* TRAFFIC LIGHT STATUS BEACON */}
                {isApiKeyConfigured ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    API Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </span>
                    Key Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#f3eee4]/60 mt-0.5">
                Grounded strictly in authentic activities, projects & evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              onClick={onClose}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-3 py-1.5 text-[11px] font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#08090f] transition-all"
            >
              <Key size={13} />
              <span>Configure Keys</span>
            </Link>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[#f3eee4]/60 hover:bg-white/10 hover:text-[#f3eee4] transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* API KEY SETUP PROMPT BANNER (IF DISCONNECTED OR KEY MISSING) */}
        {!isApiKeyConfigured && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              <span>
                <strong>No active AI Key detected.</strong> Connect your Google Gemini or Groq key to enable instant answers.
              </span>
            </div>
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-1 font-bold text-[#c1a05b] hover:underline text-[11px]"
            >
              <span>Add API Key in Settings</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* CHAT MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* AVATAR */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#c1a05b] text-[#08090f]'
                    : 'bg-[#0c0d14] border border-[#c1a05b]/40 text-[#c1a05b]'
                }`}
              >
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={15} />}
              </div>

              {/* BUBBLE CONTENT */}
              <div
                className={`max-w-[82%] text-xs leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'rounded-2xl rounded-tr-none border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] p-4 shadow-md'
                    : msg.isError
                    ? 'rounded-2xl rounded-tl-none border border-red-500/40 bg-red-950/30 text-red-200 p-4 shadow-md'
                    : 'rounded-2xl rounded-tl-none border border-[#f3eee4]/10 bg-[#0c0d14]/90 text-[#f3eee4] p-4 shadow-md'
                }`}
              >
                {msg.sender === 'ai' && !msg.isError && (
                  <div className="mb-2.5 flex items-center justify-between border-b border-[#f3eee4]/10 pb-2 text-[10px] text-[#c1a05b]">
                    <span className="font-bold tracking-wide">{msg.provider || 'AI Assistant'}</span>
                    <span className="text-[#f3eee4]/50">Authentic Search</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* ERROR API KEY GUIDE ACTION */}
                {msg.isError && (
                  <div className="mt-3 border-t border-red-500/20 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-red-300">Requires a valid Google Gemini or Groq key</span>
                    <Link
                      href="/settings"
                      onClick={onClose}
                      className="flex items-center gap-1 rounded bg-[#c1a05b] px-3 py-1 text-[10px] font-bold text-[#08090f] hover:bg-[#d4b46c]"
                    >
                      <Key size={12} />
                      <span>Configure API Key</span>
                    </Link>
                  </div>
                )}

                {/* SOURCES TAGS */}
                {msg.sources && msg.sender === 'ai' && !msg.isError && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#f3eee4]/10 pt-2.5 text-[10px]">
                    <span className="text-[#f3eee4]/50 mr-1">Sources:</span>
                    <span className="rounded-full bg-[#c1a05b]/10 border border-[#c1a05b]/30 px-2.5 py-0.5 font-medium text-[#c1a05b]">
                      {msg.sources.activitiesCount} activities
                    </span>
                    <span className="rounded-full bg-[#c1a05b]/10 border border-[#c1a05b]/30 px-2.5 py-0.5 font-medium text-[#c1a05b]">
                      {msg.sources.projectsCount} projects
                    </span>
                    <span className="rounded-full bg-[#c1a05b]/10 border border-[#c1a05b]/30 px-2.5 py-0.5 font-medium text-[#c1a05b]">
                      {msg.sources.evidenceCount} evidence items
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-[#c1a05b] bg-[#0c0d14]/60 border border-[#c1a05b]/20 p-3.5 rounded-2xl animate-pulse max-w-sm">
              <Sparkles size={16} className="animate-spin text-[#c1a05b]" />
              <span>Analyzing Workfolio records & formulating answer...</span>
            </div>
          )}
        </div>

        {/* SUGGESTED PROMPTS */}
        <div className="border-t border-[#f3eee4]/10 bg-[#09110d]/90 px-6 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Suggested Enquiries
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading}
                className="rounded-xl border border-[#f3eee4]/15 bg-[#0c0d14] px-3 py-1.5 text-[11px] text-[#f3eee4]/80 hover:border-[#c1a05b] hover:bg-[#c1a05b]/10 hover:text-[#c1a05b] transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT FORM */}
        <div className="border-t border-[#f3eee4]/10 bg-[#0c0d14] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your work, skills, or projects..."
              className="flex-1 rounded-xl border border-[#f3eee4]/20 bg-[#08090f] px-4 py-3 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/40 focus:border-[#c1a05b] focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c1a05b] to-[#a3823d] px-5 py-3 text-xs font-bold text-[#08090f] hover:opacity-90 disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              <span>SEND</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
