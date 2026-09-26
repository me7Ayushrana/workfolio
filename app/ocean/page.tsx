'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Folder,
  Globe,
  Layers,
  Monitor,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Sparkles,
  Tv,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { useWorkfolio } from '@/lib/workfolio-store'

interface DigitalWorkspaceItem {
  id: string
  title: string
  channel: string
  category: 'TECH & AI' | 'WORKFLOW AUTOMATION' | 'FRONTEND SHOWCASES' | 'TUTORIALS'
  youtubeId: string
  thumbnail: string
  views: string
  duration: string
  description: string
  projectId?: string
  projectTitle?: string
}

const INITIAL_MEDIA_ITEMS: DigitalWorkspaceItem[] = [
  {
    id: 'ws-1',
    title: 'Workfolio Expense Intelligence & OCR Stream',
    channel: 'AI Systems Channel',
    category: 'TECH & AI',
    youtubeId: 'L_LUpnjgPso', // Sample tech video ID
    thumbnail: '/images/mono-1.png',
    views: '2.4K views',
    duration: '12:45',
    description: 'End-to-end receipt OCR parsing pipeline and voice expense reconciliation showcase.',
    projectId: 'expense-tracker-1',
    projectTitle: 'Expense Tracker'
  },
  {
    id: 'ws-2',
    title: 'Editorial Design Systems & Framer Layout Motion',
    channel: 'Frontend Systems',
    category: 'FRONTEND SHOWCASES',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: '/images/mono-2.png',
    views: '4.8K views',
    duration: '18:20',
    description: 'Restrained typography architecture, custom token design, and spring physics canvas.',
    projectId: 'expense-tracker-1',
    projectTitle: 'Expense Tracker'
  },
  {
    id: 'ws-3',
    title: 'Resilient Redis LRU API Architecture & Telemetry',
    channel: 'Backend Infrastructure',
    category: 'TECH & AI',
    youtubeId: 'L_LUpnjgPso',
    thumbnail: '/images/mono-3.png',
    views: '1.9K views',
    duration: '15:10',
    description: 'Zero-downtime cache layers, stale-while-revalidate fallbacks, and rate-limit benchmarks.',
    projectId: 'weather-api-2',
    projectTitle: 'Weather API'
  },
  {
    id: 'ws-4',
    title: 'Automated CRM Pipeline & Verifiable Proof Logs',
    channel: 'Automation Workflows',
    category: 'WORKFLOW AUTOMATION',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: '/images/mono-4.png',
    views: '3.1K views',
    duration: '22:05',
    description: 'Connecting deal trigger webhooks to immutable evidence ledgers.',
    projectId: 'crm-automation-3',
    projectTitle: 'CRM Automation'
  }
]

