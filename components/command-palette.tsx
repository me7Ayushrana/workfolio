'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Folder, FileText, Sparkles, Compass, X, GraduationCap, BookOpen, Calendar, Filter } from 'lucide-react'
import { useWorkfolio } from '@/lib/workfolio-store'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filterDate, setFilterDate] = useState('') // YYYY-MM-DD
  const [filterMonth, setFilterMonth] = useState('ALL') // 'ALL', '01'...'12'
  const [filterYear, setFilterYear] = useState('ALL') // 'ALL', '2026'...'2024'

  const router = useRouter()
  const { resources, projects, skills, activities } = useWorkfolio()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!open) return null

  // Date Filtering Logic
  const filteredActivities = activities.filter((a) => {
    const matchesQuery =
      !query.trim() ||
      a.work.toLowerCase().includes(query.toLowerCase()) ||
      (a.learning && a.learning.toLowerCase().includes(query.toLowerCase())) ||
      (a.projectTitle && a.projectTitle.toLowerCase().includes(query.toLowerCase()))

    // Exact date filter
    if (filterDate && a.date !== filterDate) return false

    // Month filter (format YYYY-MM-DD)
    if (filterMonth !== 'ALL') {
      const actMonth = a.date.split('-')[1]
      if (actMonth !== filterMonth) return false
    }

    // Year filter
    if (filterYear !== 'ALL') {
      const actYear = a.date.split('-')[0]
      if (actYear !== filterYear) return false
    }

    return matchesQuery
  })

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.learningGoal.toLowerCase().includes(query.toLowerCase()) ||
      s.currentlyLearning.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProjects = projects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())

    if (filterDate && p.date !== filterDate) return false
    if (filterMonth !== 'ALL' && p.date.split('-')[1] !== filterMonth) return false
    if (filterYear !== 'ALL' && p.date.split('-')[0] !== filterYear) return false

    return matchesQuery
  })

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      r.technologies.some((tech) => tech.toLowerCase().includes(query.toLowerCase()))
  )

  const handleSelect = (url: string) => {
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  const clearFilters = () => {
    setFilterDate('')
    setFilterMonth('ALL')
    setFilterYear('ALL')
  }

  const isFilterActive = filterDate || filterMonth !== 'ALL' || filterYear !== 'ALL'

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#0c0d14]/60 p-4 pt-12 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden bg-[#f3eee4] text-[#111318] shadow-2xl border border-[#0c0d14]/20 rounded-lg">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#0c0d14]/15 px-5 py-3.5 bg-[#f8f5ee]">
          <Search size={18} className="text-[#9b7b3b]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, skills, work journal, evidence... (⌘K)"
            className="w-full bg-transparent text-sm text-[#111318] outline-none placeholder:text-[#111318]/40 font-sans"
          />
          <button onClick={() => setOpen(false)} className="text-[#111318]/40 hover:text-[#111318]">
            <X size={18} />
          </button>
        </div>

        {/* DATE / MONTH / YEAR FILTER CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0c0d14]/15 bg-[#ebd9c2]/50 px-5 py-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-[#9b7b3b]">
              <Calendar size={13} /> Filter Work:
            </span>

            {/* Exact Date Input */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#f3eee4] border border-[#0c0d14]/20 px-2 py-1 rounded text-xs text-[#111318] font-mono outline-none focus:border-[#9b7b3b]"
              title="Filter by exact date"
            />

            {/* Month Dropdown */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-[#f3eee4] border border-[#0c0d14]/20 px-2 py-1 rounded text-xs text-[#111318] font-sans outline-none focus:border-[#9b7b3b]"
            >
              <option value="ALL">All Months</option>
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sept</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>

            {/* Year Dropdown */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-[#f3eee4] border border-[#0c0d14]/20 px-2 py-1 rounded text-xs text-[#111318] font-sans outline-none focus:border-[#9b7b3b]"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              onClick={clearFilters}
              className="text-[9px] font-bold uppercase tracking-wider text-[#e63946] hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          
          {/* WORK PERFORMED / ACTIVITY LOGS BY DATE */}
          <div>
            <div className="flex items-center justify-between border-b border-[#0c0d14]/10 pb-1.5 mb-2 px-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#111318]">
                <BookOpen size={12} className="text-[#9b7b3b]" />
                <span>Work Performed Logged ({filteredActivities.length})</span>
              </div>
              {isFilterActive && (
                <span className="text-[9px] font-bold text-[#9b7b3b] uppercase">
                  Filtered by Date/Month/Year
                </span>
              )}
            </div>

            {filteredActivities.length ? (
              <div className="space-y-2">
                {filteredActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleSelect('/activity')}
                    className="flex w-full flex-col p-3 text-left transition-colors hover:bg-[#e5dac9] border border-[#0c0d14]/10 rounded bg-[#fcfaf5]"
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#9b7b3b] mb-1">
                      <span className="bg-[#0c0d14] text-[#f3eee4] px-1.5 py-0.5 font-mono">{act.date} · {act.time}</span>
                      <span className="text-[#c1a05b]">{act.projectTitle || 'Work Journal Log'}</span>
                    </div>
                    <strong className="font-serif text-sm font-normal text-[#111318] leading-snug">{act.work}</strong>
                    {act.learning && (
                      <p className="mt-1 text-xs text-[#c1a05b] line-clamp-1">
                        <strong>Learned:</strong> {act.learning}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-2 text-xs text-[#111318]/50 py-2">
                No work performed matching the selected date, month, year or query.
              </p>
            )}
          </div>

          {/* User Skills */}
          {query.trim() && (
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b] mb-2 px-2 border-b border-[#0c0d14]/10 pb-1">
                <GraduationCap size={12} /> Skills ({filteredSkills.length})
              </div>
              {filteredSkills.length ? (
                <div className="space-y-1">
                  {filteredSkills.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(`/skills/${s.id}`)}
                      className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[#e5dac9]"
                    >
                      <div>
                        <strong className="font-serif text-base font-normal">{s.name}</strong>
                        <p className="mt-0.5 text-xs text-[#c1a05b] font-medium">Focus: "{s.currentlyLearning}"</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-[.12em] bg-[#c1a05b] text-[#f3eee4] px-2 py-0.5">{s.status}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 text-xs text-[#111318]/50">No matching skills.</p>
              )}
            </div>
          )}

          {/* User Projects */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7b3b] mb-2 px-2 border-b border-[#0c0d14]/10 pb-1">
              <Folder size={12} /> My Projects ({filteredProjects.length})
            </div>
            {filteredProjects.length ? (
              <div className="space-y-1">
                {filteredProjects.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/projects/${p.id}`)}
                    className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[#e5dac9]"
                  >
                    <div>
                      <strong className="font-serif text-base font-normal">{p.name}</strong>
                      <p className="mt-1 text-xs text-[#111318]/65 line-clamp-1">{p.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#9b7b3b]">{p.date}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-2 text-xs text-[#111318]/50">No matching projects.</p>
            )}
          </div>

          {/* Explore Resources */}
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7b3b] mb-2 px-2 border-b border-[#0c0d14]/10 pb-1">
              <Compass size={12} /> Explore Ecosystem ({filteredResources.length})
            </div>
            {filteredResources.length ? (
              <div className="space-y-1">
                {filteredResources.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(`/explore/${r.slug || r.id}`)}
                    className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[#e5dac9]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="border border-[#0c0d14]/20 bg-[#0c0d14]/5 px-1.5 py-0.5 text-[8px] font-bold tracking-[.1em]">
                          {r.type}
                        </span>
                        <strong className="font-serif text-base font-normal">{r.title}</strong>
                      </div>
                      <p className="mt-1 text-xs text-[#111318]/65 line-clamp-1">{r.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#9b7b3b]">v{r.version}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-2 text-xs text-[#111318]/50">No matching explore resources.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
