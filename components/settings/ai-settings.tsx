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
  Cpu,
  Layers,
  BarChart3,
  GitCommit,
  GitPullRequest,
  Check,
  Sparkles
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'
import { AIProviderId } from '@/lib/ai/types'

export function AISettings() {
  const {
    geminiConfig,
    groqConfig,
    aiPrimaryProvider,
    byokEnabled,
    aiUsageMetrics,
    updateAIProviderConfig,
    updateBYOKMode,
    setAIPrimaryProvider,
    testAIProviderConnection,
    githubConnected,
    githubUsername,
    githubRepos,
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

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleTestGemini = async () => {
    setTestingGemini(true)
    setStatusMessage(null)
    const result = await testAIProviderConnection('gemini', geminiKey, geminiConfig.defaultModel)
    setTestingGemini(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Google Gemini API key verified successfully!' })
    } else {
      setStatusMessage({ type: 'error', text: `Gemini verification failed: ${result.message}` })
    }
  }

  const handleTestGroq = async () => {
    setTestingGroq(true)
    setStatusMessage(null)
    const result = await testAIProviderConnection('groq', groqKey, groqConfig.defaultModel)
    setTestingGroq(false)
    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Groq API key verified successfully!' })
    } else {
      setStatusMessage({ type: 'error', text: `Groq verification failed: ${result.message}` })
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
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="border-b border-[#f3eee4]/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
              SYSTEM CONFIGURATION
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#f3eee4] md:text-2xl mt-1">
              AI & GitHub Integration Architecture
            </h1>
            <p className="text-xs text-[#f3eee4]/70 mt-1 max-w-2xl">
              Configure Bring Your Own Key (BYOK) providers, official key links, model routing, and automatic GitHub engineering activity sync.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-[#c1a05b]/40 bg-[#12241b] px-3 py-1.5 text-xs text-[#c1a05b]">
            <ShieldCheck size={16} />
            <span className="font-bold">BYOK Key Vault Protected</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-3 border p-4 text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'border-[#26513d] bg-[#12241b] text-[#86efac]'
              : 'border-[#991b1b] bg-[#450a0a] text-[#fca5a5]'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* METRICS & ROUTER STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/60">
            Total AI Calls
          </div>
          <div className="mt-1 text-2xl font-bold text-[#c1a05b]">{aiUsageMetrics.totalCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Executed via REST endpoints</div>
        </div>

        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/60">
            Estimated Tokens
          </div>
          <div className="mt-1 text-2xl font-bold text-[#f3eee4]">
            {aiUsageMetrics.totalTokens.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Structured JSON outputs</div>
        </div>

        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/60">
            Gemini Executions
          </div>
          <div className="mt-1 text-2xl font-bold text-[#86efac]">{aiUsageMetrics.geminiCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Gemini 1.5 Flash / Pro</div>
        </div>

        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/60">
            Groq Executions
          </div>
          <div className="mt-1 text-2xl font-bold text-[#93c5fd]">{aiUsageMetrics.groqCalls}</div>
          <div className="mt-1 text-[10px] text-[#f3eee4]/50">Llama 3.3 70B Versatile</div>
        </div>
      </div>

      {/* AI PROVIDER CONFIGURATIONS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* GOOGLE GEMINI */}
        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee4]/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-[#86efac]/10 text-[#86efac] font-bold">
                G
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f3eee4]">Google Gemini Provider</h3>
                <span className="text-[10px] text-[#f3eee4]/60">Primary Multimodal & Reflection Engine</span>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-[#c1a05b] hover:underline"
            >
              <span>Get Key</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">API Key</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
              />
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="flex items-center gap-1 border border-[#c1a05b] bg-[#c1a05b]/10 px-3 py-2 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all"
              >
                {testingGemini ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">Default Model</label>
            <select
              value={geminiConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('gemini', { defaultModel: e.target.value })}
              className="mt-1 w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Structured)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning & Multimodal)</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-[#f3eee4]/10 pt-3">
            <span className="text-[#f3eee4]/60">Status:</span>
            <span
              className={`font-bold ${
                geminiConfig.status === 'active'
                  ? 'text-[#86efac]'
                  : geminiConfig.status === 'error'
                  ? 'text-[#fca5a5]'
                  : 'text-[#f3eee4]/50'
              }`}
            >
              {geminiConfig.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* GROQ PROVIDER */}
        <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee4]/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-[#93c5fd]/10 text-[#93c5fd] font-bold">
                Q
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f3eee4]">Groq LPU Provider</h3>
                <span className="text-[10px] text-[#f3eee4]/60">Ultra-Low Latency Inference</span>
              </div>
            </div>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-[#c1a05b] hover:underline"
            >
              <span>Get Key</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">API Key</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
              />
              <button
                onClick={handleTestGroq}
                disabled={testingGroq}
                className="flex items-center gap-1 border border-[#c1a05b] bg-[#c1a05b]/10 px-3 py-2 text-xs font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all"
              >
                {testingGroq ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>TEST</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">Default Model</label>
            <select
              value={groqConfig.defaultModel}
              onChange={(e) => updateAIProviderConfig('groq', { defaultModel: e.target.value })}
              className="mt-1 w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-[#f3eee4]/10 pt-3">
            <span className="text-[#f3eee4]/60">Status:</span>
            <span
              className={`font-bold ${
                groqConfig.status === 'active'
                  ? 'text-[#86efac]'
                  : groqConfig.status === 'error'
                  ? 'text-[#fca5a5]'
                  : 'text-[#f3eee4]/50'
              }`}
            >
              {groqConfig.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* GITHUB INTEGRATION */}
      <div className="border border-[#f3eee4]/15 bg-[#0c1612] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#f3eee4]/10 pb-4">
          <div className="flex items-center gap-3">
            <Github size={24} className="text-[#c1a05b]" />
            <div>
              <h3 className="text-base font-bold text-[#f3eee4]">GitHub Engineering Intelligence</h3>
              <p className="text-xs text-[#f3eee4]/60">
                Observes commits, PRs, issues, and releases to populate Workfolio Evidence Vault drafts
              </p>
            </div>
          </div>
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-[#c1a05b] hover:underline"
          >
            <span>GitHub Tokens</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">GitHub Username</label>
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="mt-1 w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#f3eee4]/70">Personal Access Token (Optional)</label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="mt-1 w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGithub}
              className="w-full border border-[#c1a05b] bg-[#c1a05b] px-4 py-2 text-xs font-bold text-[#0c1612] hover:bg-[#d4b46c] transition-all flex items-center justify-center gap-2"
            >
              {syncingGithub ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>SYNC GITHUB ACTIVITY</span>
            </button>
          </div>
        </div>

        {/* OBSERVED ACTIVITIES FEED */}
        <div className="space-y-3 pt-4 border-t border-[#f3eee4]/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
              Observed Engineering Activity ({observedActivities.length})
            </h4>
            <span className="text-[10px] text-[#f3eee4]/50">Click "Add as Evidence" to turn commit into draft</span>
          </div>

          <div className="space-y-2">
            {observedActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between border border-[#f3eee4]/10 bg-[#12241b] p-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {act.type === 'COMMIT' ? (
                    <GitCommit size={16} className="text-[#86efac]" />
                  ) : (
                    <GitPullRequest size={16} className="text-[#93c5fd]" />
                  )}
                  <div>
                    <div className="font-bold text-[#f3eee4]">{act.title}</div>
                    <div className="text-[10px] text-[#f3eee4]/60">
                      {act.repoName} • {act.date} {act.details ? `• ${act.details}` : ''}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleConvertGitHubToDraft(act)}
                  className="flex items-center gap-1 border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-2.5 py-1 text-[10px] font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-all"
                >
                  <Sparkles size={11} />
                  <span>ADD AS EVIDENCE</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
