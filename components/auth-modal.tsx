'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  Eye,
  EyeOff,
  Github,
  Key,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  X,
  ExternalLink,
  RefreshCw,
  Database,
  ArrowRight
} from 'lucide-react'
import { MascotVariant, useWorkfolio } from '@/lib/workfolio-store'
import { WorkfolioMascot } from './workfolio-mascot'
import { signInWithGoogleFirebase, signInWithGithubFirebase } from '@/lib/firebase'
import { saveUserDataToSupabase } from '@/lib/supabase'

interface AuthModalProps {
  onClose: () => void
  initialTab?: 'profile' | 'auth' | 'apikeys'
}

export function AuthModal({ onClose, initialTab = 'profile' }: AuthModalProps) {
  const router = useRouter()
  const { userProfile, updateUserProfile, setMascotVariant, connectProvider, disconnectProvider, projects, activities } = useWorkfolio()

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

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

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
    setSyncStatus('Profile updated and synchronized locally!')
    setTimeout(() => onClose(), 600)
  }

  const handleGoogleLogin = async () => {
    setIsSyncing(true)
    setSyncStatus('Opening Google OAuth popup...')
    try {
      const session = await signInWithGoogleFirebase()
      if (session && session.uid) {
        const nameParts = (session.displayName || 'Google User').split(' ')
        const fName = nameParts[0] || 'User'
        const lName = nameParts.slice(1).join(' ') || ''
        const cleanEmail = session.email || 'user@google.com'

        const updatedProfile = {
          first_name: fName,
          last_name: lName,
          display_name: session.displayName || `${fName} ${lName}`.trim(),
          email: cleanEmail,
          photoURL: session.photoURL || userProfile.photoURL,
          google_connected: true
        }

        connectProvider('google', updatedProfile)

        setEmail(cleanEmail)
        if (fName) setFirstName(fName)
        if (lName) setLastName(lName)

        await saveUserDataToSupabase(
          session.uid,
          { ...userProfile, ...updatedProfile },
          projects || [],
          activities || []
        )

        setSyncStatus(`Google Account Connected (${cleanEmail})!`)
        setTimeout(() => {
          setSyncStatus(null)
          onClose()
        }, 800)
      }
    } catch (err: any) {
      console.warn('AuthModal Google Login Notice:', err?.message)
      setSyncStatus(`Google Sign-In notice: ${err?.message || 'Popup closed or blocked.'}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsSyncing(true)
    setSyncStatus('Connecting to GitHub via Firebase Auth...')
    try {
      const session = await signInWithGithubFirebase()
      const ghName = session.displayName || 'github-user'

      connectProvider('github', {
        github_username: ghName,
        github_connected: true
      })

      setGithubUser(ghName)

      const syncRes = await saveUserDataToSupabase(
        session.uid,
        { ...userProfile, github_connected: true, github_username: ghName },
        projects || [],
        activities || []
      )

      setSyncStatus(`GitHub Connected (@${ghName})! ${syncRes.message}`)
    } catch (err: any) {
      setSyncStatus(`GitHub sign-in cancelled or failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRedirectToApiSettings = () => {
    onClose()
    router.push('/settings')
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121420] px-6 py-4">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[.2em] text-[#c1a05b]">
            <ShieldCheck size={16} />
            <span>WORKFOLIO IDENTITY & INTEGRATION CONSOLE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRedirectToApiSettings}
              className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b] bg-[#c1a05b]/10 px-3 py-1.5 text-[11px] font-bold text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#08090f] transition-all cursor-pointer"
            >
              <Key size={13} />
              <span>CONNECT API</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[#f3eee4]/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-white/10 bg-[#090a10] px-6 pt-3 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-white'
            }`}
          >
            Profile & Mascot
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'auth'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-white'
            }`}
          >
            Connected Accounts
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'apikeys'
                ? 'border-[#c1a05b] text-[#c1a05b]'
                : 'border-transparent text-[#f3eee4]/60 hover:text-white'
            }`}
          >
            API Credentials
          </button>
        </div>

        {syncStatus && (
          <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-300 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check size={14} /> {syncStatus}
            </span>
            <button onClick={() => setSyncStatus(null)} className="text-emerald-400 hover:underline text-[10px]">
              Dismiss
            </button>
          </div>
        )}

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: PROFILE & MASCOT */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4 items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Account Profile</h3>
                  <p className="text-xs text-[#f3eee4]/70 mt-1 leading-relaxed">
                    Update your display identity and choose your preferred 3D avatar mascot.
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

              {/* MASCOT VARIANT SELECTOR */}
              <div className="rounded-2xl border border-white/10 bg-[#121420] p-4 space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                  Mascot Avatar Variant
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMascot('male')}
                    className={`flex-1 rounded-xl p-3 border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      mascotVariant === 'male'
                        ? 'border-[#c1a05b] bg-[#c1a05b]/20 text-[#c1a05b] shadow-md'
                        : 'border-white/10 bg-[#08090f] text-[#f3eee4]/60 hover:text-white'
                    }`}
                  >
                    <User size={14} />
                    <span>Male Mascot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMascot('female')}
                    className={`flex-1 rounded-xl p-3 border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      mascotVariant === 'female'
                        ? 'border-[#c1a05b] bg-[#c1a05b]/20 text-[#c1a05b] shadow-md'
                        : 'border-white/10 bg-[#08090f] text-[#f3eee4]/60 hover:text-white'
                    }`}
                  >
                    <User size={14} />
                    <span>Female Mascot</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full rounded-xl border border-white/15 bg-[#08090f] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rivera"
                    className="w-full rounded-xl border border-white/15 bg-[#08090f] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-white/15 bg-[#08090f] px-4 py-2.5 text-xs text-white focus:border-[#c1a05b] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#c1a05b] to-[#a3823d] py-3 text-xs font-bold uppercase tracking-[.18em] text-[#08090f] hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                Save Profile & Mascot Settings
              </button>
            </form>
          )}

          {/* TAB 2: CONNECTED ACCOUNTS & DATA SYNC */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Authentication Providers & Data Sync</h3>
                <p className="text-xs text-[#f3eee4]/70 mt-1 leading-relaxed">
                  Log in with Google or GitHub to sync your active projects, learning tracks, and evidence logs across LocalStorage and Firebase sync state.
                </p>
              </div>

              {/* GOOGLE IDENTITY PROVIDER */}
              <div className="flex items-center justify-between rounded-2xl border border-[#4285F4]/30 bg-[#121420] p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4285F4] font-black text-lg shadow-sm shrink-0">
                    G
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Google Identity Provider</h4>
                    <p className="text-[11px] text-[#f3eee4]/60">
                      {userProfile.google_connected ? `Connected as ${userProfile.email}` : 'Sign in with Google OAuth popup to select your account & sync data'}
                    </p>
                  </div>
                </div>

                {userProfile.google_connected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/30 rounded-lg">
                      <Check size={12} /> Connected
                    </span>
                    <button
                      onClick={() => disconnectProvider('google')}
                      className="text-[10px] font-bold uppercase text-[#f3eee4]/50 hover:text-red-400 ml-2 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isSyncing}
                    className="rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 transition-all cursor-pointer shadow flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isSyncing ? 'Opening Google...' : 'Connect Google'}</span>
                  </button>
                )}
              </div>

              {/* GITHUB LOGIN CARD */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121420] p-4 text-xs shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/40 text-purple-300 border border-purple-500/30 font-bold">
                    <Github size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">GitHub Integration</h4>
                    <p className="text-[11px] text-[#c1a05b]">
                      {userProfile.github_connected
                        ? `@${userProfile.github_username} (Token Active)`
                        : 'OAuth Currently Unavailable — Connect via Personal Access Token'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('apikeys')}
                  className="rounded-xl border border-[#c1a05b]/40 bg-[#c1a05b]/10 text-[#c1a05b] font-bold text-xs uppercase tracking-wider px-4 py-2 hover:bg-[#c1a05b] hover:text-[#08090f] transition-all cursor-pointer shadow flex items-center gap-1.5"
                >
                  <Key size={13} />
                  <span>Connect API Token</span>
                </button>
              </div>

              {/* DATA SYNC CARD */}
              <div className="rounded-2xl border border-white/10 bg-[#121420] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5 text-[#c1a05b]">
                    <Database size={15} /> Workspace Data Synchronization
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Active LocalStorage & Cache</span>
                </div>
                <p className="text-[#f3eee4]/75 text-[11px] leading-relaxed">
                  Your activity logs, project milestones, and evidence vault items are synchronized across browser storage and cached Firebase state upon login.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS & CREDENTIALS REDIRECT */}
          {activeTab === 'apikeys' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="text-xl font-bold text-white">API Keys & Provider Architecture</h3>
                <p className="text-xs text-[#f3eee4]/70 mt-1 leading-relaxed">
                  Manage your Bring Your Own Key (BYOK) AI provider keys for Google Gemini, Groq LPU, and GitHub integration.
                </p>
              </div>

              <div className="rounded-2xl border border-[#c1a05b]/40 bg-gradient-to-r from-[#181a28] to-[#121420] p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c1a05b]/20 text-[#c1a05b] font-bold">
                    <Key size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Configure AI Providers & Test Keys</h4>
                    <p className="text-[11px] text-[#f3eee4]/70">
                      Google Gemini, Groq LPU & GitHub Intelligence Console
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#f3eee4]/85 leading-relaxed">
                  Keys are managed directly on the dedicated <strong>AI Architecture Console</strong> with connection testing, live status beacons, and quota failover controls.
                </p>

                <button
                  onClick={handleRedirectToApiSettings}
                  className="w-full rounded-xl bg-gradient-to-r from-[#c1a05b] to-[#a3823d] py-3 text-xs font-bold uppercase tracking-[.18em] text-[#08090f] hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Key size={14} />
                  <span>GO TO CONNECT API PAGE</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
