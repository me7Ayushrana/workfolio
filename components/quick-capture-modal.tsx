'use client'

import React, { useState, useEffect } from 'react'
import {
  Check,
  Plus,
  Search,
  Sparkles,
  X,
  ChevronDown,
  Folder,
  GraduationCap,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Layers,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react'
import { ActivityLogEntry, ActivityType, useWorkfolio } from '@/lib/workfolio-store'

interface QuickCaptureModalProps {
  onClose: () => void
  onSuccess?: () => void
  defaultProjectId?: string
  defaultSkillId?: string
  activityToEdit?: ActivityLogEntry
}

export function QuickCaptureModal({
  onClose,
  onSuccess,
  defaultProjectId,
  defaultSkillId,
  activityToEdit
}: QuickCaptureModalProps) {
  const { projects, skills, logActivityEntry, updateActivityEntry, deleteActivity, createProject, createSkill, executeAITask } = useWorkfolio()

  const isEditing = !!activityToEdit

  // Mode Selection: 'direct' or 'ai'
  const [entryMode, setEntryMode] = useState<'direct' | 'ai'>('direct')

  // AI Prompt State
  const [naturalInput, setNaturalInput] = useState('')
  const [isParsingAI, setIsParsingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Core Form State
  const [work, setWork] = useState(activityToEdit?.work || '')
  const [learning, setLearning] = useState(activityToEdit?.learning || '')
  const [struggle, setStruggle] = useState(activityToEdit?.struggle || '')
  const [intention, setIntention] = useState(activityToEdit?.intention || '')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activityToEdit?.projectId || defaultProjectId || '')
  const [selectedSkillId, setSelectedSkillId] = useState<string>(activityToEdit?.skillId || defaultSkillId || '')
  const [capabilitiesStr, setCapabilitiesStr] = useState(activityToEdit?.capabilities?.join(', ') || '')
  const [evidenceTitle, setEvidenceTitle] = useState(activityToEdit?.evidenceTitle || '')
  const [evidenceUrl, setEvidenceUrl] = useState(activityToEdit?.evidenceUrl || '')
  const [activityType, setActivityType] = useState<ActivityType>(activityToEdit?.type || 'BUILD')
  
  // UI Expanders
  const [showReflections, setShowReflections] = useState(
    !!activityToEdit?.learning || !!activityToEdit?.struggle || !!activityToEdit?.intention
  )
  const [showEvidence, setShowEvidence] = useState(
    !!activityToEdit?.evidenceTitle || !!activityToEdit?.evidenceUrl || !!activityToEdit?.capabilities?.length
  )

  const [isSaved, setIsSaved] = useState(false)
  const [savedAction, setSavedAction] = useState<'created' | 'updated' | 'deleted'>('created')

  // Search & Dropdown states
  const [projectSearch, setProjectSearch] = useState('')
  const [skillSearch, setSkillSearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)

  // Inline Creation states
  const [showInlineProject, setShowInlineProject] = useState(false)
  const [newProjName, setNewProjName] = useState('')
  const [newProjCategory, setNewProjCategory] = useState('AI Systems')

  const [showInlineSkill, setShowInlineSkill] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillGoal, setNewSkillGoal] = useState('')

  useEffect(() => {
    if (!activityToEdit) {
      if (defaultProjectId) setSelectedProjectId(defaultProjectId)
      if (defaultSkillId) setSelectedSkillId(defaultSkillId)
    }
  }, [defaultProjectId, defaultSkillId, activityToEdit])

  const activeProjects = projects.filter((p) => p.status !== 'Archived')
  const filteredProjects = activeProjects.filter(
    (p) => p.name.toLowerCase().includes(projectSearch.toLowerCase()) || p.category.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const activeSkills = skills.filter((s) => s.status !== 'ARCHIVED')
  const filteredSkills = activeSkills.filter(
    (s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()) || s.category.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedSkill = skills.find((s) => s.id === selectedSkillId)

  // Quick Preset Templates
  const presetPrompts = [
    { label: 'Feature Built', text: 'Built core functionality for ' },
    { label: 'Bug Resolved', text: 'Fixed issue where ' },
    { label: 'Concept Learned', text: 'Studied and implemented ' },
    { label: 'Refactored & Tested', text: 'Optimized performance and test coverage for ' }
  ]

  const handleApplyPreset = (prefix: string) => {
    setWork((prev) => (prev.trim() ? `${prefix}${prev}` : prefix))
  }

  const handleAIParse = async () => {
    if (!naturalInput.trim() || isParsingAI) return
    setIsParsingAI(true)
    setAiError(null)
    try {
      const parsed = await executeAITask('ACTIVITY_STRUCTURING', { description: naturalInput })
      if (parsed) {
        setWork(parsed.work || naturalInput)
        if (parsed.learning) setLearning(parsed.learning)
        if (parsed.struggle) setStruggle(parsed.struggle)
        if (parsed.intention) setIntention(parsed.intention)
        if (parsed.type) setActivityType(parsed.type)
        if (parsed.capabilities?.length) setCapabilitiesStr(parsed.capabilities.join(', '))
        setEntryMode('direct')
        setShowReflections(!!parsed.learning || !!parsed.struggle || !!parsed.intention)
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to parse text. Please ensure your AI API key is configured.')
    } finally {
      setIsParsingAI(false)
    }
  }

  const handleCreateProjectInline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjName.trim()) return
    const created = createProject(newProjName.trim(), 'Created during daily log session.', newProjCategory, 'In progress')
    setSelectedProjectId(created.id)
    setShowInlineProject(false)
    setNewProjName('')
  }

  const handleCreateSkillInline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    const created = createSkill({
      name: newSkillName.trim(),
      category: 'Engineering',
      currentLevel: 'Learning',
      learningGoal: newSkillGoal.trim() || 'Master practical application.',
      status: 'LEARNING',
      currentlyLearning: 'Foundational concepts',
      nextStep: 'Build prototype implementation'
    })
    setSelectedSkillId(created.id)
    setShowInlineSkill(false)
    setNewSkillName('')
    setNewSkillGoal('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!work.trim()) return

    const caps = capabilitiesStr.split(',').map((c) => c.trim()).filter(Boolean)

    if (isEditing && activityToEdit) {
      updateActivityEntry(activityToEdit.id, {
        work: work.trim(),
        learning: learning.trim() || undefined,
        struggle: struggle.trim() || undefined,
        intention: intention.trim() || undefined,
        projectId: selectedProjectId || undefined,
        skillId: selectedSkillId || undefined,
        capabilities: caps,
        evidenceTitle: evidenceTitle.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        type: activityType
      })
      setSavedAction('updated')
    } else {
      logActivityEntry({
        work: work.trim(),
        learning: learning.trim() || undefined,
        struggle: struggle.trim() || undefined,
        intention: intention.trim() || undefined,
        projectId: selectedProjectId || undefined,
        skillId: selectedSkillId || undefined,
        capabilities: caps,
        evidenceTitle: evidenceTitle.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        type: activityType,
        durationMinutes: 45
      })
      setSavedAction('created')
    }

    setIsSaved(true)
    setTimeout(() => {
      onSuccess?.()
      onClose()
    }, 600)
  }

  const handleDelete = () => {
    if (!activityToEdit) return
    if (confirm(`Are you sure you want to delete this activity entry?`)) {
      deleteActivity(activityToEdit.id)
      setSavedAction('deleted')
      setIsSaved(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 500)
    }
  }

  const categories: { type: ActivityType; label: string }[] = [
    { type: 'BUILD', label: 'Build' },
    { type: 'LEARN', label: 'Learn' },
    { type: 'RESEARCH', label: 'Research' },
    { type: 'DEBUG', label: 'Debug' },
    { type: 'DESIGN', label: 'Design' },
    { type: 'TEST', label: 'Test' },
    { type: 'SHIP', label: 'Ship' },
    { type: 'PLAN', label: 'Plan' },
    { type: 'OTHER', label: 'Other' }
  ]

  const charCount = work.length
  const wordCount = work.trim() ? work.trim().split(/\s+/).length : 0

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER: CLEAN, ELEGANT ARCHITECTURE */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#090a10] px-8 py-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
              <span>WORKFOLIO LOG CONSOLE</span>
            </div>
            <h2 className="font-serif text-2xl font-light text-[#f3eee4] mt-0.5">
              {isEditing ? 'Edit Activity Entry' : 'Log Daily Activity'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setEntryMode('direct')}
                  className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    entryMode === 'direct'
                      ? 'bg-[#c1a05b] text-[#08090f] shadow-sm'
                      : 'text-[#f3eee4]/60 hover:text-white'
                  }`}
                >
                  Direct Entry
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('ai')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                    entryMode === 'ai'
                      ? 'bg-[#c1a05b] text-[#08090f] shadow-sm'
                      : 'text-[#f3eee4]/60 hover:text-white'
                  }`}
                >
                  <Sparkles size={12} />
                  <span>AI Smart Log</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[#f3eee4]/60 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONTENT BODY */}
        {/* ========================================================================= */}
        {isSaved ? (
          <div className="my-14 text-center space-y-4 px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c1a05b]/10 border border-[#c1a05b]/40 text-[#c1a05b]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-serif text-3xl font-light text-[#f3eee4]">
              {savedAction === 'updated'
                ? 'Activity Updated!'
                : savedAction === 'deleted'
                ? 'Activity Deleted!'
                : 'Activity Logged!'}
            </h3>
            <p className="text-xs text-[#f3eee4]/70 max-w-sm mx-auto leading-relaxed">
              Synchronized to your Work Journal, Project Ledger, and Skill Mapping.
            </p>
          </div>
        ) : (
          <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* AI SMART LOG MODE */}
            {entryMode === 'ai' && !isEditing && (
              <div className="space-y-4 rounded-2xl border border-[#c1a05b]/30 bg-[#121420] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
                    <Sparkles size={15} />
                    <span>AI NATURAL LANGUAGE PARSER</span>
                  </div>
                  <span className="text-[11px] text-[#f3eee4]/50">Describe what you did in plain English</span>
                </div>

                <textarea
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="e.g. Spent 2 hours building receipt threshold preprocessing for Expense Tracker project using Computer Vision skill..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0d14] p-4 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#c1a05b] focus:ring-1 focus:ring-[#c1a05b] transition-all leading-relaxed"
                  autoFocus
                />

                {aiError && (
                  <p className="text-xs text-[#ff6b6b] bg-[#ff6b6b]/10 p-3 rounded-xl border border-[#ff6b6b]/20">
                    {aiError}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#f3eee4]/40">
                    Gemini AI will automatically extract work, learning, struggles, and tags.
                  </p>
                  <button
                    type="button"
                    onClick={handleAIParse}
                    disabled={isParsingAI || !naturalInput.trim()}
                    className="flex items-center gap-2 rounded-xl bg-[#c1a05b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#08090f] hover:bg-white transition-all disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    <Sparkles size={14} />
                    <span>{isParsingAI ? 'Processing...' : 'Structure with AI'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* DIRECT ENTRY MODE */}
            {(entryMode === 'direct' || isEditing) && (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* CATEGORY SELECTOR PILLS */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
                    Activity Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const selected = activityType === c.type
                      return (
                        <button
                          key={c.type}
                          type="button"
                          onClick={() => setActivityType(c.type)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#c1a05b] text-[#08090f] shadow-md scale-[1.02]'
                              : 'bg-white/5 text-[#f3eee4]/70 border border-white/10 hover:border-[#c1a05b]/40 hover:text-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* PRESET CHIPS */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] uppercase font-mono text-[#f3eee4]/40 mr-1">Quick Starters:</span>
                    {presetPrompts.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleApplyPreset(p.text)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#f3eee4]/70 hover:border-[#c1a05b]/40 hover:text-white transition-all cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* MAIN ENTRY TEXTAREA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">
                      What did you accomplish? <span className="text-[#c1a05b]">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#f3eee4]/40">
                      {wordCount} words · {charCount} chars
                    </span>
                  </div>
                  <textarea
                    value={work}
                    onChange={(e) => setWork(e.target.value)}
                    rows={4}
                    placeholder="Describe what you worked on, shipped, or solved..."
                    className="w-full rounded-2xl border border-white/15 bg-[#121420] p-4 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#c1a05b] focus:ring-1 focus:ring-[#c1a05b] transition-all leading-relaxed"
                    required
                    autoFocus={!isEditing}
                  />
                </div>

                {/* PROJECT & SKILL CONNECTORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* PROJECT SELECTOR */}
                  <div className="relative space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] flex items-center gap-1.5">
                        <Folder size={13} /> Project Association
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowInlineProject(!showInlineProject)}
                        className="text-[10px] font-bold text-[#c1a05b] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={10} /> New
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProjectDropdown(!showProjectDropdown)
                        setShowSkillDropdown(false)
                      }}
                      className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#121420] px-4 py-3 text-left text-xs text-[#f3eee4] outline-none hover:border-[#c1a05b]/50 transition-all cursor-pointer"
                    >
                      <span className="truncate font-medium">
                        {selectedProject ? selectedProject.name : 'No Project (General Entry)'}
                      </span>
                      <ChevronDown size={14} className="text-[#c1a05b]" />
                    </button>

                    {showProjectDropdown && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#c1a05b]/30 bg-[#121420] p-2 shadow-2xl backdrop-blur-xl">
                        <div className="relative mb-2">
                          <Search size={12} className="absolute left-3 top-3 text-[#f3eee4]/40" />
                          <input
                            type="text"
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            placeholder="Filter projects..."
                            className="w-full rounded-lg border border-white/10 bg-[#0c0d14] pl-8 pr-3 py-1.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectId('')
                            setShowProjectDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                            !selectedProjectId ? 'bg-[#c1a05b] text-[#08090f] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                          }`}
                        >
                          No Project (General Entry)
                        </button>

                        <div className="my-1 border-t border-white/10" />

                        {filteredProjects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(p.id)
                              setShowProjectDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg transition-colors ${
                              selectedProjectId === p.id ? 'bg-[#c1a05b] text-[#08090f] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            <span className="text-[9px] uppercase font-mono opacity-70">{p.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SKILL SELECTOR */}
                  <div className="relative space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#2ec4b6] flex items-center gap-1.5">
                        <GraduationCap size={13} /> Skill Association
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowInlineSkill(!showInlineSkill)}
                        className="text-[10px] font-bold text-[#2ec4b6] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={10} /> New
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillDropdown(!showSkillDropdown)
                        setShowProjectDropdown(false)
                      }}
                      className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#121420] px-4 py-3 text-left text-xs text-[#f3eee4] outline-none hover:border-[#2ec4b6]/50 transition-all cursor-pointer"
                    >
                      <span className="truncate font-medium">
                        {selectedSkill ? selectedSkill.name : 'No Skill (General Entry)'}
                      </span>
                      <ChevronDown size={14} className="text-[#2ec4b6]" />
                    </button>

                    {showSkillDropdown && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#2ec4b6]/30 bg-[#121420] p-2 shadow-2xl backdrop-blur-xl">
                        <div className="relative mb-2">
                          <Search size={12} className="absolute left-3 top-3 text-[#f3eee4]/40" />
                          <input
                            type="text"
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            placeholder="Filter skills..."
                            className="w-full rounded-lg border border-white/10 bg-[#0c0d14] pl-8 pr-3 py-1.5 text-xs text-[#f3eee4] outline-none focus:border-[#2ec4b6]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSkillId('')
                            setShowSkillDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                            !selectedSkillId ? 'bg-[#2ec4b6] text-[#08090f] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                          }`}
                        >
                          No Skill (General Entry)
                        </button>

                        <div className="my-1 border-t border-white/10" />

                        {filteredSkills.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSkillId(s.id)
                              setShowSkillDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg transition-colors ${
                              selectedSkillId === s.id ? 'bg-[#2ec4b6] text-[#08090f] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                            }`}
                          >
                            <span className="truncate">{s.name}</span>
                            <span className="text-[9px] uppercase font-mono opacity-70">{s.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* INLINE PROJECT CREATION */}
                {showInlineProject && (
                  <div className="rounded-2xl border border-[#c1a05b]/30 bg-[#121420] p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
                      <span>Create New Project</span>
                      <button type="button" onClick={() => setShowInlineProject(false)} className="text-white/40 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Project Name *"
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateProjectInline}
                        className="rounded-xl bg-[#c1a05b] px-4 py-2 text-xs font-bold text-[#08090f] hover:bg-white transition-all cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                {/* INLINE SKILL CREATION */}
                {showInlineSkill && (
                  <div className="rounded-2xl border border-[#2ec4b6]/30 bg-[#121420] p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2ec4b6]">
                      <span>Create New Skill</span>
                      <button type="button" onClick={() => setShowInlineSkill(false)} className="text-white/40 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Skill Name *"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#2ec4b6]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateSkillInline}
                        className="rounded-xl bg-[#2ec4b6] px-4 py-2 text-xs font-bold text-[#08090f] hover:bg-white transition-all cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                {/* COLLAPSIBLE REFLECTIONS & INTENTIONS */}
                <div className="border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReflections(!showReflections)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c1a05b] hover:text-white transition-all cursor-pointer"
                  >
                    <span>{showReflections ? '− Hide Learning & Intentions' : '+ Add Learning, Struggles & Next Intentions'}</span>
                  </button>

                  {showReflections && (
                    <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-[#121420] p-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2ec4b6]">
                          What did you learn? (Key Takeaway)
                        </label>
                        <input
                          value={learning}
                          onChange={(e) => setLearning(e.target.value)}
                          placeholder="e.g. Mastered adaptive thresholding for receipt OCR..."
                          className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-4 py-2.5 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#2ec4b6]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">
                          Struggles / Blockers
                        </label>
                        <input
                          value={struggle}
                          onChange={(e) => setStruggle(e.target.value)}
                          placeholder="e.g. Low contrast receipt image noise..."
                          className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-4 py-2.5 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#ff6b6b]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">
                          What's Next? (Next Intention)
                        </label>
                        <input
                          value={intention}
                          onChange={(e) => setIntention(e.target.value)}
                          placeholder="e.g. Implement cross-validation benchmark suite..."
                          className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-4 py-2.5 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#c1a05b]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* COLLAPSIBLE EVIDENCE ARTIFACTS */}
                <div className="border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4]/70 hover:text-white transition-all cursor-pointer"
                  >
                    <span>{showEvidence ? '− Hide Proof & Evidence Links' : '+ Attach Proof Artifact & Capabilities'}</span>
                  </button>

                  {showEvidence && (
                    <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-[#121420] p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70">
                            Evidence Title / Proof Name
                          </label>
                          <input
                            value={evidenceTitle}
                            onChange={(e) => setEvidenceTitle(e.target.value)}
                            placeholder="e.g. OCR Benchmark Test Screenshot"
                            className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70">
                            Evidence URL / PR Link
                          </label>
                          <input
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="e.g. https://github.com/org/repo/pull/42"
                            className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70">
                          Capabilities Used (Comma Separated)
                        </label>
                        <input
                          value={capabilitiesStr}
                          onChange={(e) => setCapabilitiesStr(e.target.value)}
                          placeholder="React, Computer Vision, API Design"
                          className="w-full rounded-xl border border-white/10 bg-[#0c0d14] px-3.5 py-2.5 text-xs text-[#f3eee4] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* MODAL ACTION FOOTER */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-2 text-xs font-bold text-[#ff6b6b] hover:bg-[#ff6b6b] hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete Entry
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f3eee4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c1a05b] to-[#a3823d] px-7 py-2.5 text-xs font-bold uppercase tracking-[.18em] text-[#08090f] hover:opacity-95 transition-all cursor-pointer shadow-lg"
                    >
                      <span>{isEditing ? 'Save Changes' : 'Publish Activity Log'}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