export default function OceanDigitalWorkspacePage() {
  const router = useRouter()
  const { projects, logActivityEntry } = useWorkfolio()

  const [mediaItems, setMediaItems] = useState<DigitalWorkspaceItem[]>(INITIAL_MEDIA_ITEMS)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMedia, setActiveMedia] = useState<DigitalWorkspaceItem>(INITIAL_MEDIA_ITEMS[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Clicking directly on video pauses playback and redirects to Digital Workspace studio page
  const handleVideoClick = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      )
    }
    setIsPlaying(false)
    router.push('/digital-workspace')
  }

  const togglePlayPause = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const nextPlayingState = !isPlaying
      const command = isPlaying ? 'pauseVideo' : 'playVideo'
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      )
      setIsPlaying(nextPlayingState)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handlePauseDirectly = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      )
    }
    setIsPlaying(false)
  }

  const handlePlayDirectly = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      )
    }
    setIsPlaying(true)
  }

  // Create Digital Workspace Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newChannel, setNewChannel] = useState('My Digital Workspace')
  const [newCategory, setNewCategory] = useState<DigitalWorkspaceItem['category']>('TECH & AI')
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newProjectId, setNewProjectId] = useState('')

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : 'L_LUpnjgPso'
  }

  const filteredItems = mediaItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channel.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const ytId = extractYoutubeId(newYoutubeUrl)
    const targetProject = projects.find((p) => p.id === newProjectId)

    const newItem: DigitalWorkspaceItem = {
      id: `ws-${Date.now()}`,
      title: newTitle.trim(),
      channel: newChannel.trim() || 'Digital Channel',
      category: newCategory,
      youtubeId: ytId,
      thumbnail: '/images/mono-1.png',
      views: '1 view',
      duration: '10:00',
      description: newDesc.trim() || 'Custom digital workspace media stream.',
      projectId: newProjectId || undefined,
      projectTitle: targetProject?.name || undefined
    }

    setMediaItems((prev) => [newItem, ...prev])
    setActiveMedia(newItem)
    setShowCreateModal(false)

    // Reset Form
    setNewTitle('')
    setNewYoutubeUrl('')
    setNewDesc('')
  }

  const handleAttachToEvidence = (item: DigitalWorkspaceItem) => {
    logActivityEntry({
      work: `Created Digital Workspace Stream: ${item.title}`,
      learning: `Configured media player stream for ${item.category}`,
      projectId: item.projectId,
      capabilities: ['Digital Workspace', 'Media Showcase'],
      evidenceTitle: `Digital Workspace Video: ${item.title}`,
      evidenceUrl: `https://www.youtube.com/watch?v=${item.youtubeId}`,
      type: 'BUILD'
    })
    alert(`Attached "${item.title}" to Workfolio Evidence Vault!`)
  }

  return (
    <main className="min-h-screen bg-[#0c1612] text-[#f3eee4]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-7xl px-5 py-6 md:px-10 space-y-8">
        
        {/* TOP BREADCRUMB & HEADER */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#f3eee4]/15 pb-4 gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
            <Link href="/" className="hover:text-[#f3eee4] transition-colors flex items-center gap-1">
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#f3eee4] font-bold flex items-center gap-1">
              🌊 OCEAN · DIGITAL WORKSPACE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 border border-[#c1a05b]/60 bg-[#12241b] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612] transition-colors cursor-pointer"
            >
              <Plus size={13} /> Quick Add Stream
            </button>

            <Link
              href="/digital-workspace"
              className="group flex items-center gap-2 bg-gradient-to-r from-[#c1a05b] via-[#f3eee4] to-[#c1a05b] px-6 py-2.5 text-xs font-black uppercase tracking-[.22em] text-[#0c1612] border-2 border-[#c1a05b] shadow-[0_0_25px_rgba(193,160,91,0.6)] hover:shadow-[0_0_35px_rgba(243,238,228,0.9)] hover:scale-105 transition-all duration-300 cursor-pointer rounded-xs"
              title="Open Interactive Digital Workspace Studio"
            >
              <Sparkles size={16} className="text-[#0c1612] animate-pulse" />
              <span>+ CREATE DIGITAL WORKSPACE</span>
              <ArrowUpRight size={15} className="text-[#0c1612] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* HERO FEATURED MEDIA PLAYER DISPLAY - CLEAN VIDEO ONLY (NO YOUTUBE BUTTONS) */}
        <div className="border border-[#f3eee4]/20 bg-[#12241b] p-3 md:p-4 shadow-2xl space-y-3">
          {/* Square/Aspect Video Container - Clicking Video Pauses & Redirects to Digital Workspace */}
          <div 
            onClick={handleVideoClick}
            className="relative aspect-video w-full overflow-hidden border border-[#f3eee4]/20 bg-black shadow-lg cursor-pointer group"
            title="Click to pause video and open full Digital Workspace Studio"
          >
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${activeMedia.youtubeId}?autoplay=1&mute=0&controls=0&disablekb=1&modestbranding=1&rel=0&enablejsapi=1`}
              title={activeMedia.title}
              className="h-full w-full border-0 pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Overlay hint banner on hover */}
            <div className="absolute top-3 right-3 z-10 bg-[#0c1612]/90 text-[#c1a05b] border border-[#c1a05b]/40 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
              Click Video to Open Digital Workspace Studio →
            </div>

            {/* Click overlay layer with gold play indicator when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all flex items-center justify-center">
                <div className="bg-[#c1a05b] text-[#0c1612] p-4 rounded-full shadow-2xl group-hover:scale-110 transition-transform flex items-center justify-center">
                  <Play size={32} className="fill-current ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* DEDICATED PAUSE & PLAY CONTROL STRIP BELOW THE VIDEO */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1612] p-3.5 border border-[#c1a05b]/40 rounded shadow-md">
            <div className="flex items-center gap-3">
              {/* Dedicated Direct Pause Button */}
              <button
                type="button"
                onClick={handlePauseDirectly}
                disabled={!isPlaying}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[.18em] transition-all shadow-md cursor-pointer ${
                  isPlaying
                    ? 'bg-[#c1a05b] text-[#0c1612] hover:bg-[#f3eee4] hover:shadow-lg'
                    : 'bg-[#12241b] text-[#f3eee4]/40 border border-[#f3eee4]/10 cursor-not-allowed'
                }`}
                title="Directly Pause Video Playback"
              >
                <Pause size={15} className="fill-current" />
                <span>Pause Video</span>
              </button>

              {/* Dedicated Play Button */}
              <button
                type="button"
                onClick={handlePlayDirectly}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[.18em] transition-all shadow-md cursor-pointer ${
                  !isPlaying
                    ? 'bg-[#2ec4b6] text-[#0c1612] hover:bg-[#f3eee4] hover:shadow-lg'
                    : 'bg-[#12241b] text-[#f3eee4]/40 border border-[#f3eee4]/10 cursor-not-allowed'
                }`}
                title="Resume Video Playback"
              >
                <Play size={15} className="fill-current" />
                <span>Play Video</span>
              </button>
            </div>

            {/* Stream Details & Status */}
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                {activeMedia.channel} · {isPlaying ? '● LIVE PLAYING' : '❚❚ PAUSED'}
              </span>
              <h3 className="text-xs font-semibold text-[#f3eee4] truncate max-w-md">
                {activeMedia.title}
              </h3>
            </div>
          </div>
        </div>



      </div>

      {/* CREATE DIGITAL WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#12241b] p-7 text-[#f3eee4] shadow-2xl border border-[#c1a05b]/40 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#f3eee4]/15 pb-3 mb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                  NEW DIGITAL MEDIA STREAM
                </span>
                <h2 className="font-serif text-3xl font-light">Create Digital Workspace</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#f3eee4]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                  Workspace Stream Title <span className="text-[#7c2634]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. OCR Parsing Engine & Receipt Reconciliation Showcase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 mb-1">
                  YouTube Video / Stream URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=L_LUpnjgPso"
                  value={newYoutubeUrl}
                  onChange={(e) => setNewYoutubeUrl(e.target.value)}
                  className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 mb-1">
                    Channel / Group
                  </label>
                  <input
                    type="text"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                  >
                    <option value="TECH & AI">TECH & AI</option>
                    <option value="WORKFLOW AUTOMATION">WORKFLOW AUTOMATION</option>
                    <option value="FRONTEND SHOWCASES">FRONTEND SHOWCASES</option>
                    <option value="TUTORIALS">TUTORIALS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 mb-1">
                  Associate with Workfolio Project (Optional)
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                >
                  <option value="">-- Independent Digital Workspace --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Key showcase points and technical demonstration notes..."
                  className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3eee4]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#f3eee4]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#c1a05b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0c1612] font-semibold shadow-md"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
