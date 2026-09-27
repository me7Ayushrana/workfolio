'use client'

import { useState, useEffect } from 'react'
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
  Lock,
  Cpu,
  Layers,
  Check,
  ShieldAlert
} from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function AISettings() {
  const {
    aiPrimaryProvider,
    setAIPrimaryProvider,
    githubUsername,
    observedActivities,
    syncGitHubData
  } = useWorkfolio()

  const [systemMode, setSystemMode] = useState<'platform' | 'byok'>('platform')
  const [fallbackEnabled, setFallbackEnabled] = useState(true)

  const [geminiStatus, setGeminiStatus] = useState<{
    configured: boolean
    status: string
    mode: string
    model: string
    message?: string
    lastValidatedAt?: string
  }>({
    configured: false,
    status: 'NOT_CONFIGURED',
    mode: 'platform',
    model: 'gemini-1.5-flash'
  })

  const [groqStatus, setGroqStatus] = useState<{
    configured: boolean
    status: string
    mode: string
    model: string
    message?: string
    lastValidatedAt?: string
  }>({
    configured: false,
    status: 'NOT_CONFIGURED',
    mode: 'platform',
    model: 'llama-3.3-70b-versatile'
  })

  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [groqKeyInput, setGroqKeyInput] = useState('')

  const [testingGemini, setTestingGemini] = useState(false)
  const [testingGroq, setTestingGroq] = useState(false)

  const [githubUser, setGithubUser] = useState(githubUsername || '')
  const [githubToken, setGithubToken] = useState('')
  const [syncingGithub, setSyncingGithub] = useState(false)

  const [activeTab, setActiveTab] = useState<'keys' | 'failover' | 'github'>('keys')
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch true server status on mount
  const refreshAIStatus = async () => {
    try {
      const res = await fetch('/api/ai/status')
      if (res.ok) {
        const data = await res.json()
        setSystemMode(data.mode || 'platform')
        setFallbackEnabled(data.fallbackEnabled !== false)
        if (data.primaryProvider) {
          setAIPrimaryProvider(data.primaryProvider)
        }
        if (data.gemini) {
          setGeminiStatus(data.gemini)
        }
        if (data.groq) {
          setGroqStatus(data.groq)
        }
      }
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    refreshAIStatus()
  }, [])

  const handleTestGemini = async () => {
    const cleanKey = geminiKeyInput.trim()
    setTestingGemini(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/ai/providers/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey, model: geminiStatus.model })
      })
      const data = await res.json()
      setTestingGemini(false)

      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message || 'Google Gemini credential verified & saved to vault.' })
        setGeminiKeyInput('')
        refreshAIStatus()
      } else {
        setStatusMessage({
          type: 'error',
          text: `Gemini Validation Failed [${data.status}]: ${data.message}`
        })
        refreshAIStatus()
      }
    } catch (err: any) {
      setTestingGemini(false)
      setStatusMessage({ type: 'error', text: `Network error validating Gemini key: ${err?.message}` })
    }
  }

  const handleTestGroq = async () => {
    const cleanKey = groqKeyInput.trim()
    setTestingGroq(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/ai/providers/groq/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey, model: groqStatus.model })
      })
      const data = await res.json()
      setTestingGroq(false)

      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message || 'Groq credential verified & saved to vault.' })
        setGroqKeyInput('')
        refreshAIStatus()
      } else {
        setStatusMessage({
          type: 'error',
          text: `Groq Validation Failed [${data.status}]: ${data.message}`
        })
        refreshAIStatus()
      }
    } catch (err: any) {
      setTestingGroq(false)
      setStatusMessage({ type: 'error', text: `Network error validating Groq key: ${err?.message}` })
    }
  }

  const handleUpdatePreferences = async (newPrimary: 'gemini' | 'groq', newFallback: boolean) => {
    setAIPrimaryProvider(newPrimary)
    setFallbackEnabled(newFallback)
    try {
      await fetch('/api/ai/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryProvider: newPrimary, fallbackEnabled: newFallback })
      })
    } catch {
      // Ignore
    }
  }

  const handleSyncGitHub = async () => {
    setSyncingGithub(true)
    setStatusMessage(null)
    try {
      const res = await syncGitHubData(githubUser.trim(), githubToken.trim() || undefined)
      setSyncingGithub(false)
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message || 'GitHub workspace synchronized successfully.' })
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'GitHub sync failed.' })
      }
    } catch (err: any) {
      setSyncingGithub(false)
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to sync with GitHub.' })
    }
  }

  const renderStatusChip = (status: string, mode: string) => {
    switch (status) {
      case 'VALID':
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1B3322] border border-[#2A5236] px-3 py-1 text-xs font-semibold text-[#7EC896]">
            <CheckCircle size={13} />
            Connected ({mode === 'byok' ? 'User BYOK' : 'Platform Env'})
          </span>
        )
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#381818] border border-[#5C2626] px-3 py-1 text-xs font-semibold text-[#E07A7A]">
            <AlertCircle size={13} />
            Invalid API Credential
          </span>
        )
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#332717] border border-[#544126] px-3 py-1 text-xs font-semibold text-[#D9B263]">
            <RefreshCw size={13} />
            Rate Limited / Quota Exceeded
          </span>
        )
      case 'BILLING_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#332717] border border-[#544126] px-3 py-1 text-xs font-semibold text-[#D9B263]">
            <AlertCircle size={13} />
            Billing Action Required
          </span>
        )
      case 'PERMISSION_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#381818] border border-[#5C2626] px-3 py-1 text-xs font-semibold text-[#E07A7A]">
            <ShieldAlert size={13} />
            Permission Denied
          </span>
        )
      case 'NETWORK_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#381818] border border-[#5C2626] px-3 py-1 text-xs font-semibold text-[#E07A7A]">
            <AlertCircle size={13} />
            Network Error
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#222422] border border-[#363A36] px-3 py-1 text-xs font-semibold text-[#A0A5A0]">
            <Info size={13} />
            Unconfigured
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="border-b border-[#29302A] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-[#F5F2EB] tracking-tight">
            AI & Intelligence Configuration
          </h1>
          <p className="text-sm text-[#A0A5A0] mt-1">
            Server-managed AI providers, encryption vaults, and evidence source synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              activeTab === 'keys'
                ? 'bg-[#2A4232] text-[#F5F2EB] border-[#3D5C47]'
                : 'bg-[#171A17] text-[#A0A5A0] border-[#29302A] hover:bg-[#202420]'
            }`}
          >
            AI Providers
          </button>
          <button
            onClick={() => setActiveTab('failover')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              activeTab === 'failover'
                ? 'bg-[#2A4232] text-[#F5F2EB] border-[#3D5C47]'
                : 'bg-[#171A17] text-[#A0A5A0] border-[#29302A] hover:bg-[#202420]'
            }`}
          >
            Routing & Fallback
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'bg-[#2A4232] text-[#F5F2EB] border-[#3D5C47]'
                : 'bg-[#171A17] text-[#A0A5A0] border-[#29302A] hover:bg-[#202420]'
            }`}
          >
            GitHub Sync
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS ALERT */}
      {statusMessage && (
        <div
          className={`p-4 rounded-md border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-[#1B3322] border-[#2A5236] text-[#7EC896]'
              : 'bg-[#381818] border-[#5C2626] text-[#E07A7A]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-current opacity-70 hover:opacity-100 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ARCHITECTURE NOTICE */}
      <div className="bg-[#171A17] border border-[#29302A] rounded-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-[#202420] text-[#C1A05B]">
            <Lock size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#F5F2EB]">
              Mode: {systemMode === 'platform' ? 'Platform Deployment Configuration' : 'User BYOK Vault Active'}
            </div>
            <p className="text-xs text-[#A0A5A0] mt-0.5">
              API keys are handled entirely on the server. Browser requests never touch raw provider secrets.
            </p>
          </div>
        </div>

        <button
          onClick={refreshAIStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#202420] border border-[#29302A] text-xs font-medium text-[#F5F2EB] hover:bg-[#2A302A] transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          Re-check Status
        </button>
      </div>

      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* GOOGLE GEMINI CARD */}
            <div className="bg-[#171A17] border border-[#29302A] rounded-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#29302A] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#F5F2EB]">Google Gemini</h3>
                  <span className="text-xs text-[#A0A5A0]">Multimodal & Structured Analysis</span>
                </div>
                {renderStatusChip(geminiStatus.status, geminiStatus.mode)}
              </div>

              {geminiStatus.message && (
                <div className="text-xs p-3 rounded bg-[#202420] border border-[#29302A] text-[#A0A5A0]">
                  {geminiStatus.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#F5F2EB] mb-1.5">
                    <label className="font-medium">Connect API Key (BYOK)</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C1A05B] hover:underline flex items-center gap-1"
                    >
                      <span>Google AI Studio</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      placeholder="Paste AIzaSy... key to connect"
                      className="flex-1 rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#555] focus:border-[#C1A05B] focus:outline-none"
                    />
                    <button
                      onClick={handleTestGemini}
                      disabled={testingGemini}
                      className="px-4 py-2 rounded bg-[#C1A05B] text-[#111311] text-xs font-semibold hover:bg-[#D4AF37] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {testingGemini ? 'Verifying...' : 'Validate'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#F5F2EB] block mb-1.5">Model</label>
                  <select
                    value={geminiStatus.model}
                    onChange={(e) => setGeminiStatus((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C1A05B] focus:outline-none"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#29302A] pt-4 text-xs space-y-2 text-[#A0A5A0]">
                <div className="font-medium text-[#F5F2EB]">Step-by-Step Instructions:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Navigate to Google AI Studio (aistudio.google.com).</li>
                  <li>Click <strong className="text-[#F5F2EB]">Create API Key</strong>.</li>
                  <li>Copy the key string starting with <code className="text-[#C1A05B]">AIzaSy...</code>.</li>
                  <li>Paste into the input above and click <strong className="text-[#F5F2EB]">Validate</strong>.</li>
                </ol>
              </div>
            </div>

            {/* GROQ CARD */}
            <div className="bg-[#171A17] border border-[#29302A] rounded-md p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#29302A] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-normal text-[#F5F2EB]">Groq LPU</h3>
                  <span className="text-xs text-[#A0A5A0]">High-Speed Llama 3 Inference</span>
                </div>
                {renderStatusChip(groqStatus.status, groqStatus.mode)}
              </div>

              {groqStatus.message && (
                <div className="text-xs p-3 rounded bg-[#202420] border border-[#29302A] text-[#A0A5A0]">
                  {groqStatus.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#F5F2EB] mb-1.5">
                    <label className="font-medium">Connect API Key (BYOK)</label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C1A05B] hover:underline flex items-center gap-1"
                    >
                      <span>Groq Console</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={groqKeyInput}
                      onChange={(e) => setGroqKeyInput(e.target.value)}
                      placeholder="Paste gsk_... key to connect"
                      className="flex-1 rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#555] focus:border-[#C1A05B] focus:outline-none"
                    />
                    <button
                      onClick={handleTestGroq}
                      disabled={testingGroq}
                      className="px-4 py-2 rounded bg-[#C1A05B] text-[#111311] text-xs font-semibold hover:bg-[#D4AF37] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {testingGroq ? 'Verifying...' : 'Validate'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#F5F2EB] block mb-1.5">Model</label>
                  <select
                    value={groqStatus.model}
                    onChange={(e) => setGroqStatus((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C1A05B] focus:outline-none"
                  >
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                    <option value="llama3-8b-8192">llama3-8b-8192 (Ultra Fast)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#29302A] pt-4 text-xs space-y-2 text-[#A0A5A0]">
                <div className="font-medium text-[#F5F2EB]">Step-by-Step Instructions:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Navigate to Groq Console (console.groq.com/keys).</li>
                  <li>Click <strong className="text-[#F5F2EB]">Create API Key</strong>.</li>
                  <li>Copy the key string starting with <code className="text-[#C1A05B]">gsk_...</code>.</li>
                  <li>Paste into the input above and click <strong className="text-[#F5F2EB]">Validate</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'failover' && (
        <div className="bg-[#171A17] border border-[#29302A] rounded-md p-6 space-y-6">
          <div className="border-b border-[#29302A] pb-4">
            <h3 className="font-serif text-lg font-normal text-[#F5F2EB]">Provider Selection & Routing</h3>
            <p className="text-xs text-[#A0A5A0]">
              Configure which engine handles AI tasks and when to failover to secondary providers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#F5F2EB]">Primary Provider</label>
              <select
                value={aiPrimaryProvider}
                onChange={(e) => handleUpdatePreferences(e.target.value as any, fallbackEnabled)}
                className="w-full rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C1A05B] focus:outline-none"
              >
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq LPU</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#F5F2EB]">Automatic Outage Failover</label>
              <div className="flex items-center justify-between border border-[#29302A] bg-[#111311] rounded p-2.5">
                <span className="text-xs text-[#A0A5A0]">Failover on 5xx or network timeout</span>
                <input
                  type="checkbox"
                  checked={fallbackEnabled}
                  onChange={(e) => handleUpdatePreferences(aiPrimaryProvider, e.target.checked)}
                  className="rounded border-[#29302A] bg-[#111311] text-[#C1A05B] focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'github' && (
        <div className="bg-[#171A17] border border-[#29302A] rounded-md p-6 space-y-6">
          <div className="border-b border-[#29302A] pb-4">
            <h3 className="font-serif text-lg font-normal text-[#F5F2EB]">GitHub Integration</h3>
            <p className="text-xs text-[#A0A5A0]">
              Synchronize repositories, pull requests, and commit activities as evidence.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[#F5F2EB] block mb-1">GitHub Username</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="e.g. octocat"
                className="w-full rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C1A05B] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#F5F2EB] block mb-1">Personal Access Token (Optional)</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_... for private repositories"
                className="w-full rounded border border-[#29302A] bg-[#111311] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C1A05B] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSyncGitHub}
              disabled={syncingGithub}
              className="px-5 py-2 rounded bg-[#2A4232] text-[#F5F2EB] border border-[#3D5C47] text-xs font-semibold hover:bg-[#32523E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {syncingGithub ? 'Syncing Engineering Records...' : 'Sync GitHub Workspace'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
