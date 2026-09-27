'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { useWorkfolio } from '@/lib/workfolio-store'

interface UnifiedEvidenceItem {
  id: string
  title: string
  category: string
  project: string
  date: string // YYYY-MM-DD
  sourceType: 'DAILY_UPDATE' | 'ARTIFACT_ENTRY'
  evidenceUrl?: string
  workSummary?: string
  learning?: string
  capabilities?: string[]
}

const DEFAULT_ARTIFACTS: UnifiedEvidenceItem[] = []

const MONTH_NAMES = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

// Helper function to format date into Day Name, Date Month Year (e.g. "Friday, 25 September 2026")
function formatFullDate(dateStr: string) {
  if (!dateStr || !dateStr.includes('-')) return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  const d = new Date(year, month, day)

  if (isNaN(d.getTime())) return dateStr

  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = d.toLocaleDateString('en-US', { month: 'long' })
  return `${dayName}, ${day} ${monthName} ${year}`
}

export default function EvidencePage() {
  const { activities } = useWorkfolio()
  const [showLogModal, setShowLogModal] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedYear, setSelectedYear] = useState<string>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL')
  const [selectedDay, setSelectedDay] = useState<string>('ALL')
  const [activeSpecificDate, setActiveSpecificDate] = useState<string | null>(null)

  // Convert daily logged activities into Evidence Vault items
  const activityEvidenceItems: UnifiedEvidenceItem[] = useMemo(() => {
    return activities.map((act) => ({
      id: `act-ev-${act.id}`,
      title: act.evidenceTitle || act.work,
      category: act.type ? `Daily ${act.type}` : 'Daily Log',
      project: act.projectTitle || 'Personal Workspace',
      date: act.date,
      sourceType: 'DAILY_UPDATE',
      evidenceUrl: act.evidenceUrl,
      workSummary: act.work,
      learning: act.learning,
      capabilities: act.capabilities || []
    }))
  }, [activities])

  // Combine static evidence and dynamic daily activity updates
  const allEvidenceItems = useMemo(() => {
    return [...activityEvidenceItems, ...DEFAULT_ARTIFACTS].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [activityEvidenceItems])

  // Available Years extracted from data
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    allEvidenceItems.forEach((item) => {
      if (item.date && item.date.includes('-')) {
        years.add(item.date.split('-')[0])
      }
    })
    return Array.from(years).sort().reverse()
  }, [allEvidenceItems])

  // Group items by unique dates for the Date & Day Name pills bar
  const dateGroups = useMemo(() => {
    const map = new Map<string, UnifiedEvidenceItem[]>()
    allEvidenceItems.forEach((item) => {
      const existing = map.get(item.date) || []
      map.set(item.date, [...existing, item])
    })

    const result: { date: string; formatted: string; count: number }[] = []
    map.forEach((items, date) => {
      result.push({
        date,
        formatted: formatFullDate(date),
        count: items.length
      })
    })

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [allEvidenceItems])

  // Extract unique categories for filter chips
  const categories = useMemo(() => {
    const set = new Set<string>()
    allEvidenceItems.forEach((item) => set.add(item.category))
    return ['ALL', ...Array.from(set)]
  }, [allEvidenceItems])

  // Filter evidence items by query, category, year, month, day, and active specific date
  const filteredItems = useMemo(() => {
    return allEvidenceItems.filter((item) => {
      // 1. Specific Clicked Date Pill Filter
      if (activeSpecificDate && item.date !== activeSpecificDate) {
        return false
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false
      }

      // 3. Manual Year Filter
      if (selectedYear !== 'ALL') {
        const itemYear = item.date.split('-')[0]
        if (itemYear !== selectedYear) return false
      }

      // 4. Manual Month Filter
      if (selectedMonth !== 'ALL') {
        const itemMonth = item.date.split('-')[1]
        if (itemMonth !== selectedMonth) return false
      }

      // 5. Manual Day Filter
      if (selectedDay !== 'ALL') {
        const itemDay = item.date.split('-')[2]
        // Pad single digit day if needed
        const formattedDay = itemDay.padStart(2, '0')
        const targetDay = selectedDay.padStart(2, '0')
        if (formattedDay !== targetDay) return false
      }

      // 6. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const fullDateFormatted = formatFullDate(item.date).toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesCategory = item.category.toLowerCase().includes(q)
        const matchesProject = item.project.toLowerCase().includes(q)
        const matchesWork = item.workSummary?.toLowerCase().includes(q) || false
        const matchesLearning = item.learning?.toLowerCase().includes(q) || false
        const matchesDate = item.date.includes(q) || fullDateFormatted.includes(q)
        const matchesCapabilities = item.capabilities?.some((c) => c.toLowerCase().includes(q)) || false

        if (
          !matchesTitle &&
          !matchesCategory &&
          !matchesProject &&
          !matchesWork &&
          !matchesLearning &&
          !matchesDate &&
          !matchesCapabilities
        ) {
          return false
        }
      }

      return true
    })
  }, [
    allEvidenceItems,
    activeSpecificDate,
    selectedCategory,
    selectedYear,
    selectedMonth,
    selectedDay,
    searchQuery
  ])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('ALL')
    setSelectedYear('ALL')
    setSelectedMonth('ALL')
    setSelectedDay('ALL')
    setActiveSpecificDate(null)
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedMonth !== 'ALL' ||
    selectedDay !== 'ALL' ||
    activeSpecificDate !== null

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10 space-y-8">
        
        {/* TOP NAVIGATION LINK & TITLE HEADER */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b] hover:text-[#111318] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                <Layers size={14} />
                <span>WORKFOLIO EVIDENCE VAULT</span>
              </div>
              <h1 className="mt-2 font-serif text-5xl font-light md:text-6xl text-[#0c0d14]">
                Evidence Vault.
              </h1>
              <p className="mt-2 text-sm text-[#111318]/75 max-w-xl leading-relaxed">
                Raw, verifiable artifacts and daily logged work updates that support project claims and back your capability profile.
              </p>
            </div>

            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 bg-[#c1a05b] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#08090f] hover:bg-[#0c0d14] hover:text-[#f3eee4] transition-colors shadow-sm cursor-pointer shrink-0 font-bold"
            >
              <Plus size={14} /> + LOG DAILY EVIDENCE
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER SECTION: MANUAL SELECTION OF YEAR, MONTH, DATE & KEYWORD SEARCH */}
        {/* ========================================================================= */}
        <section className="border border-[#c1a05b]/30 bg-[#0c0d14] p-5 text-[#f3eee4] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#c1a05b]/20 pb-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
              <Search size={14} />
              <span>SEARCH & MANUAL DATE / TIME FILTERS</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#ff6b6b] hover:text-white transition-colors cursor-pointer bg-[#e63946]/20 border border-[#e63946]/40 px-2.5 py-1 rounded-xs"
              >
                <X size={12} /> Reset Filters
              </button>
            )}
          </div>

          {/* Row 1: Keyword Search Bar & Manual Year/Month/Date Dropdowns */}
          <div className="grid gap-4 md:grid-cols-12 items-center">
            {/* Search Input Box */}
            <div className="md:col-span-5 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c1a05b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, project, work or skill..."
                className="w-full bg-[#08090f] border border-[#c1a05b]/40 pl-10 pr-4 py-2 text-xs text-[#f3eee4] placeholder-[#f3eee4]/50 focus:border-[#c1a05b] focus:outline-none"
              />
            </div>

            {/* Manual Select Year */}
            <div className="md:col-span-2">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value)
                  setActiveSpecificDate(null)
                }}
                className="w-full bg-[#08090f] border border-[#c1a05b]/40 px-2.5 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Select Month */}
            <div className="md:col-span-3">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value)
                  setActiveSpecificDate(null)
                }}
                className="w-full bg-[#08090f] border border-[#c1a05b]/40 px-2.5 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Months</option>
                {MONTH_NAMES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Select Day */}
            <div className="md:col-span-2">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                Day Date
              </label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value)
                  setActiveSpecificDate(null)
                }}
                className="w-full bg-[#08090f] border border-[#c1a05b]/40 px-2.5 py-2 text-xs text-[#f3eee4] focus:border-[#c1a05b] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Days</option>
                {Array.from({ length: 31 }, (_, i) => {
                  const dayVal = (i + 1).toString().padStart(2, '0')
                  return (
                    <option key={dayVal} value={dayVal}>
                      Day {dayVal}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f3eee4]/10">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#f3eee4]/60 mr-1 flex items-center gap-1">
              <Tag size={11} /> Category:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#c1a05b] text-[#08090f] border-[#c1a05b]'
                      : 'bg-[#08090f] text-[#f3eee4]/80 border-[#c1a05b]/30 hover:border-[#c1a05b] hover:text-[#f3eee4]'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WORK HISTORY BY DATE & DAY NAME (CLICKABLE DAY BUTTONS STRIP) */}
        {/* ========================================================================= */}
        <section className="border border-[#c1a05b]/30 bg-[#0c0d14] p-5 text-[#f3eee4] shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#c1a05b]/20 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
              <Calendar size={14} />
              <span>WORK HISTORY BY DATE & DAY NAME</span>
            </div>
            <span className="text-[9px] font-mono text-[#c1a05b] uppercase">
              Click a date button to view works for that day
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setActiveSpecificDate(null)}
              className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                activeSpecificDate === null
                  ? 'bg-[#c1a05b] text-[#08090f] border-[#c1a05b] shadow-sm'
                  : 'bg-[#08090f] text-[#f3eee4]/80 border-[#c1a05b]/30 hover:border-[#c1a05b] hover:text-[#f3eee4]'
              }`}
            >
              ALL DATES ({allEvidenceItems.length})
            </button>

            {dateGroups.map((group) => {
              const isActive = activeSpecificDate === group.date
              return (
                <button
                  key={group.date}
                  onClick={() => setActiveSpecificDate(isActive ? null : group.date)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c1a05b] text-[#08090f] border-[#c1a05b] shadow-md scale-[1.02]'
                      : 'bg-[#08090f] text-[#f3eee4]/90 border-[#c1a05b]/30 hover:border-[#c1a05b] hover:bg-[#0c0d14] hover:text-[#f3eee4]'
                  }`}
                  title={`Click to view ${group.count} work item(s) logged on ${group.formatted}`}
                >
                  <Calendar size={12} className={isActive ? 'text-[#08090f]' : 'text-[#c1a05b]'} />
                  <span>{group.formatted}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[8px] font-mono rounded ${
                      isActive ? 'bg-[#08090f] text-[#c1a05b]' : 'bg-[#c1a05b]/20 text-[#c1a05b]'
                    }`}
                  >
                    {group.count}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EVIDENCE GRID DISPLAY */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#0c0d14]">
          <span className="text-[#0c0d14] font-serif text-lg">
            {activeSpecificDate
              ? `Works performed on ${formatFullDate(activeSpecificDate)}`
              : 'All Verifiable Proofs & Logs'}
          </span>
          <span className="bg-[#0c0d14] text-[#c1a05b] px-3 py-1 font-mono">
            {filteredItems.length} Entries Found
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredItems.map((item, index) => {
              const fullDateDisplay = formatFullDate(item.date)
              const hasExternalLink = Boolean(item.evidenceUrl && item.evidenceUrl.trim() !== '')

              return (
                <div
                  key={item.id}
                  className="group border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] p-6 flex flex-col justify-between shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#c1a05b] hover:shadow-[0_12px_30px_rgba(193,160,91,0.2)] rounded-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em]">
                      <span className="bg-[#c1a05b] text-[#08090f] px-2.5 py-0.5 font-bold">
                        {item.category}
                      </span>
                      <span className="text-[#c1a05b] font-mono">
                        {item.sourceType === 'DAILY_UPDATE' ? 'DAILY LOG' : `EVID-0${(index % 9) + 1}`}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-light text-[#f3eee4] group-hover:text-[#c1a05b] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Date badge showing Day Name, Date, Month, Year */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#f3eee4]/80 font-semibold border-b border-[#f3eee4]/10 pb-2">
                      <span className="text-[#c1a05b]">Project: {item.project}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[#c1a05b] bg-[#08090f] px-2 py-0.5 border border-[#c1a05b]/30">
                        <Calendar size={11} /> {fullDateDisplay}
                      </span>
                    </div>

                    {item.workSummary && (
                      <p className="text-xs text-[#f3eee4]/80 leading-relaxed font-sans">
                        {item.workSummary}
                      </p>
                    )}

                    {item.learning && (
                      <div className="bg-[#2ec4b6]/15 border-l-2 border-[#2ec4b6] p-2.5 text-xs text-[#2ec4b6]">
                        <strong className="block text-[9px] font-bold uppercase tracking-wider mb-0.5">Key Learning:</strong>
                        {item.learning}
                      </div>
                    )}

                    {item.capabilities && item.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="bg-[#08090f] text-[#c1a05b] border border-[#c1a05b]/30 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Bar: ONLY show View Source button when an explicit link is present */}
                  <div className="mt-6 border-t border-[#f3eee4]/10 pt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em]">
                    <span className="text-[#f3eee4]/60">Verifiable Signal</span>
                    {hasExternalLink ? (
                      <a
                        href={item.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#c1a05b] text-[#08090f] px-3.5 py-1.5 font-bold hover:bg-[#f3eee4] transition-colors shadow-sm rounded-xs cursor-pointer"
                        title={`Open link: ${item.evidenceUrl}`}
                      >
                        View Source <ExternalLink size={12} />
                      </a>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border border-dashed border-[#c1a05b]/40 bg-[#0c0d14] p-12 text-center text-[#f3eee4] flex flex-col items-center justify-center space-y-4 shadow-xl">
            <FileText size={36} className="text-[#c1a05b]/60" />
            <h3 className="font-serif text-3xl font-light">No evidence logs found.</h3>
            <p className="text-xs text-[#f3eee4]/70 max-w-md">
              No artifacts matched your search query or selected date/category filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="bg-[#c1a05b] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#08090f] hover:bg-[#f3eee4] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>

      {showLogModal && <QuickCaptureModal onClose={() => setShowLogModal(false)} />}
    </main>
  )
}
