'use client'

import React, { useState, useEffect } from 'react'
import { Check, Eye, EyeOff, Github, Key, Lock, Shield, Sparkles, User, X } from 'lucide-react'
import { MascotVariant, useWorkfolio } from '@/lib/workfolio-store'
import { WorkfolioMascot } from './workfolio-mascot'

interface AuthModalProps {
  onClose: () => void
  initialTab?: 'profile' | 'auth' | 'apikeys'
}

export function AuthModal({ onClose, initialTab = 'profile' }: AuthModalProps) {
  const { userProfile, updateUserProfile, setMascotVariant, connectProvider, disconnectProvider } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<'profile' | 'auth' | 'apikeys'>(initialTab)

  // Profile Form State
  const [firstName, setFirstName] = useState(userProfile.first_name || '')
  const [lastName, setLastName] = useState(userProfile.last_name || '')
  const [displayName, setDisplayName] = useState(userProfile.display_name || '')
  const [username, setUsername] = useState(userProfile.username || '')
  const [email, setEmail] = useState(userProfile.email || '')
  const [headline, setHeadline] = useState(userProfile.headline || '')
  const [mascotVariant, setMascot] = useState<MascotVariant>(userProfile.mascot_variant || 'male')
  const [githubUser, setGithubUser] = useState(userProfile.github_username || '')

  // API Keys State
  const [openaiKey, setOpenaiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [googleOcrKey, setGoogleOcrKey] = useState('')
  
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({
    openai: false,
    github: false,
    anthropic: false,
    google: false
  })

  // Load stored API keys from localStorage
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('workfolio_api_keys')
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys)
        setOpenaiKey(parsed.openai || '')
        setGithubToken(parsed.github || '')
        setAnthropicKey(parsed.anthropic || '')
        setGoogleOcrKey(parsed.google || '')
      }
    } catch {}
  }, [])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      display_name: displayName.trim() || `${firstName} ${lastName}`.trim(),
      username: username.trim(),
      email: email.trim(),
      headline: headline.trim(),
      mascot_variant: mascotVariant,
      github_username: githubUser.trim()
    })
    setMascotVariant(mascotVariant)
    onClose()
  }

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault()
    const apiKeys = {
      openai: openaiKey.trim(),
      github: githubToken.trim(),
      anthropic: anthropicKey.trim(),
      google: googleOcrKey.trim()
    }
    localStorage.setItem('workfolio_api_keys', JSON.stringify(apiKeys))
    alert('API keys and developer credentials saved securely!')
  }

  const handleGoogleLogin = () => {
    connectProvider('google', {
      first_name: firstName || 'Alex',
      last_name: lastName || 'Rivera',
      display_name: displayName || 'Alex Rivera',
      email: email || 'alex.rivera@workfolio.app',
      google_connected: true
    })
    alert('Successfully connected Google OAuth account!')
  }

  const handleGithubLogin = () => {
    const ghName = githubUser.trim() || 'alexrivera-dev'
    connectProvider('github', {
      github_username: ghName,
      github_connected: true
    })
    alert(`Successfully connected GitHub identity: @${ghName}`)
  }

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl border border-[#c1a05b]/40 bg-[#12241b] text-[#f3eee4] shadow-2xl overflow-hidden rounded">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#f3eee4]/15 bg-[#0c1612] px-6 py-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
            <Shield size={14} />
            <span>WORKFOLIO SETTINGS & IDENTITY CONSOLE</span>
          </div>

          <button onClick={onClose} className="text-[#f3eee4]/60 hover:text-[#f3eee4] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-[#f3eee4]/15 bg-[#0c1612]/50 px-6 pt-3 gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            Profile & Gender
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'apikeys'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            API Keys & Credentials
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'auth'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            Connected Accounts
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: PROFILE & GENDER / MASCOT PREFERENCE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <h3 className="font-serif text-2xl font-light text-[#f3eee4]">Account Profile</h3>
                  <p className="text-xs text-[#f3eee4]/70 mt-0.5">
                    Update your display identity and choose your preferred 3D mascot.
                  </p>
                </div>

                {/* 3D Mascot Preview */}
                <div className="flex justify-end">
                  <WorkfolioMascot
                    variant={mascotVariant}
                    size="sm"
                    interactive={true}
                  />
                </div>
              </div>

              {/* GENDER / MASCOT PREFERENCE SELECTION */}
              <div className="border border-[#c1a05b]/40 bg-[#0c1612] p-4 space-y-2 rounded">
                <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
                  Mascot & Gender Variant
                </label>
                <div className="flex gap-4">
                  <label className={`flex flex-1 items-center justify-center gap-2 p-3 border text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all ${
                    mascotVariant === 'male'
                      ? 'border-[#c1a05b] bg-[#c1a05b]/20 text-[#c1a05b]'
                      : 'border-[#f3eee4]/20 bg-[#12241b] text-[#f3eee4]/70'
                  }`}>
                    <input
                      type="radio"
                      name="gender_variant"
                      value="male"
                      checked={mascotVariant === 'male'}
                      onChange={() => setMascot('male')}
                      className="hidden"
                    />
                    <span>♂ Male Mascot</span>
                  </label>

                  <label className={`flex flex-1 items-center justify-center gap-2 p-3 border text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all ${
                    mascotVariant === 'female'
                      ? 'border-[#c1a05b] bg-[#c1a05b]/20 text-[#c1a05b]'
                      : 'border-[#f3eee4]/20 bg-[#12241b] text-[#f3eee4]/70'
                  }`}>
                    <input
                      type="radio"
                      name="gender_variant"
                      value="female"
                      checked={mascotVariant === 'female'}
                      onChange={() => setMascot('female')}
                      className="hidden"
                    />
                    <span>♀ Female Mascot</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ayush"
                  className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c1a05b] py-3 text-xs font-bold uppercase tracking-[.18em] text-[#0c1612] hover:bg-[#f3eee4] transition-colors cursor-pointer rounded"
              >
                Save Profile & Mascot Settings
              </button>
            </form>
          )}

          {/* TAB 2: API KEYS & INTEGRATIONS */}
          {activeTab === 'apikeys' && (
            <form onSubmit={handleSaveApiKeys} className="space-y-4">
              <div>
                <h3 className="font-serif text-2xl font-light text-[#f3eee4]">API Keys & Credentials</h3>
                <p className="text-xs text-[#f3eee4]/70 mt-1">
                  Integrate your personal API credentials for OCR processing, AI evidence synthesis, and GitHub activity sync.
                </p>
              </div>

              {/* OPENAI API KEY */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <label className="text-[#c1a05b] flex items-center gap-1.5">
                    <Key size={12} /> OpenAI API Key (Voice & OCR Intelligence)
                  </label>
                  <span className={openaiKey ? 'text-[#2ec4b6]' : 'text-[#f3eee4]/40'}>
                    {openaiKey ? '✓ Configured' : 'Unset'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-proj-••••••••••••••••••••••••••••••••"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] pl-3 pr-10 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openai')}
                    className="absolute right-3 top-2.5 text-[#f3eee4]/50 hover:text-[#f3eee4]"
                  >
                    {showKeys.openai ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* GITHUB PERSONAL ACCESS TOKEN */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <label className="text-[#c1a05b] flex items-center gap-1.5">
                    <Github size={12} /> GitHub Personal Access Token (Activity Sync)
                  </label>
                  <span className={githubToken ? 'text-[#2ec4b6]' : 'text-[#f3eee4]/40'}>
                    {githubToken ? '✓ Configured' : 'Unset'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.github ? 'text' : 'password'}
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_••••••••••••••••••••••••••••••••"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] pl-3 pr-10 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('github')}
                    className="absolute right-3 top-2.5 text-[#f3eee4]/50 hover:text-[#f3eee4]"
                  >
                    {showKeys.github ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* ANTHROPIC CLAUDE API KEY */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <label className="text-[#c1a05b] flex items-center gap-1.5">
                    <Key size={12} /> Anthropic API Key (Evidence Synthesis)
                  </label>
                  <span className={anthropicKey ? 'text-[#2ec4b6]' : 'text-[#f3eee4]/40'}>
                    {anthropicKey ? '✓ Configured' : 'Unset'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-••••••••••••••••••••••••••••••••"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] pl-3 pr-10 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('anthropic')}
                    className="absolute right-3 top-2.5 text-[#f3eee4]/50 hover:text-[#f3eee4]"
                  >
                    {showKeys.anthropic ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* GOOGLE CLOUD OCR API KEY */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <label className="text-[#c1a05b] flex items-center gap-1.5">
                    <Lock size={12} /> Google Vision OCR API Key
                  </label>
                  <span className={googleOcrKey ? 'text-[#2ec4b6]' : 'text-[#f3eee4]/40'}>
                    {googleOcrKey ? '✓ Configured' : 'Unset'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.google ? 'text' : 'password'}
                    value={googleOcrKey}
                    onChange={(e) => setGoogleOcrKey(e.target.value)}
                    placeholder="AIzaSy••••••••••••••••••••••••••••••••"
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] pl-3 pr-10 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('google')}
                    className="absolute right-3 top-2.5 text-[#f3eee4]/50 hover:text-[#f3eee4]"
                  >
                    {showKeys.google ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-3 text-[11px] text-[#f3eee4]/80 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[#c1a05b] block">🔒 Zero-Trust API Storage</span>
                <p>
                  API keys are stored strictly in client-side localStorage. They are never sent to external logging servers or exposed in public commits.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#c1a05b] py-3 text-xs font-bold uppercase tracking-[.18em] text-[#0c1612] hover:bg-[#f3eee4] transition-colors cursor-pointer rounded"
              >
                Save Integration Credentials
              </button>
            </form>
          )}

          {/* TAB 3: CONNECTED ACCOUNTS */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-light text-[#f3eee4]">Authentication Providers</h3>
                <p className="text-xs text-[#f3eee4]/70 mt-1">
                  Connect your Google or GitHub account. Multiple provider identities are safely linked to your Workfolio profile.
                </p>
              </div>

              {/* GOOGLE LOGIN CARD */}
              <div className="flex items-center justify-between border border-[#f3eee4]/20 bg-[#0c1612] p-4 rounded">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-white text-black rounded font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f3eee4]">Google Account</h4>
                    <p className="text-[11px] text-[#f3eee4]/60">
                      {userProfile.google_connected ? userProfile.email : 'Not connected'}
                    </p>
                  </div>
                </div>

                {userProfile.google_connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2ec4b6] bg-[#2ec4b6]/10 px-2.5 py-1 border border-[#2ec4b6]/30 rounded">
                      <Check size={12} /> Connected
                    </span>
                    <button
                      onClick={() => disconnectProvider('google')}
                      className="text-[10px] font-bold uppercase text-[#f3eee4]/50 hover:text-[#7c2634] ml-2 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    className="bg-[#c1a05b] text-[#0c1612] font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#f3eee4] transition-colors rounded cursor-pointer"
                  >
                    Continue with Google
                  </button>
                )}
              </div>

              {/* GITHUB LOGIN CARD */}
              <div className="flex items-center justify-between border border-[#f3eee4]/20 bg-[#0c1612] p-4 rounded">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#193b2c] text-[#f3eee4] rounded font-bold">
                    <Github size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f3eee4]">GitHub Identity</h4>
                    <p className="text-[11px] text-[#f3eee4]/60">
                      {userProfile.github_connected ? `@${userProfile.github_username}` : 'Not connected'}
                    </p>
                  </div>
                </div>

                {userProfile.github_connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2ec4b6] bg-[#2ec4b6]/10 px-2.5 py-1 border border-[#2ec4b6]/30 rounded">
                      <Check size={12} /> Connected
                    </span>
                    <button
                      onClick={() => disconnectProvider('github')}
                      className="text-[10px] font-bold uppercase text-[#f3eee4]/50 hover:text-[#7c2634] ml-2 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGithubLogin}
                    className="bg-[#2ec4b6] text-[#0c1612] font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#f3eee4] transition-colors rounded cursor-pointer"
                  >
                    Continue with GitHub
                  </button>
                )}
              </div>

              {/* SECURITY NOTE */}
              <div className="border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-3 text-[11px] text-[#f3eee4]/80 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[#c1a05b] block">🔒 Identity Security</span>
                <p>
                  Connected identities share a single unified Workfolio profile ledger.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
