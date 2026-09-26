'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Compass,
  Filter,
  Grid,
  Layers,
  Plus,
  Search,
  Sparkles,
  Tag,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { ExploreHero } from '@/components/explore-hero'
import { ExploreCard } from '@/components/explore-card'
import { RequestResourceModal } from '@/components/request-resource-modal'
import { useWorkfolio, ExploreResource, ResourceCategory, ResourceType } from '@/lib/workfolio-store'

export default function ExplorePage() {
  const { resources, collections, savedResourceIds, recentlyViewedIds, implementations } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'saved' | 'implementations' | 'collections'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'Featured' | 'Newest' | 'Popular' | 'Implemented'>('Featured')
  const [showRequestModal, setShowRequestModal] = useState(false)

  // Filtered resources logic
  const filteredResources = useMemo(() => {
    let result = resources.filter((r) => r.status === 'published')

    if (activeTab === 'featured') {
      result = result.filter((r) => r.featured)
    } else if (activeTab === 'saved') {
      result = result.filter((r) => savedResourceIds.includes(r.id))
    } else if (activeTab === 'implementations') {
      const implementedResourceIds = implementations.map((imp) => imp.resourceId)
      result = result.filter((r) => implementedResourceIds.includes(r.id))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.createdBy.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.technologies.some((tech) => tech.toLowerCase().includes(q))
      )
    }

    if (selectedCategory !== 'All') {
      result = result.filter((r) => r.category === selectedCategory)
    }

    if (selectedType !== 'All') {
      result = result.filter((r) => r.type === selectedType)
    }

    if (selectedDifficulty !== 'All') {
      result = result.filter((r) => r.difficulty === selectedDifficulty)
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'Popular') return b.viewsCount - a.viewsCount
      if (sortBy === 'Implemented') return b.implementationsCount - a.implementationsCount
      if (sortBy === 'Newest') return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    })
  }, [
    resources,
    activeTab,
    savedResourceIds,
    implementations,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedDifficulty,
    sortBy
  ])

  // Active filter chips
  const activeFilterChips = [
    selectedCategory !== 'All' ? { label: `Category: ${selectedCategory}`, reset: () => setSelectedCategory('All') } : null,
    selectedType !== 'All' ? { label: `Type: ${selectedType}`, reset: () => setSelectedType('All') } : null,
    selectedDifficulty !== 'All' ? { label: `Difficulty: ${selectedDifficulty}`, reset: () => setSelectedDifficulty('All') } : null,
    searchQuery ? { label: `Search: ${searchQuery}`, reset: () => setSearchQuery('') } : null
  ].filter(Boolean) as { label: string; reset: () => void }[]

  const clearAllFilters = () => {
    setSelectedCategory('All')
    setSelectedType('All')
    setSelectedDifficulty('All')
    setSearchQuery('')
  }

  // Grouped resources by Category for editorial layout
  const featuredList = useMemo(() => resources.filter((r) => r.featured), [resources])
  const recentlyAddedList = useMemo(() => [...resources].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()).slice(0, 3), [resources])
  const recentlyViewedResources = useMemo(() => resources.filter((r) => recentlyViewedIds.includes(r.id)), [resources, recentlyViewedIds])

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      {/* Hero Banner */}
      <ExploreHero onRequestResource={() => setShowRequestModal(true)} />

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0c0d14]/15 pb-4">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.18em]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 transition-all ${
                activeTab === 'all'
                  ? 'bg-[#0c0d14] text-[#f3eee4]'
                  : 'bg-[#e5dac9] text-[#111318]/70 hover:text-[#111318]'
              }`}
            >
              All Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 transition-all ${
                activeTab === 'featured'
                  ? 'bg-[#0c0d14] text-[#f3eee4]'
                  : 'bg-[#e5dac9] text-[#111318]/70 hover:text-[#111318]'
              }`}
            >
              Featured ({featuredList.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-[#0c0d14] text-[#f3eee4]'
                  : 'bg-[#e5dac9] text-[#111318]/70 hover:text-[#111318]'
              }`}
            >
              <Bookmark size={12} className={savedResourceIds.length ? 'fill-[#c1a05b] text-[#c1a05b]' : ''} />
              My Saved ({savedResourceIds.length})
            </button>
            <button
              onClick={() => setActiveTab('implementations')}
              className={`px-4 py-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'implementations'
                  ? 'bg-[#0c0d14] text-[#f3eee4]'
                  : 'bg-[#e5dac9] text-[#111318]/70 hover:text-[#111318]'
              }`}
            >
              <CheckCircle2 size={12} className="text-[#c1a05b]" />
              My Implementations ({implementations.length})
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2 transition-all ${
                activeTab === 'collections'
                  ? 'bg-[#0c0d14] text-[#f3eee4]'
                  : 'bg-[#e5dac9] text-[#111318]/70 hover:text-[#111318]'
              }`}
            >
              Collections ({collections.length})
            </button>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 border border-[#0c0d14]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-[#e5dac9]"
          >
            <Sparkles size={12} className="text-[#9b7b3b]" /> Request Resource
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-8 flex flex-col gap-3 border-b border-[#0c0d14]/15 pb-6 lg:flex-row lg:items-center">
          {/* Search Box */}
          <div className="flex flex-1 items-center gap-3 border border-[#0c0d14]/20 bg-[#e5dac9]/60 px-4 py-2.5">
            <Search size={15} className="text-[#9b7b3b]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, technologies, creators..."
              className="w-full bg-transparent text-xs text-[#111318] outline-none placeholder:text-[#111318]/40 font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#111318]/40 hover:text-[#111318]">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Select Filter Dropdowns */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#0c0d14]/20 bg-[#e5dac9]/60 px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
            >
              <option value="All">All Categories</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Frontend Systems">Frontend Systems</option>
              <option value="Developer Tools">Developer Tools</option>
              <option value="Automation">Automation</option>
              <option value="Research">Research</option>
              <option value="Design Systems">Design Systems</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-[#0c0d14]/20 bg-[#e5dac9]/60 px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
            >
              <option value="All">All Resource Types</option>
              <option value="PROJECT">Project</option>
              <option value="TEMPLATE">Template</option>
              <option value="UI KIT">UI Kit</option>
              <option value="COMPONENT">Component</option>
              <option value="STARTER">Starter</option>
              <option value="TOOL">Tool</option>
              <option value="AI WORKFLOW">AI Workflow</option>
              <option value="RESEARCH">Research</option>
              <option value="GUIDE">Guide</option>
              <option value="API">API</option>
              <option value="AUTOMATION">Automation</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-[#0c0d14]/20 bg-[#e5dac9]/60 px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-[#0c0d14]/20 bg-[#e5dac9]/60 px-3 py-2 text-xs outline-none focus:border-[#9b7b3b]"
            >
              <option value="Featured">Sort: Featured</option>
              <option value="Newest">Sort: Newest</option>
              <option value="Popular">Sort: Popularity</option>
              <option value="Implemented">Sort: Most Implemented</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
            <span className="text-[#9b7b3b]">Active Filters:</span>
            {activeFilterChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 border border-[#0c0d14]/20 bg-[#e5dac9] px-2.5 py-1 text-[#111318]"
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

        {/* Collections Tab Content */}
        {activeTab === 'collections' ? (
          <section className="mt-10 space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
                Curated Resource Collections
              </p>
              <h2 className="mt-1 font-serif text-4xl font-light">Explore Collections</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="group border border-[#0c0d14]/15 bg-[#e5dac9] p-6 flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[#122c21]">
                    <Image
                      src={col.coverImage}
                      alt={col.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#9b7b3b] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.18em] text-[#111318]">
                        COLLECTION
                      </span>
                      <h3 className="mt-1 font-serif text-3xl font-light text-[#f3eee4]">{col.title}</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-[#111318]/70 leading-relaxed">{col.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#0c0d14]/10 pt-3 text-[10px] font-bold uppercase tracking-[.16em]">
                      <span>{col.resourceCount} Curated Resources</span>
                      <button
                        onClick={() => {
                          setActiveTab('all')
                          setSelectedCategory(
                            col.id === 'col-ai-ml'
                              ? 'AI & Machine Learning'
                              : col.id === 'col-frontend-systems'
                              ? 'Frontend Systems'
                              : col.id === 'col-dev-tools'
                              ? 'Developer Tools'
                              : 'Automation'
                          )
                        }}
                        className="flex items-center gap-1 text-[#9b7b3b] hover:underline"
                      >
                        EXPLORE COLLECTION <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Primary Resource Grid Section */
          <section className="mt-10">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#111318]/60 mb-6">
              <span>Showing {filteredResources.length} Resources</span>
              {activeTab === 'saved' && <span>Your Bookmarked Archive</span>}
              {activeTab === 'implementations' && <span>Your Implemented Work</span>}
            </div>

            {filteredResources.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((res) => (
                  <ExploreCard key={res.id} resource={res} />
                ))}
              </div>
            ) : (
              <div className="my-16 border border-dashed border-[#0c0d14]/25 p-16 text-center bg-[#e5dac9]/40">
                <h3 className="font-serif text-4xl font-light">No resources found</h3>
                <p className="mt-3 text-xs text-[#111318]/65 max-w-md mx-auto">
                  {activeTab === 'saved'
                    ? "You haven't saved any resources to your bookmark archive yet."
                    : activeTab === 'implementations'
                    ? "You haven't implemented any Explore resources into your projects yet."
                    : 'No resources match your current search queries or filter selections.'}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="bg-[#0c0d14] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="border border-[#0c0d14]/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em]"
                  >
                    Request a Resource
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewedResources.length > 0 && (
          <section className="mt-20 border-t border-[#0c0d14]/15 pt-10">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
              <Compass size={13} /> Recently Viewed Resources
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              {recentlyViewedResources.slice(0, 4).map((res) => (
                <Link
                  key={res.id}
                  href={`/explore/${res.slug || res.id}`}
                  className="group border border-[#0c0d14]/10 bg-[#e5dac9] p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[.14em] text-[#9b7b3b]">
                    <span>{res.type}</span>
                    <span>v{res.version}</span>
                  </div>
                  <h4 className="mt-2 font-serif text-xl leading-snug line-clamp-1 group-hover:text-[#9b7b3b]">
                    {res.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-[#111318]/65 line-clamp-2">{res.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-28 flex flex-col justify-between gap-8 bg-[#7c2634] px-6 py-10 text-[#f3eee4] md:flex-row md:items-end md:px-10">
        <div>
          <p className="font-serif text-3xl">WORKFOLIO</p>
          <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/70">
            TRACE THE TASK · Turn your work into proof.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/60">
          Workfolio Explore Ecosystem
        </p>
      </footer>

      {showRequestModal && (
        <RequestResourceModal onClose={() => setShowRequestModal(false)} />
      )}
    </main>
  )
}
