'use client'

import { useState } from 'react'
import {
  Key,
  Bot,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Github,
  ExternalLink,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitCommit,
  GitPullRequest,
  Lock,
  X,
  ArrowRight
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function AISettings() {
  const {
    geminiConfig,
    groqConfig,
    aiPrimaryProvider,
    aiUsageMetrics,
    updateAIProviderConfig,
    testAIProviderConnection,
    githubUsername,
    observedActivities,
    syncGitHubData,
    addPendingDraft
  } = useWorkfolio()

  const [geminiKey, setGeminiKey] = useState(geminiConfig.apiKey || '')
  const [groqKey, setGroqKey] = useState(groqConfig.apiKey || '')
  const [githubUser, setGithubUser] = useState(githubUsername || 'me7Ayushrana')
  const [githubToken, setGithubToken] = useState('')

  const [testingGemini, setTestingGemini] = useState(false)
  const [testingGroq, setTestingGroq] = useState(false)
  const [syncingGithub, setSyncingGithub] = useState(false)

  const [showInfoModal, setShowInfoModal] = useState(false)
  const [activeInfoTopic, setActiveInfoTopic] = useState<'gemini' | 'groq' | 'general' | null>(null)

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isGeminiActive = geminiConfig.status === 'active'
  const isGroqActive = groqConfig.status === 'active'
  const hasActiveKey = isGeminiActive || isGroqActive

  const handleTestGemini = async () => {
    setTestingGemini(true)
    setStatusMessage(null)
    const result = await testAIProviderConnection('gemini', geminiKey, geminiConfig.defaultModel)
    setTestingGemini(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Google Gemini API Key verified and active!' })
    } else {
      setStatusMessage({ type: 'error', text: `Gemini Key Verification Failed: ${result.message}` })
    }
  }

  const handleTestGroq = async () => {
    setTestingGroq(true)
    setStatusMessage(null)
    const result = await testAIProviderConnection('groq', groqKey, groqConfig.defaultModel)
    setTestingGroq(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Groq API Key verified and active!' })
    } else {
      setStatusMessage({ type: 'error', text: `Groq Key Verification Failed: ${result.message}` })
    }
  }

  const handleSyncGitHub = async () => {
    setSyncingGithub(true)
    setStatusMessage(null)
    const result = await syncGitHubData(githubUser, githubToken)
    setSyncingGithub(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message })
    } else {
      setStatusMessage({ type: 'error', text: result.message })
    }
  }

  const handleConvertGitHubToDraft = (act: (typeof observedActivities)[0]) => {
    addPendingDraft({
      type: 'GITHUB_EVENT',
      rawPrompt: `GitHub Observed Event: ${act.title}`,
      payload: {
        work: `Shipped engineering update via GitHub: ${act.title}`,
        learning: `Updated codebase repository ${act.repoName}.`,
        evidenceTitle: act.title,
        evidenceUrl: act.repoUrl,
        type: 'SHIP',
        durationMinutes: 60
      },
      providerUsed: aiPrimaryProvider
    })
    setStatusMessage({
      type: 'success',
      text: `Created draft evidence from GitHub event "${act.title}". Please review under Log Activity.`
    })
  }

  return (
    <div className="space-y-8 text-[#f3eee4]">
      {/* PAGE HEADER */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                SYSTEM ARCHITECTURE
              </span>
              <button
                onClick={() => setShowInfoModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline"
              >
                <Info size={13} />
                <span>Why integrate keys?</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl mt-1">
              AI Providers & Engineering Integrations
            </h1>
            <p className="text-xs text-[#f3eee4]/70 mt-1 max-w-2xl">
              Connect your Google Gemini or Groq keys below to activate natural language activity capture, persistent AI assistant, and weekly reflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-3.5 py-2 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all"
            >
              <Info size={15} />
              <span>Key Integration Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* REQUIRED API KEY WARNING BANNER (IF NO KEYS ACTIVE) */}
      {!hasActiveKey && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#10121a] to-[#10121a] p-5 shadow-xl text-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
              ⚡
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-200 text-sm">Action Required: Integrate your AI Key</h3>
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                  🔴 Disconnected
                </span>
              </div>
              <p className="text-[#f3eee4]/80 mt-1 leading-relaxed">
                Workfolio AI operates on a Bring Your Own Key (BYOK) architecture for 100% privacy and zero subscription fees. Please integrate either a <strong>Google Gemini API Key</strong> or a <strong>Groq API Key</strong> below to unlock all AI capabilities.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-3 text-[11px]">
            <span className="font-bold text-[#c1a05b]">What you unlock:</span>
            <span className="flex items-center gap-1 text-[#f3eee4]/70">
              <Sparkles size={12} className="text-[#c1a05b]" /> Natural Language Log Capture
            </span>
            <span className="flex items-center gap-1 text-[#f3eee4]/70">
              <Bot size={12} className="text-[#c1a05b]" /> Persistent Ask Workfolio Assistant
            </span>
            <span className="flex items-center gap-1 text-[#f3eee4]/70">
              <RefreshCw size={12} className="text-[#c1a05b]" /> Weekly Journal Reflections
            </span>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-bold shadow-lg ${
            statusMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
              : 'border-red-500/30 bg-red-950/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* METRICS DASHBOARD */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Total AI Executions
          </div>
          <div className="mt-2 text-3xl font-bold text-[#c1a05b]">{aiUsageMetrics.totalCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Executed via REST API</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Tokens Processed
          </div>
          <div className="mt-2 text-3xl font-bold text-white">
            {aiUsageMetrics.totalTokens.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Structured JSON payloads</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Gemini Executions
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">{aiUsageMetrics.geminiCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">gemini-1.5-flash / pro</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/50">
            Groq Executions
          </div>
          <div className="mt-2 text-3xl font-bold text-sky-400">{aiUsageMetrics.groqCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">llama-3.3-70b-versatile</div>
        </div>
      </div>

      {/* AI PROVIDER CONFIGURATION CARDS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* GOOGLE GEMINI */}
        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Google Gemini Provider</h3>
                  <button
                    onClick={() => setActiveInfoTopic(activeInfoTopic === 'gemini' ? null : 'gemini')}
                    className="text-[#c1a05b] hover:opacity-80"
                    title="Gemini Info"
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className="text-[11px] text-[#f3eee4]/60">Primary Multimodal & Reflection Engine</span>
              </div>
            </div>

            {/* STATUS BEACON */}
            {isGeminiActive ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                UNCONFIGURED
              </span>
            )}
          </div>

          {activeInfoTopic === 'gemini' && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info size={14} /> About Google Gemini API Key
              </div>
              <p className="text-[11px] text-[#f3eee4]/80 leading-relaxed">
                Google Gemini provides free tier API keys for personal developer use. It powers Workfolio's structured activity parsing, weekly reflections, and complex reasoning.
              </p>
              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#c1a05b] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Get Free Key at Google AI Studio</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#f3eee4]/80 mb-1.5">
              <label>Gemini API Key</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#c1a05b] hover:underline flex items-center gap-1"
              >
                <span>Get Key</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
              />
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b] bg-[#c1a05b]/10 px-4 py-2.5 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer"
              >
                {testingGemini ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/80 block mb-1.5">Model Selection</label>
            <select
              value={geminiConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('gemini', { defaultModel: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Structured - Recommended)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning & Multimodal)</option>
            </select>
          </div>
        </div>

        {/* GROQ PROVIDER */}
        <div className="rounded-2xl border border-white/10 bg-[#10121a] p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                Q
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Groq LPU Provider</h3>
                  <button
                    onClick={() => setActiveInfoTopic(activeInfoTopic === 'groq' ? null : 'groq')}
                    className="text-[#c1a05b] hover:opacity-80"
                    title="Groq Info"
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className="text-[11px] text-[#f3eee4]/60">Ultra-Low Latency Text Inference</span>
              </div>
            </div>

            {/* STATUS BEACON */}
            {isGroqActive ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                UNCONFIGURED
              </span>
            )}
          </div>

          {activeInfoTopic === 'groq' && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4 text-xs text-sky-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info size={14} /> About Groq API Key
              </div>
              <p className="text-[11px] text-[#f3eee4]/80 leading-relaxed">
                Groq operates custom LPU hardware delivering near-instant token generation. It powers ultra-fast Ask Workfolio answers and fast classification. Free keys available at Groq Console.
              </p>
              <div className="pt-1">
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#c1a05b] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Get Free Key at Groq Console</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#f3eee4]/80 mb-1.5">
              <label>Groq API Key</label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[#c1a05b] hover:underline flex items-center gap-1"
              >
                <span>Get Key</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
              />
              <button
                onClick={handleTestGroq}
                disabled={testingGroq}
                className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b] bg-[#c1a05b]/10 px-4 py-2.5 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer"
              >
                {testingGroq ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/80 block mb-1.5">Model Selection</label>
            <select
              value={groqConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('groq', { defaultModel: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* GITHUB INTEGRATION CARD */}
      <div className="rounded-2xl border border-white/10 bg-[#10121a] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
              <Github size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Engineering Intelligence</h3>
              <p className="text-xs text-[#f3eee4]/60">
                Automatically observes commits, PRs, issues & releases to generate draft evidence items
              </p>
            </div>
          </div>
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline"
          >
            <span>GitHub Tokens</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/80 block mb-1.5">GitHub Username</label>
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/80 block mb-1.5">
              Personal Access Token (Optional)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full rounded-xl border border-white/15 bg-[#0b0c14] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGithub}
              className="w-full rounded-xl border border-[#c1a05b] bg-[#c1a05b] px-5 py-2.5 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {syncingGithub ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>SYNC GITHUB ACTIVITY</span>
            </button>
          </div>
        </div>

        {/* OBSERVED ACTIVITIES FEED */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
              Observed Engineering Activity ({observedActivities.length})
            </h4>
            <span className="text-[10px] text-[#f3eee4]/50">Click "Add as Evidence" to convert commit into draft</span>
          </div>

          <div className="space-y-2.5">
            {observedActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b0c14] p-4 text-xs transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  {act.type === 'COMMIT' ? (
                    <GitCommit size={18} className="text-emerald-400" />
                  ) : (
                    <GitPullRequest size={18} className="text-sky-400" />
                  )}
                  <div>
                    <div className="font-bold text-white">{act.title}</div>
                    <div className="text-[11px] text-[#f3eee4]/60 mt-0.5">
                      {act.repoName} • {act.date} {act.details ? `• ${act.details}` : ''}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleConvertGitHubToDraft(act)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-3 py-1.5 text-[11px] font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>ADD AS EVIDENCE</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KEY INTEGRATION INFORMATION MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-[#c1a05b]/30 bg-[#0d0e15] p-6 text-[#f3eee4] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c1a05b] text-[#0c1612] font-bold">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Why & How to Integrate AI Keys</h3>
                  <p className="text-xs text-[#f3eee4]/60">Workfolio BYOK (Bring Your Own Key) Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-[#f3eee4]/60 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="rounded-xl border border-white/10 bg-[#141622] p-4 space-y-2">
                <h4 className="font-bold text-[#c1a05b] flex items-center gap-1.5 text-sm">
                  <Lock size={15} /> 1. Why Bring Your Own Key?
                </h4>
                <p className="text-[#f3eee4]/80">
                  Workfolio stores your API keys only in your browser's private state/localStorage. Keys are never logged or sold. This gives you 100% control, 0 monthly subscriptions, and unlimited AI usage.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                  <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles size={14} /> Google Gemini Key
                  </h5>
                  <p className="text-[11px] text-[#f3eee4]/80">
                    Powers structured work activity parsing, weekly reflections, and deep project reasoning.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline pt-1"
                  >
                    <span>Get Free Key at Google AI Studio</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-2">
                  <h5 className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Zap size={14} /> Groq Key
                  </h5>
                  <p className="text-[11px] text-[#f3eee4]/80">
                    Powers ultra-fast LPU inference for instant Ask Workfolio assistant responses and classification.
                  </p>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline pt-1"
                  >
                    <span>Get Free Key at Groq Console</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#141622] p-4 space-y-2">
                <h4 className="font-bold text-white text-xs">How to activate in 3 simple steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[#f3eee4]/80 text-[11px]">
                  <li>Click <strong>Get Key</strong> to generate a free API key at Google AI Studio or Groq Console.</li>
                  <li>Paste the key into the API Key field above.</li>
                  <li>Click <strong>TEST</strong>. When the beacon light turns 🟢 <strong>ACTIVE</strong>, your key is ready!</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => setShowInfoModal(false)}
                className="rounded-xl bg-[#c1a05b] px-5 py-2 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c]"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
