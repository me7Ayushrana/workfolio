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
  Sparkles,
  GitCommit,
  GitPullRequest,
  Lock,
  X,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers,
  Flame,
  Check
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function AISettings() {
  const {
    geminiConfig,
    groqConfig,
    aiPrimaryProvider,
    aiFallbackEnabled,
    aiUsageMetrics,
    updateAIProviderConfig,
    setAIPrimaryProvider,
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
  const [activeTab, setActiveTab] = useState<'keys' | 'failover' | 'github'>('keys')

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
      setStatusMessage({ type: 'error', text: `Gemini Verification Failed: ${result.message}` })
    }
  }

  const handleTestGroq = async () => {
    setTestingGroq(true)
    setStatusMessage(null)
    const result = await testAIProviderConnection('groq', groqKey, groqConfig.defaultModel)
    setTestingGroq(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Groq LPU API Key verified and active!' })
    } else {
      setStatusMessage({ type: 'error', text: `Groq Verification Failed: ${result.message}` })
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
      text: `Created draft evidence from GitHub event "${act.title}". Review under Log Activity.`
    })
  }

  return (
    <div className="space-y-10 text-[#f3eee4]">
      
      {/* PAGE HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-[#c1a05b]/30 bg-gradient-to-r from-[#0d0e15] via-[#121422] to-[#0d0e15] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c1a05b]/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#c1a05b]/20 border border-[#c1a05b]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                EXECUTIVE INTELLIGENCE VAULT
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={12} /> 100% Private BYOK Vault
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl mt-3">
              AI Providers & Engineering Integration
            </h1>
            <p className="text-sm text-[#f3eee4]/75 mt-2 max-w-2xl leading-relaxed">
              Integrate free developer API keys below to power Natural Language Activity Logging, Ask Workfolio RAG Assistant, Weekly Reflections, and GitHub Engineering Sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 rounded-2xl border border-[#c1a05b] bg-[#c1a05b]/10 px-5 py-3 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all shadow-lg cursor-pointer"
            >
              <Info size={16} />
              <span>KEY INTEGRATION GUIDE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTION REQUIRED BANNER (IF DISCONNECTED) */}
      {!hasActiveKey && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#121422] to-[#0d0e15] p-6 shadow-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold text-xl border border-amber-500/30">
              ⚡
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-amber-100 text-base">Action Required: Integrate Your API Key Right Now</h3>
                <span className="rounded-full bg-red-500/20 border border-red-500/30 px-3 py-0.5 text-[11px] font-bold text-red-400 animate-pulse">
                  🔴 AI Features Disconnected
                </span>
              </div>
              <p className="text-xs text-[#f3eee4]/85 mt-1.5 leading-relaxed">
                Workfolio uses a <strong>Bring Your Own Key (BYOK)</strong> architecture. Your key is stored securely in your browser's private vault with zero subscription fees. Connect your free <strong>Google Gemini API Key</strong> or <strong>Groq API Key</strong> below to activate AI features.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 border-t border-white/10 pt-4 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#c1a05b]" />
              <div>
                <div className="font-bold text-white text-[11px]">Natural Language Log</div>
                <div className="text-[10px] text-[#f3eee4]/60">Parses thoughts into work tags</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <Bot size={16} className="text-[#c1a05b]" />
              <div>
                <div className="font-bold text-white text-[11px]">Ask Workfolio Assistant</div>
                <div className="text-[10px] text-[#f3eee4]/60">Answers past activity queries</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <RefreshCw size={16} className="text-[#c1a05b]" />
              <div>
                <div className="font-bold text-white text-[11px]">Weekly Reflections</div>
                <div className="text-[10px] text-[#f3eee4]/60">Synthesizes journal insights</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-bold shadow-xl ${
            statusMessage.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
              : 'border-red-500/40 bg-red-950/40 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* DETAILED KEY USAGE & PURPOSE MATRIX CARD */}
      <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-7 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c1a05b]/20 text-[#c1a05b] font-bold">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">KEY PURPOSE & CAPABILITIES MATRIX</h3>
              <p className="text-xs text-[#f3eee4]/60">Understand exactly what each integrated key provides for your workspace</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* GEMINI CARD */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-[#10121a] to-[#10121a] p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Sparkles size={16} /> Google Gemini Key
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% FREE
              </span>
            </div>
            <p className="text-xs text-[#f3eee4]/80 leading-relaxed">
              <strong>Usage:</strong> Powers Natural Language Activity Capture, Weekly Journal Reflections, and Project Case Study Generation.
            </p>
            <div className="text-[11px] text-[#f3eee4]/60 space-y-1">
              <div>• Free tier from Google AI Studio</div>
              <div>• Deep reasoning & structured JSON schemas</div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c1a05b] hover:underline pt-2"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* GROQ CARD */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-[#10121a] to-[#10121a] p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 text-sm flex items-center gap-1.5">
                <Zap size={16} /> Groq LPU Key
              </span>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                100% FREE
              </span>
            </div>
            <p className="text-xs text-[#f3eee4]/80 leading-relaxed">
              <strong>Usage:</strong> Powers persistent Ask Workfolio AI RAG assistant and ultra-fast sub-500ms text completions.
            </p>
            <div className="text-[11px] text-[#f3eee4]/60 space-y-1">
              <div>• Free key at Groq Console</div>
              <div>• Llama 3.3 70B model on LPU hardware</div>
            </div>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c1a05b] hover:underline pt-2"
            >
              <span>Get Free Key at Groq Console</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* GITHUB CARD */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 via-[#10121a] to-[#10121a] p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
                <Github size={16} /> GitHub Token / Username
              </span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                INCLUDED
              </span>
            </div>
            <p className="text-xs text-[#f3eee4]/80 leading-relaxed">
              <strong>Usage:</strong> Observes real-world Git commits, PRs, and releases, converting them into verifiable evidence drafts.
            </p>
            <div className="text-[11px] text-[#f3eee4]/60 space-y-1">
              <div>• Built-in with public GitHub account</div>
              <div>• 1-Click "Add as Evidence" generation</div>
            </div>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c1a05b] hover:underline pt-2"
            >
              <span>Manage GitHub Settings</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* CURE FOR EXPIRED KEYS & FAILOVER PROTECTION SECTION */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#0d0e15] to-[#0d0e15] p-7 shadow-2xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">KEY EXPIRATION & AUTOMATIC FAILOVER PROTECTION</h3>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-400">
                🛡️ Continuous Uptime Safeguard
              </span>
            </div>
            <p className="text-xs text-[#f3eee4]/80 mt-1.5 leading-relaxed">
              <strong>What happens if your Gemini or Groq API key expires or hits daily rate limits?</strong> Workfolio features an intelligent Task Router with automatic failover. If one key returns an error or quota limit (HTTP 429), traffic automatically switches to your secondary free key without interrupting your session.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-white/10 pt-4 text-xs">
          <div className="rounded-2xl border border-white/10 bg-[#10121a] p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Primary AI Provider</div>
              <div className="text-[11px] text-[#f3eee4]/60">Currently selected engine</div>
            </div>
            <select
              value={aiPrimaryProvider}
              onChange={(e) => setAIPrimaryProvider(e.target.value as any)}
              className="rounded-xl border border-white/20 bg-[#0b0c14] px-3 py-1.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none"
            >
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq LPU</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#10121a] p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Quota Failover Cure</div>
              <div className="text-[11px] text-emerald-400">Auto-switch provider on error</div>
            </div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-400">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* AI PROVIDER CONFIGURATION CARDS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* GOOGLE GEMINI */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-[#10121a] to-[#0d0e15] p-7 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-lg">
                G
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Gemini Provider</h3>
                <span className="text-xs text-[#f3eee4]/60">Multimodal & Reflection Engine</span>
              </div>
            </div>

            {/* STATUS BEACON */}
            {isGeminiActive ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-1 text-[11px] font-bold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3.5 py-1 text-[11px] font-bold text-red-300">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse"></span>
                UNCONFIGURED
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#f3eee4]/90 mb-2">
              <label>Gemini API Key</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#c1a05b] hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
              />
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="flex items-center gap-2 rounded-2xl border border-[#c1a05b] bg-[#c1a05b]/10 px-5 py-3 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer shadow-lg"
              >
                {testingGemini ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#f3eee4]/90 block mb-2">Model Selection</label>
            <select
              value={geminiConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('gemini', { defaultModel: e.target.value })}
              className="w-full rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Structured - Recommended)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning & Multimodal)</option>
            </select>
          </div>
        </div>

        {/* GROQ PROVIDER */}
        <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 via-[#10121a] to-[#0d0e15] p-7 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 text-lg">
                Q
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Groq LPU Provider</h3>
                <span className="text-xs text-[#f3eee4]/60">Ultra-Low Latency Inference</span>
              </div>
            </div>

            {/* STATUS BEACON */}
            {isGroqActive ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3.5 py-1 text-[11px] font-bold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3.5 py-1 text-[11px] font-bold text-red-300">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse"></span>
                UNCONFIGURED
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#f3eee4]/90 mb-2">
              <label>Groq API Key</label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[#c1a05b] hover:underline flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
              />
              <button
                onClick={handleTestGroq}
                disabled={testingGroq}
                className="flex items-center gap-2 rounded-2xl border border-[#c1a05b] bg-[#c1a05b]/10 px-5 py-3 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer shadow-lg"
              >
                {testingGroq ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#f3eee4]/90 block mb-2">Model Selection</label>
            <select
              value={groqConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('groq', { defaultModel: e.target.value })}
              className="w-full rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* GITHUB INTEGRATION CARD */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-[#10121a] to-[#0d0e15] p-7 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              <Github size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Engineering Intelligence</h3>
              <p className="text-xs text-[#f3eee4]/60">
                Observes commits, PRs, issues & releases to generate evidence drafts
              </p>
            </div>
          </div>
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-[#c1a05b] hover:underline"
          >
            <span>GitHub Tokens</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-bold text-[#f3eee4]/90 block mb-2">GitHub Username</label>
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white focus:border-[#c1a05b] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#f3eee4]/90 block mb-2">Personal Access Token (Optional)</label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full rounded-2xl border border-white/15 bg-[#0b0c14] px-4 py-3 text-xs text-white placeholder:text-white/30 focus:border-[#c1a05b] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGithub}
              className="w-full rounded-2xl border border-[#c1a05b] bg-[#c1a05b] px-5 py-3 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {syncingGithub ? <RefreshCw size={15} className="animate-spin" /> : <RefreshCw size={15} />}
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

          <div className="space-y-3">
            {observedActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0c14] p-4 text-xs transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  {act.type === 'COMMIT' ? (
                    <GitCommit size={20} className="text-emerald-400" />
                  ) : (
                    <GitPullRequest size={20} className="text-sky-400" />
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
                  className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-3.5 py-2 text-[11px] font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all cursor-pointer shadow-md"
                >
                  <Sparkles size={13} />
                  <span>ADD AS EVIDENCE</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MASTER KEY INTEGRATION GUIDE MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl border border-[#c1a05b]/40 bg-[#0d0e15] p-7 text-[#f3eee4] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c1a05b] text-[#0c1612] font-bold">
                  <Info size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Master Key Integration & Capability Guide</h3>
                  <p className="text-xs text-[#f3eee4]/60">Workfolio Bring Your Own Key (BYOK) Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-[#f3eee4]/60 hover:text-white p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5 text-xs leading-relaxed">
              <div className="rounded-2xl border border-white/10 bg-[#141622] p-5 space-y-2">
                <h4 className="font-bold text-[#c1a05b] flex items-center gap-2 text-sm">
                  <Lock size={16} /> 1. What is BYOK and Why is it Secure?
                </h4>
                <p className="text-[#f3eee4]/85">
                  Workfolio stores API keys strictly in your local browser state. Keys are never transmitted to any third-party database. You retain 100% control, enjoy unlimited usage, and pay zero monthly platform subscriptions.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                  <h5 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                    <Sparkles size={14} /> Google Gemini Key
                  </h5>
                  <p className="text-[11px] text-[#f3eee4]/80">
                    Powers Natural Language Activity Capture, Weekly Journal Reflections, and Project Case Study Generation.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline pt-1"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
                  <h5 className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                    <Zap size={14} /> Groq Key
                  </h5>
                  <p className="text-[11px] text-[#f3eee4]/80">
                    Powers sub-500ms Ask Workfolio assistant Q&A responses running Llama 3.3 70B.
                  </p>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline pt-1"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2">
                  <h5 className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                    <Github size={14} /> GitHub Intelligence
                  </h5>
                  <p className="text-[11px] text-[#f3eee4]/80">
                    Observes Git commits, PRs, and issues to generate evidence drafts with 1-click.
                  </p>
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c1a05b] hover:underline pt-1"
                  >
                    <span>GitHub Tokens</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <ShieldCheck size={16} /> 2. Key Expiration & Backup Protection
                </h4>
                <p className="text-[#f3eee4]/85 text-xs">
                  If your Gemini key hits daily quota limits, Workfolio automatically fails over to your Groq LPU key without interrupting your work session. Having both keys integrated ensures 100% continuous uptime!
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => setShowInfoModal(false)}
                className="rounded-2xl bg-[#c1a05b] px-6 py-2.5 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c] cursor-pointer"
              >
                GOT IT, CLOSE GUIDE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
