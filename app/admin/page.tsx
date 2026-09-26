'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Plus,
  Radio,
  Search,
  Sparkles,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { ExploreCard } from '@/components/explore-card'
import { useWorkfolio, ExploreResource, ResourceCategory, ResourceType } from '@/lib/workfolio-store'

export default function AdminPage() {
  const {
    resources,
    projects,
    requests,
    publishProjectToExplore,
    createNewExploreResource,
    updateExploreResource
  } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'scheduled' | 'requests'>('published')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '')

  // Publish Form Metadata
  const [exploreTitle, setExploreTitle] = useState('')
  const [exploreDescription, setExploreDescription] = useState('')
  const [exploreType, setExploreType] = useState<ResourceType>('PROJECT')
  const [exploreCategory, setExploreCategory] = useState<ResourceCategory>('AI & Machine Learning')
  const [exploreTags, setExploreTags] = useState('AI, OCR, React')
  const [exploreTech, setExploreTech] = useState('React 19, Next.js, Tailwind')
  const [exploreDifficulty, setExploreDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate')
  const [exploreCover, setExploreCover] = useState('/images/mono-1.png')
  const [exploreExternalUrl, setExploreExternalUrl] = useState('')
  const [exploreRepoUrl, setExploreRepoUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Filter resources by status
  const publishedResources = resources.filter((r) => r.status === 'published')
  const draftResources = resources.filter((r) => r.status === 'draft')
  const scheduledResources = resources.filter((r) => r.status === 'scheduled')

  // Total Real Metrics
  const totalViews = resources.reduce((sum, r) => sum + r.viewsCount, 0)
  const totalSaves = resources.reduce((sum, r) => sum + r.savesCount, 0)
  const totalImplementations = resources.reduce((sum, r) => sum + r.implementationsCount, 0)

  const handleSelectProjectToPublish = (projId: string) => {
    setSelectedProjectId(projId)
    const proj = projects.find((p) => p.id === projId)
    if (proj) {
      setExploreTitle(proj.name)
      setExploreDescription(proj.description)
      setExploreCategory((proj.category as ResourceCategory) || 'Frontend Systems')
    }
  }

  const handlePublishConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!exploreTitle.trim() || !exploreDescription.trim()) return

    const tagsArray = exploreTags.split(',').map((t) => t.trim()).filter(Boolean)
    const techArray = exploreTech.split(',').map((t) => t.trim()).filter(Boolean)

    if (selectedProjectId) {
      publishProjectToExplore(selectedProjectId, {
        title: exploreTitle,
        description: exploreDescription,
        type: exploreType,
        category: exploreCategory,
        tags: tagsArray,
        technologies: techArray,
        difficulty: exploreDifficulty,
        coverImage: exploreCover,
        externalUrl: exploreExternalUrl || undefined,
        repositoryUrl: exploreRepoUrl || undefined
      })
    } else {
      createNewExploreResource({
        title: exploreTitle,
        description: exploreDescription,
        longDescription: exploreDescription,
        coverImage: exploreCover,
        screenshots: [exploreCover],
        type: exploreType,
        category: exploreCategory,
        tags: tagsArray,
        technologies: techArray,
        difficulty: exploreDifficulty,
        version: '1.0.0',
        createdBy: 'Alex Rivera (Admin)',
        publishedDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        featured: false,
        status: 'published',
        implementationGuide: ['Import source code into your project.', 'Configure environment variables.'],
        learnPoints: ['Modular architecture'],
        reusePoints: ['Design tokens & components'],
        requirements: ['React 18+']
      })
    }

    setShowPublishModal(false)
    setShowPreview(false)
  }

  // Temporary preview object for modal
  const dummyPreviewResource: ExploreResource = {
    id: 'preview-1',
    slug: 'preview',
    title: exploreTitle || 'Project Preview Title',
    description: exploreDescription || 'Resource preview description...',
    longDescription: exploreDescription,
    coverImage: exploreCover,
    screenshots: [exploreCover],
    type: exploreType,
    category: exploreCategory,
    tags: exploreTags.split(',').map((t) => t.trim()).filter(Boolean),
    technologies: exploreTech.split(',').map((t) => t.trim()).filter(Boolean),
    difficulty: exploreDifficulty,
    version: '1.0.0',
    createdBy: 'Alex Rivera (Admin)',
    publishedDate: '2026-09-26',
    updatedDate: '2026-09-26',
    featured: true,
    status: 'published',
    viewsCount: 0,
    savesCount: 0,
    implementationsCount: 0,
    implementationGuide: ['Step 1'],
    learnPoints: ['Point 1'],
    reusePoints: ['Point 1'],
    requirements: ['React']
  }

  return (
    <main className="min-h-screen bg-[#0c0d14] text-[#f3eee4]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#f3eee4]/15 pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
              <Radio size={14} className="animate-pulse" />
              <span>ADMINISTRATOR WORKSPACE</span>
            </div>
            <h1 className="mt-3 font-serif text-5xl font-light md:text-7xl">Explore, published.</h1>
            <p className="mt-3 text-xs text-[#f3eee4]/70 max-w-xl">
              Publish existing user projects into Explore, manage collections, feature flagship tools, and view real usage metrics.
            </p>
          </div>

          <button
            onClick={() => {
              if (projects.length) handleSelectProjectToPublish(projects[0].id)
              setShowPublishModal(true)
            }}
            className="flex items-center gap-2 bg-[#c1a05b] px-6 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#111318] transition-all hover:bg-[#f3eee4]"
          >
            <Plus size={14} /> PUBLISH PROJECT TO EXPLORE
          </button>
        </div>

        {/* Real Metrics Summary Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border border-[#f3eee4]/15 bg-[#122c21] p-6">
            <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
              <Eye size={13} /> Total Explore Views
            </span>
            <strong className="mt-4 block font-serif text-5xl font-light text-[#f3eee4]">
              {totalViews.toLocaleString()}
            </strong>
            <span className="mt-2 block text-[10px] text-[#f3eee4]/60">Verified unique views</span>
          </div>

          <div className="border border-[#f3eee4]/15 bg-[#122c21] p-6">
            <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
              <Bookmark size={13} /> Saved Bookmarks
            </span>
            <strong className="mt-4 block font-serif text-5xl font-light text-[#f3eee4]">
              {totalSaves.toLocaleString()}
            </strong>
            <span className="mt-2 block text-[10px] text-[#f3eee4]/60">User bookmarks</span>
          </div>

          <div className="border border-[#f3eee4]/15 bg-[#122c21] p-6">
            <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
              <CheckCircle2 size={13} /> Implementations
            </span>
            <strong className="mt-4 block font-serif text-5xl font-light text-[#f3eee4]">
              {totalImplementations.toLocaleString()}
            </strong>
            <span className="mt-2 block text-[10px] text-[#f3eee4]/60">Active implementations</span>
          </div>
        </div>

        {/* Admin Section Tabs */}
        <div className="mt-12 flex gap-4 border-b border-[#f3eee4]/15 pb-3 text-[10px] font-bold uppercase tracking-[.18em]">
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-2 transition-colors ${
              activeTab === 'published' ? 'border-b-2 border-[#c1a05b] text-[#c1a05b]' : 'text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            Published ({publishedResources.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-2 transition-colors ${
              activeTab === 'drafts' ? 'border-b-2 border-[#c1a05b] text-[#c1a05b]' : 'text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            Drafts ({draftResources.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-2 transition-colors ${
              activeTab === 'scheduled' ? 'border-b-2 border-[#c1a05b] text-[#c1a05b]' : 'text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            Scheduled ({scheduledResources.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2 transition-colors ${
              activeTab === 'requests' ? 'border-b-2 border-[#c1a05b] text-[#c1a05b]' : 'text-[#f3eee4]/60 hover:text-[#f3eee4]'
            }`}
          >
            User Requests ({requests.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'requests' ? (
          <div className="mt-8 space-y-4">
            <h3 className="font-serif text-2xl font-light">Requested Resources from Users</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((req) => (
                <div key={req.id} className="border border-[#f3eee4]/15 bg-[#122c21] p-6 space-y-2">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-[.16em] text-[#c1a05b]">
                    <span>{req.category}</span>
                    <span>{req.status}</span>
                  </div>
                  <h4 className="font-serif text-2xl">{req.title}</h4>
                  <p className="text-xs text-[#f3eee4]/70 leading-relaxed">{req.description}</p>
                  <span className="text-[9px] text-[#f3eee4]/40 block pt-2">Requested on {req.requestedAt}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(activeTab === 'published'
              ? publishedResources
              : activeTab === 'drafts'
              ? draftResources
              : scheduledResources
            ).map((res) => (
              <div
                key={res.id}
                className="border border-[#f3eee4]/15 bg-[#122c21] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-[.15em] text-[#c1a05b]">
                    <span>{res.status}</span>
                    <span>v{res.version}</span>
                  </div>
                  <span className="mt-3 inline-block bg-[#0c0d14] px-2 py-0.5 text-[8px] font-bold tracking-[.14em] text-[#f3eee4]">
                    {res.type}
                  </span>
                  <h3 className="mt-4 font-serif text-3xl font-light">{res.title}</h3>
                  <p className="mt-2 text-xs text-[#f3eee4]/65 line-clamp-2">{res.description}</p>
                </div>

                <div className="mt-8 border-t border-[#f3eee4]/10 pt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em]">
                  <button
                    onClick={() =>
                      updateExploreResource(res.id, {
                        featured: !res.featured
                      })
                    }
                    className={`hover:underline ${res.featured ? 'text-[#c1a05b]' : 'text-[#f3eee4]/50'}`}
                  >
                    {res.featured ? '★ FEATURED' : '☆ MAKE FEATURED'}
                  </button>

                  <Link
                    href={`/explore/${res.slug || res.id}`}
                    className="flex items-center gap-1 text-[#f3eee4] hover:text-[#c1a05b]"
                  >
                    View Card <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Project to Explore Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#f3eee4] p-8 text-[#111318] shadow-2xl border border-[#0c0d14]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#0c0d14]/15 pb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9b7b3b]">
                  ADMIN PUBLISH FLOW
                </span>
                <h2 className="mt-1 font-serif text-3xl font-light">Publish Project to Explore</h2>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-[#111318]/50 hover:text-[#111318]">
                <X size={18} />
              </button>
            </div>

            {showPreview ? (
              <div className="my-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b] block">
                  EXPLORE CARD PREVIEW
                </span>
                <ExploreCard resource={dummyPreviewResource} />
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em]"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handlePublishConfirm}
                    className="bg-[#0c0d14] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                  >
                    Confirm & Publish Now
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setShowPreview(true) }} className="mt-6 space-y-4">
                {/* Select Project */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    Select Existing Project to Publish
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProjectToPublish(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2.5 text-xs outline-none focus:border-[#9b7b3b]"
                  >
                    <option value="">-- Standalone Explore Resource --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category} — {p.explorePublished ? 'Already Published' : 'Unpublished'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Explore Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    Explore Resource Title
                  </label>
                  <input
                    value={exploreTitle}
                    onChange={(e) => setExploreTitle(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                    required
                  />
                </div>

                {/* Explore Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    Explore Description
                  </label>
                  <textarea
                    value={exploreDescription}
                    onChange={(e) => setExploreDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-[#0c0d14]/20 bg-transparent p-3 text-xs outline-none focus:border-[#9b7b3b]"
                    required
                  />
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={exploreType}
                      onChange={(e) => setExploreType(e.target.value as any)}
                      className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                    >
                      <option value="PROJECT">PROJECT</option>
                      <option value="TEMPLATE">TEMPLATE</option>
                      <option value="UI KIT">UI KIT</option>
                      <option value="COMPONENT">COMPONENT</option>
                      <option value="STARTER">STARTER</option>
                      <option value="TOOL">TOOL</option>
                      <option value="AI WORKFLOW">AI WORKFLOW</option>
                      <option value="RESEARCH">RESEARCH</option>
                      <option value="GUIDE">GUIDE</option>
                      <option value="API">API</option>
                      <option value="AUTOMATION">AUTOMATION</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                      Category
                    </label>
                    <select
                      value={exploreCategory}
                      onChange={(e) => setExploreCategory(e.target.value as any)}
                      className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                    >
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Frontend Systems">Frontend Systems</option>
                      <option value="Developer Tools">Developer Tools</option>
                      <option value="Automation">Automation</option>
                      <option value="Research">Research</option>
                      <option value="Design Systems">Design Systems</option>
                    </select>
                  </div>
                </div>

                {/* Tech & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      value={exploreTech}
                      onChange={(e) => setExploreTech(e.target.value)}
                      className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      value={exploreTags}
                      onChange={(e) => setExploreTags(e.target.value)}
                      className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                    />
                  </div>
                </div>

                {/* Cover Image Path */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/80 mb-1">
                    Cover Image Path
                  </label>
                  <select
                    value={exploreCover}
                    onChange={(e) => setExploreCover(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                  >
                    <option value="/images/mono-1.png">/images/mono-1.png (Expense UI)</option>
                    <option value="/images/mono-2.png">/images/mono-2.png (Analytics UI)</option>
                    <option value="/images/mono-3.png">/images/mono-3.png (Weather System)</option>
                    <option value="/images/mono-4.png">/images/mono-4.png (CRM System)</option>
                    <option value="/images/hero-mono.png">/images/hero-mono.png (Graph Canvas)</option>
                    <option value="/images/rusted-metal.png">/images/rusted-metal.png (Research)</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#0c0d14]/15">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0c0d14] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                  >
                    Preview Card & Publish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
