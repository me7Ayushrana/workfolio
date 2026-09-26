'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Layers,
  Plus,
  Search,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { useWorkfolio, ProjectItem } from '@/lib/workfolio-store'

export default function ProjectsPage() {
  const { projects, activities, implementations, createProject } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState<'Recently Updated' | 'Newest' | 'Oldest' | 'Alphabetical'>('Recently Updated')
  const [currentPage, setCurrentPage] = useState(1)

  const [showNewModal, setShowNewModal] = useState(false)
  const [newProjName, setNewProjName] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjCat, setNewProjCat] = useState('AI')

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (activeTab === 'ACTIVE') {
      result = result.filter((p) => p.status === 'In progress' || p.status === 'Planning')
    } else if (activeTab === 'COMPLETED') {
      result = result.filter((p) => p.status === 'Completed')
    } else if (activeTab === 'ARCHIVED') {
      result = result.filter((p) => p.status === 'Archived')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (selectedStatus !== 'All') {
      result = result.filter((p) => p.status === selectedStatus)
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'Alphabetical') return a.name.localeCompare(b.name)
      if (sortBy === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      return new Date(b.date).getTime() - new Date(a.date).getTime() // Recently Updated
    })
  }, [projects, activeTab, searchQuery, selectedCategory, selectedStatus, sortBy])

  // Pagination
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const visibleProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const activeFilterChips = [
    activeTab !== 'ALL' ? { label: `Tab: ${activeTab}`, reset: () => setActiveTab('ALL') } : null,
    selectedCategory !== 'All' ? { label: `Category: ${selectedCategory}`, reset: () => setSelectedCategory('All') } : null,
    selectedStatus !== 'All' ? { label: `Status: ${selectedStatus}`, reset: () => setSelectedStatus('All') } : null,
    searchQuery ? { label: `Search: ${searchQuery}`, reset: () => setSearchQuery('') } : null
  ].filter(Boolean) as { label: string; reset: () => void }[]

  const clearAllFilters = () => {
    setActiveTab('ALL')
    setSelectedCategory('All')
    setSelectedStatus('All')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjName.trim()) return
    createProject(newProjName.trim(), newProjDesc.trim() || 'A documented project.', newProjCat)
    setShowNewModal(false)
    setNewProjName('')
    setNewProjDesc('')
  }

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12 space-y-8">
        {/* Breadcrumb Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/70 hover:text-[#111318]"
        >
          <ArrowLeft size={14} /> Back to Workspace Dashboard
        </Link>

        {/* VISUAL HERO BANNER WITH REAL ARTWORK */}
        <div className="relative overflow-hidden rounded-3xl border border-[#0c0d14]/20 bg-[#0c0d14] text-[#f3eee4] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            <div className="p-8 md:p-12 md:col-span-8 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                WORKSPACE PORTFOLIO
              </span>
              <h1 className="font-serif text-4xl font-light md:text-6xl text-[#f3eee4] leading-tight">
                Engineering Projects & Systems.
              </h1>
              <p className="text-xs md:text-sm text-[#f3eee4]/80 max-w-xl leading-relaxed">
                Everything you are building, maintaining, and shipping. Long-lived containers connecting daily updates, verifiable proof logs, and technical case studies.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-2 bg-[#c1a05b] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#08090f] shadow-lg transition-all hover:bg-[#f3eee4] cursor-pointer"
                >
                  <Plus size={14} /> + CREATE DIGITAL PROJECT
                </button>
              </div>
            </div>

            <div className="relative h-48 md:h-full md:col-span-4 min-h-[220px]">
              <Image
                src="/images/mono-1.png"
                alt="Projects Showcase Artwork"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d14] via-transparent to-transparent hidden md:block" />
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.18em] border-b border-[#0c0d14]/15 pb-4">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 transition-all rounded-sm cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#c1a05b] text-[#08090f] font-bold shadow'
                  : 'bg-[#0c0d14] text-[#f3eee4]/80 border border-[#f3eee4]/15 hover:border-[#c1a05b] hover:text-[#f3eee4]'
              }`}
            >
              {tab} (
              {tab === 'ALL'
                ? projects.length
                : tab === 'ACTIVE'
                ? projects.filter((p) => p.status === 'In progress' || p.status === 'Planning').length
                : tab === 'COMPLETED'
                ? projects.filter((p) => p.status === 'Completed').length
                : projects.filter((p) => p.status === 'Archived').length}
              )
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 border-b border-[#0c0d14]/15 pb-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 border border-[#c1a05b]/30 bg-[#0c0d14] px-4 py-3 shadow-md rounded">
            <Search size={15} className="text-[#c1a05b]" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search projects by name, description, category..."
              className="w-full bg-transparent text-xs text-[#f3eee4] outline-none placeholder:text-[#f3eee4]/40 font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#f3eee4]/40 hover:text-[#f3eee4]">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-[#c1a05b]/30 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] rounded"
            >
              <option value="All">All Categories</option>
              <option value="AI">AI</option>
              <option value="Development">Development</option>
              <option value="Automation">Automation</option>
              <option value="Research">Research</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="border border-[#c1a05b]/30 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] rounded"
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-[#c1a05b]/30 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] rounded"
            >
              <option value="Recently Updated">Sort: Recently Active</option>
              <option value="Newest">Sort: Newest</option>
              <option value="Oldest">Sort: Oldest</option>
              <option value="Alphabetical">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
            <span className="text-[#c1a05b]">Active Filters:</span>
            {activeFilterChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 border border-[#c1a05b]/40 bg-[#0c0d14] px-2.5 py-1 text-[#f3eee4] rounded"
              >
                {chip.label}
                <button onClick={chip.reset} className="hover:text-[#7c2634]">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="ml-2 text-[#7c2634] hover:underline uppercase"
            >
              CLEAR ALL
            </button>
          </div>
        )}

        {/* Projects Cards Grid - Dark Theme Editorial Boxes */}
        {visibleProjects.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => {
              const projActivities = activities.filter((a) => a.projectId === project.id)
              const projImplementations = implementations.filter((i) => i.projectId === project.id)

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group flex flex-col justify-between border border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c1a05b] hover:shadow-2xl rounded"
                >
                  <div className="h-24 bg-[#08090f] relative p-4 flex justify-between items-start border-b border-[#c1a05b]/20">
                    <span className="bg-[#c1a05b] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#08090f]">
                      {project.category}
                    </span>
                    <span className="bg-[#0c0d14] border border-[#2ec4b6]/40 text-[#2ec4b6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.16em]">
                      {project.status}
                    </span>
                  </div>

                  <div className="p-6 flex flex-1 flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-3xl font-light leading-snug text-[#f3eee4] group-hover:text-[#c1a05b] transition-colors">
                        {project.name}
                      </h3>
                      <p className="mt-2 text-xs text-[#f3eee4]/75 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#f3eee4]/10">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em] text-[#f3eee4]/60">
                        <span>Updated {project.date}</span>
                        <span className="text-[#c1a05b]">{projActivities.length} Activities · {projImplementations.length} Ext</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] group-hover:text-[#f3eee4]">
                        <span>OPEN PROJECT WORKSPACE</span>
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-[#c1a05b]" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] p-16 text-center space-y-3 rounded">
            <h3 className="font-serif text-3xl font-light">No projects match your current view</h3>
            <p className="text-xs text-[#f3eee4]/65 max-w-md mx-auto">
              Clear your search queries or create a new project to start tracking your work.
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-[#c1a05b] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#08090f] font-bold"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border border-[#0c0d14]/20 p-2.5 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-9 w-9 text-xs font-bold ${
                  currentPage === i + 1
                    ? 'bg-[#0c0d14] text-[#f3eee4]'
                    : 'border border-[#0c0d14]/20 bg-transparent'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border border-[#0c0d14]/20 p-2.5 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0c0d14]/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#f3eee4] p-7 shadow-2xl border border-[#0c0d14]/20">
            <h3 className="font-serif text-3xl font-light">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[.16em] mb-1">
                  Project Name
                </label>
                <input
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Finance Analytics Engine"
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[.16em] mb-1">
                  Category
                </label>
                <select
                  value={newProjCat}
                  onChange={(e) => setNewProjCat(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                >
                  <option value="AI">AI</option>
                  <option value="Development">Development</option>
                  <option value="Automation">Automation</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[.16em] mb-1">
                  Description
                </label>
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  rows={3}
                  placeholder="What is the goal of this project?"
                  className="w-full border border-[#0c0d14]/20 bg-transparent p-3 text-xs outline-none focus:border-[#9b7b3b]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0c0d14] px-5 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
