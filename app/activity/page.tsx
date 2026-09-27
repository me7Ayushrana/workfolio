'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock3,
  Filter,
  Folder,
  GraduationCap,
  Layers,
  Plus,
  Search,
  X,
  Link as LinkIcon
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { ActivityLogEntry, ActivityType, useWorkfolio } from '@/lib/workfolio-store'

function ActivityContent() {
  const searchParams = useSearchParams()
  const initialProjectId = searchParams.get('project') || ''
  const initialSkillId = searchParams.get('skill') || ''
  const initialType = (searchParams.get('type') as ActivityType) || ''

  const {
    activities,
    projects,
    skills,
    updateActivityProject,
    updateActivitySkill,
    deleteActivity
  } = useWorkfolio()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId)
  const [selectedSkillId, setSelectedSkillId] = useState(initialSkillId)
  const [selectedType, setSelectedType] = useState<string>(initialType)
  const [showLogModal, setShowLogModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityLogEntry | null>(null)

  // Re-linking modal states
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [relinkProjectId, setRelinkProjectId] = useState<string>('')
  const [relinkSkillId, setRelinkSkillId] = useState<string>('')

  const filteredActivities = useMemo(() => {
    let result = [...activities]

    if (selectedProjectId) {
      result = result.filter((a) => a.projectId === selectedProjectId)
    }

    if (selectedSkillId) {
      result = result.filter((a) => a.skillId === selectedSkillId)
    }

    if (selectedType) {
      result = result.filter((a) => a.type === selectedType)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.work.toLowerCase().includes(q) ||
          (a.learning && a.learning.toLowerCase().includes(q)) ||
          (a.struggle && a.struggle.toLowerCase().includes(q)) ||
          (a.projectTitle && a.projectTitle.toLowerCase().includes(q)) ||
          (a.skillName && a.skillName.toLowerCase().includes(q))
      )
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [activities, selectedProjectId, selectedSkillId, selectedType, searchQuery])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedSkill = skills.find((s) => s.id === selectedSkillId)

  const handleOpenRelink = (actId: string, currentProjId?: string, currentSkId?: string) => {
    setEditingActivityId(actId)
    setRelinkProjectId(currentProjId || '')
    setRelinkSkillId(currentSkId || '')
  }

  const handleSaveRelink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingActivityId) return
    updateActivityProject(editingActivityId, relinkProjectId || undefined)
    updateActivitySkill(editingActivityId, relinkSkillId || undefined)
    setEditingActivityId(null)
  }

  const activityTypesList: ActivityType[] = [
    'BUILD',
    'LEARN',
    'RESEARCH',
    'DEBUG',
    'DESIGN',
    'TEST',
    'MEETING',
    'SHIP',
    'PLAN',
    'OTHER'
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#0c0d14]/10 pb-4 gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/70 hover:text-[#111318]"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 bg-[#0c0d14] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b] shadow-sm"
        >
          <Plus size={13} /> + LOG ACTIVITY
        </button>
      </div>

      {/* Page Title Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#0c0d14]/15 pb-8 md:flex-row md:items-end">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
            WORKFOLIO WORK JOURNAL / PROOF LEDGER
          </span>
          <h1 className="mt-2 font-serif text-5xl font-light md:text-7xl">Work Journal.</h1>
          <p className="mt-2 text-sm text-[#111318]/70 max-w-xl">
            A continuous, chronological record of everything built, learned, solved, and shipped across projects and skills.
          </p>
        </div>
      </div>

      {/* ACTIVE FILTER BANNER IF APPLIED */}
      {(selectedProject || selectedSkill || selectedType) && (
        <div className="bg-[#9b7b3b]/15 border border-[#9b7b3b]/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[10px] uppercase tracking-wider text-[#9b7b3b]">
              FILTERED VIEW:
            </span>
            {selectedProject && (
              <span className="bg-[#0c0d14] text-[#f3eee4] px-2.5 py-1 text-[10px] font-bold uppercase">
                Project: {selectedProject.name}
              </span>
            )}
            {selectedSkill && (
              <span className="bg-[#c1a05b] text-[#f3eee4] px-2.5 py-1 text-[10px] font-bold uppercase">
                Skill: {selectedSkill.name}
              </span>
            )}
            {selectedType && (
              <span className="bg-[#9b7b3b] text-[#f3eee4] px-2.5 py-1 text-[10px] font-bold uppercase">
                Type: {selectedType}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedProjectId('')
              setSelectedSkillId('')
              setSelectedType('')
            }}
            className="text-[10px] font-bold uppercase text-[#7c2634] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* SEARCH & MULTI-CRITERIA FILTERS BAR */}
      <div className="bg-[#e5dac9] p-4 border border-[#0c0d14]/15 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search size={14} className="absolute left-3 top-3 text-[#111318]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work journal..."
              className="w-full border border-[#0c0d14]/20 bg-[#f3eee4] pl-9 pr-3 py-2 text-xs outline-none"
            />
          </div>

          {/* Filter by Project */}
          <div className="md:col-span-1">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full border border-[#0c0d14]/20 bg-[#f3eee4] px-3 py-2 text-xs outline-none"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Skill */}
          <div className="md:col-span-1">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full border border-[#0c0d14]/20 bg-[#f3eee4] px-3 py-2 text-xs outline-none"
            >
              <option value="">All Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  Skill: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Activity Type */}
          <div className="md:col-span-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-[#0c0d14]/20 bg-[#f3eee4] px-3 py-2 text-xs outline-none"
            >
              <option value="">All Activity Types</option>
              {activityTypesList.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* WORK JOURNAL TIMELINE FEED */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
          <span>ENTRIES ({filteredActivities.length})</span>
          <span>CHRONOLOGICAL STREAM</span>
        </div>

        <div className="space-y-6 border-l-2 border-[#0c0d14]/15 pl-6">
          {filteredActivities.length ? (
            filteredActivities.map((act) => {
              const actProj = projects.find((p) => p.id === act.projectId)
              const actSkill = skills.find((s) => s.id === act.skillId)

              return (
                <div key={act.id} className="relative bg-[#e5dac9]/40 border border-[#0c0d14]/15 p-6 space-y-4 hover:border-[#0c0d14]/40 transition-all">
                  <div className="absolute -left-[31px] top-7 h-3.5 w-3.5 rounded-full bg-[#0c0d14] border-2 border-[#f3eee4]" />

                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[.14em]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#0c0d14] text-[#f3eee4] px-2.5 py-1">{act.type}</span>

                      {/* Project Badge */}
                      {act.projectId && actProj ? (
                        <Link
                          href={`/projects/${act.projectId}`}
                          className="bg-[#9b7b3b] text-[#f3eee4] px-2.5 py-1 flex items-center gap-1 hover:underline"
                        >
                          <Folder size={10} /> {actProj.name} ↗
                        </Link>
                      ) : (
                        <span className="text-[#111318]/40 italic">No Project</span>
                      )}

                      {/* Skill Badge */}
                      {act.skillId && actSkill ? (
                        <Link
                          href={`/skills/${act.skillId}`}
                          className="bg-[#c1a05b] text-[#f3eee4] px-2.5 py-1 flex items-center gap-1 hover:underline"
                        >
                          <GraduationCap size={10} /> {actSkill.name} ↗
                        </Link>
                      ) : (
                        <span className="text-[#111318]/40 italic">No Skill</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[#111318]/60">
                      <span>{act.date} · {act.time}</span>
                      <button
                        onClick={() => setEditingActivity(act)}
                        className="bg-[#c1a05b]/20 hover:bg-[#c1a05b] text-[#c1a05b] hover:text-[#08090f] border border-[#c1a05b]/40 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        title="Edit entry details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete activity log: "${act.work.slice(0, 35)}..."?`)) {
                            deleteActivity(act.id)
                          }
                        }}
                        className="bg-[#e63946]/15 hover:bg-[#e63946] text-[#ff6b6b] hover:text-white border border-[#e63946]/30 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleOpenRelink(act.id, act.projectId, act.skillId)}
                        className="text-[#9b7b3b] hover:underline uppercase text-[9px] font-bold cursor-pointer"
                      >
                        [ Linkage ]
                      </button>
                    </div>
                  </div>

                  {/* Work Title */}
                  <h3 className="font-serif text-3xl font-light leading-snug">{act.work}</h3>

                  {/* Learnings, Struggles, Intentions */}
                  <div className="grid gap-3 md:grid-cols-3 text-xs pt-1">
                    {act.learning && (
                      <div className="bg-[#c1a05b]/10 border-l-2 border-[#c1a05b] p-3 text-[#c1a05b]">
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5 opacity-80">
                          WHAT WAS LEARNED
                        </span>
                        {act.learning}
                      </div>
                    )}

                    {act.struggle && (
                      <div className="bg-[#7c2634]/10 border-l-2 border-[#7c2634] p-3 text-[#7c2634]">
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5 opacity-80">
                          STRUGGLE / BLOCKER
                        </span>
                        {act.struggle}
                      </div>
                    )}

                    {act.intention && (
                      <div className="bg-[#9b7b3b]/10 border-l-2 border-[#9b7b3b] p-3 text-[#9b7b3b]">
                        <span className="text-[9px] font-bold uppercase tracking-wider block mb-0.5 opacity-80">
                          NEXT INTENTION
                        </span>
                        {act.intention}
                      </div>
                    )}
                  </div>

                  {/* Evidence & Capabilities */}
                  {(act.evidenceTitle || act.capabilities.length > 0) && (
                    <div className="flex flex-wrap items-center justify-between border-t border-[#0c0d14]/10 pt-3 text-xs gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#111318]/50">
                          CAPABILITIES:
                        </span>
                        {act.capabilities.map((c, idx) => (
                          <span key={idx} className="border border-[#0c0d14]/20 bg-[#f3eee4] px-2 py-0.5 text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>

                      {act.evidenceTitle && (
                        <div className="text-[10px] font-bold uppercase text-[#9b7b3b] flex items-center gap-1">
                          <span>EVIDENCE: {act.evidenceTitle}</span>
                          {act.evidenceUrl && (
                            <a href={act.evidenceUrl} target="_blank" rel="noreferrer" className="hover:underline text-[#c1a05b]">
                              [ View ↗ ]
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-[#e5dac9]/40 border border-[#0c0d14]/10 p-12 text-center space-y-3">
              <BookOpen className="mx-auto text-[#111318]/40" size={36} />
              <h3 className="font-serif text-3xl font-light">No Matching Work Entries</h3>
              <p className="text-xs text-[#111318]/60 max-w-sm mx-auto">
                No work entries match the selected project, skill, or search criteria.
              </p>
              <button
                onClick={() => setShowLogModal(true)}
                className="bg-[#0c0d14] px-6 py-2.5 text-xs font-bold uppercase tracking-[.16em] text-[#f3eee4]"
              >
                + Log Activity Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RELINK MODAL */}
      {editingActivityId && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0c0d14]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#f3eee4] p-6 text-[#111318] shadow-2xl border border-[#0c0d14]/20">
            <div className="flex justify-between items-center border-b border-[#0c0d14]/15 pb-3 mb-4">
              <h2 className="font-serif text-2xl font-light">Change Activity Linkage</h2>
              <button onClick={() => setEditingActivityId(null)} className="text-[#111318]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRelink} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                  Associated Project
                </label>
                <select
                  value={relinkProjectId}
                  onChange={(e) => setRelinkProjectId(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                >
                  <option value="">-- No Project (Independent Entry) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                  Associated Skill / Learning
                </label>
                <select
                  value={relinkSkillId}
                  onChange={(e) => setRelinkSkillId(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                >
                  <option value="">-- No Skill (Independent Entry) --</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#0c0d14]/15">
                <button
                  type="button"
                  onClick={() => setEditingActivityId(null)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#111318]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0c0d14] px-5 py-2 text-xs font-bold uppercase text-[#f3eee4]"
                >
                  Save Linkage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogModal && <QuickCaptureModal onClose={() => setShowLogModal(false)} />}
      {editingActivity && (
        <QuickCaptureModal
          activityToEdit={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  )
}

export default function ActivityPage() {
  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />
      <Suspense fallback={<div className="p-10 text-center text-xs">Loading Work Journal...</div>}>
        <ActivityContent />
      </Suspense>
    </main>
  )
}
