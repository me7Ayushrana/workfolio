'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, Plus, Search, Sparkles, X, ChevronDown, Folder, GraduationCap, 
  Edit3, Trash2, Rocket, Bug, Lightbulb, Zap, FileCode2, Clock, Layers, ArrowRight
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
  const { projects, skills, logActivityEntry, updateActivityEntry, deleteActivity, createProject, createSkill } = useWorkfolio()

  const isEditing = !!activityToEdit

  const [work, setWork] = useState(activityToEdit?.work || '')
  const [learning, setLearning] = useState(activityToEdit?.learning || '')
  const [struggle, setStruggle] = useState(activityToEdit?.struggle || '')
  const [intention, setIntention] = useState(activityToEdit?.intention || '')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activityToEdit?.projectId || defaultProjectId || '')
  const [selectedSkillId, setSelectedSkillId] = useState<string>(activityToEdit?.skillId || defaultSkillId || '')
  const [capabilitiesStr, setCapabilitiesStr] = useState(activityToEdit?.capabilities?.join(', ') || 'React, System Architecture')
  const [evidenceTitle, setEvidenceTitle] = useState(activityToEdit?.evidenceTitle || '')
  const [evidenceUrl, setEvidenceUrl] = useState(activityToEdit?.evidenceUrl || '')
  const [activityType, setActivityType] = useState<ActivityType>(activityToEdit?.type || 'BUILD')
  const [showAdvanced, setShowAdvanced] = useState(!!activityToEdit?.evidenceTitle || !!activityToEdit?.evidenceUrl)
  const [isSaved, setIsSaved] = useState(false)
  const [savedAction, setSavedAction] = useState<'created' | 'updated' | 'deleted'>('created')

  // Search states for dropdowns
  const [projectSearch, setProjectSearch] = useState('')
  const [skillSearch, setSkillSearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)

  // Quick Inline Creation States
  const [showInlineNewProject, setShowInlineNewProject] = useState(false)
  const [newProjName, setNewProjName] = useState('')
  const [newProjCategory, setNewProjCategory] = useState('AI')
  const [newProjDesc, setNewProjDesc] = useState('')

  const [showInlineNewSkill, setShowInlineNewSkill] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('AI / Data')
  const [newSkillGoal, setNewSkillGoal] = useState('')

  useEffect(() => {
    if (!activityToEdit) {
      if (defaultProjectId) setSelectedProjectId(defaultProjectId)
      if (defaultSkillId) setSelectedSkillId(defaultSkillId)
    }
  }, [defaultProjectId, defaultSkillId, activityToEdit])

  const activeProjects = projects.filter((p) => p.status !== 'Archived')
  const filteredProjects = activeProjects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(projectSearch.toLowerCase())
  )

  const activeSkills = skills.filter((s) => s.status !== 'ARCHIVED')
  const filteredSkills = activeSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedSkill = skills.find((s) => s.id === selectedSkillId)

  // Starter Template Presets
  const quickTemplates = [
    { icon: Rocket, label: 'Feature Built', text: 'Built core module and architecture for ' },
    { icon: Bug, label: 'Bug Resolved', text: 'Fixed issue where ' },
    { icon: Lightbulb, label: 'Concept Learned', text: 'Studied and implemented ' },
    { icon: Zap, label: 'Optimized', text: 'Optimized performance and data flow in ' },
    { icon: FileCode2, label: 'Docs & Tests', text: 'Added integration tests and documentation for ' }
  ]

  const applyTemplate = (prefix: string) => {
    if (!work.trim()) {
      setWork(prefix)
    } else {
      setWork((prev) => `${prefix}${prev}`)
    }
  }

  const handleCreateProjectInline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjName.trim()) return
    const created = createProject(
      newProjName.trim(),
      newProjDesc.trim() || 'Created during activity session.',
      newProjCategory,
      'In progress'
    )
    setSelectedProjectId(created.id)
    setShowInlineNewProject(false)
    setNewProjName('')
    setNewProjDesc('')
  }

  const handleCreateSkillInline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    const created = createSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      currentLevel: 'Learning',
      learningGoal: newSkillGoal.trim() || 'Master practical concepts.',
      status: 'LEARNING',
      currentlyLearning: 'Foundational concepts and application',
      nextStep: 'Complete first practice project'
    })
    setSelectedSkillId(created.id)
    setShowInlineNewSkill(false)
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
    }, 800)
  }

  const handleDelete = () => {
    if (!activityToEdit) return
    if (confirm(`Are you sure you want to delete this activity log entry?\n"${activityToEdit.work.slice(0, 40)}..."`)) {
      deleteActivity(activityToEdit.id)
      setSavedAction('deleted')
      setIsSaved(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 700)
    }
  }

  const activityTypes: { type: ActivityType; label: string; bg: string }[] = [
    { type: 'BUILD', label: 'Build', bg: 'bg-[#c1a05b] text-[#0c1612]' },
    { type: 'LEARN', label: 'Learn', bg: 'bg-[#2ec4b6] text-[#0c1612]' },
    { type: 'RESEARCH', label: 'Research', bg: 'bg-[#8e7cc3] text-[#ffffff]' },
    { type: 'DEBUG', label: 'Debug', bg: 'bg-[#e63946] text-[#ffffff]' },
    { type: 'DESIGN', label: 'Design', bg: 'bg-[#ff9f1c] text-[#0c1612]' },
    { type: 'TEST', label: 'Test', bg: 'bg-[#45a29e] text-[#0c1612]' },
    { type: 'MEETING', label: 'Meeting', bg: 'bg-[#6c757d] text-[#ffffff]' },
    { type: 'SHIP', label: 'Ship', bg: 'bg-[#38b000] text-[#ffffff]' },
    { type: 'PLAN', label: 'Plan', bg: 'bg-[#0077b6] text-[#ffffff]' },
    { type: 'OTHER', label: 'Other', bg: 'bg-[#4a4e69] text-[#ffffff]' }
  ]

  // Live Metrics
  const charCount = work.length
  const wordCount = work.trim() ? work.trim().split(/\s+/).length : 0

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#12241b] p-7 text-[#f3eee4] shadow-2xl border border-[#c1a05b]/40 rounded-xl max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f3eee4]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#c1a05b]/20 border border-[#c1a05b]/40 flex items-center justify-center text-[#c1a05b]">
              {isEditing ? <Edit3 size={20} /> : <Plus size={22} />}
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                {isEditing ? 'UPDATE WORKLOG ENTRY' : 'FAST WORK & LEARNING CAPTURE'}
              </span>
              <h2 className="font-serif text-3xl font-light text-[#f3eee4]">
                {isEditing ? 'Edit Activity Log' : '+ Log Activity'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 bg-[#e63946]/20 border border-[#e63946]/40 hover:bg-[#e63946] text-[#ff6b6b] hover:text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded cursor-pointer"
                title="Delete this entry"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
            <button 
              onClick={onClose} 
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#f3eee4]/60 hover:text-[#f3eee4] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {isSaved ? (
          <div className="my-12 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-[#c1a05b] animate-bounce" size={56} />
            <h3 className="font-serif text-3xl font-light text-[#f3eee4]">
              {savedAction === 'updated' 
                ? 'Activity Log Updated!' 
                : savedAction === 'deleted' 
                ? 'Activity Log Deleted!' 
                : 'Saved to Workfolio Workspace!'}
            </h3>
            <p className="text-xs text-[#f3eee4]/75 max-w-sm mx-auto leading-relaxed">
              Your updates have been synchronized across your Work Journal, Project Timelines, and Skill Maps.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            
            {/* 1. Quick Starter Preset Chips */}
            {!isEditing && (
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                  QUICK TEMPLATE PRESETS (CLICK TO INSERT)
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((tmpl) => {
                    const Icon = tmpl.icon
                    return (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => applyTemplate(tmpl.text)}
                        className="flex items-center gap-1.5 bg-[#0c1612] hover:bg-[#c1a05b] hover:text-[#0c1612] border border-[#c1a05b]/30 px-3 py-1 text-[10px] font-medium text-[#f3eee4]/80 transition-all rounded-full cursor-pointer group"
                      >
                        <Icon size={12} className="text-[#c1a05b] group-hover:text-[#0c1612]" />
                        <span>{tmpl.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. Activity Type Pills */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b] mb-2">
                SELECT ACTIVITY CATEGORY
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activityTypes.map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setActivityType(t.type)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded border cursor-pointer ${
                      activityType === t.type
                        ? `${t.bg} border-transparent shadow-md scale-105`
                        : 'bg-[#0c1612] text-[#f3eee4]/70 border-[#f3eee4]/15 hover:border-[#c1a05b]/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. WHAT DID YOU WORK ON? */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">
                  WHAT DID YOU WORK ON? <span className="text-[#ff6b6b]">*</span>
                </label>
                <span className="text-[9px] font-mono text-[#c1a05b]">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
              <textarea
                value={work}
                onChange={(e) => setWork(e.target.value)}
                rows={3}
                autoFocus
                placeholder="e.g. Built OCR preprocessing module for low-light receipt handling & added validation rules..."
                className="w-full border border-[#f3eee4]/20 bg-[#0c1612] p-3.5 text-xs text-[#f3eee4] placeholder-[#f3eee4]/40 outline-none focus:border-[#c1a05b] focus:ring-1 focus:ring-[#c1a05b] rounded transition-all leading-relaxed"
                required
              />
            </div>

            {/* 4. Project & Skill Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Project Selector */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] flex items-center gap-1.5">
                    <Folder size={13} /> Associate Project
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInlineNewProject(!showInlineNewProject)}
                    className="text-[9px] font-bold uppercase tracking-wider text-[#c1a05b] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={10} /> + New
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProjectDropdown(!showProjectDropdown)
                    setShowSkillDropdown(false)
                  }}
                  className="w-full flex items-center justify-between border border-[#f3eee4]/20 bg-[#0c1612] px-3.5 py-2.5 text-left text-xs text-[#f3eee4] outline-none hover:border-[#c1a05b] rounded transition-all cursor-pointer"
                >
                  <span className="truncate font-medium">
                    {selectedProject ? `${selectedProject.name} (${selectedProject.category})` : 'No Project (General Entry)'}
                  </span>
                  <ChevronDown size={14} className="text-[#c1a05b]" />
                </button>

                {showProjectDropdown && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto border border-[#c1a05b]/40 bg-[#0c1612] p-2 shadow-2xl rounded">
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-[#f3eee4]/40" />
                      <input
                        type="text"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder="Search active projects..."
                        className="w-full border border-[#f3eee4]/20 bg-[#12241b] pl-7 pr-2 py-1.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId('')
                        setShowProjectDropdown(false)
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs transition-colors rounded ${
                        !selectedProjectId ? 'bg-[#c1a05b] text-[#0c1612] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                      }`}
                    >
                      No Project (Independent Entry)
                    </button>

                    <div className="my-1 border-t border-[#f3eee4]/10" />

                    {filteredProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id)
                          setShowProjectDropdown(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center justify-between transition-colors rounded ${
                          selectedProjectId === p.id ? 'bg-[#c1a05b] text-[#0c1612] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-[9px] uppercase font-mono opacity-80">{p.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Skill Selector */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[.16em] text-[#2ec4b6] flex items-center gap-1.5">
                    <GraduationCap size={13} /> Associate Skill / Learning
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInlineNewSkill(!showInlineNewSkill)}
                    className="text-[9px] font-bold uppercase tracking-wider text-[#2ec4b6] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={10} /> + New
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowSkillDropdown(!showSkillDropdown)
                    setShowProjectDropdown(false)
                  }}
                  className="w-full flex items-center justify-between border border-[#f3eee4]/20 bg-[#0c1612] px-3.5 py-2.5 text-left text-xs text-[#f3eee4] outline-none hover:border-[#2ec4b6] rounded transition-all cursor-pointer"
                >
                  <span className="truncate font-medium">
                    {selectedSkill ? `${selectedSkill.name} (${selectedSkill.category})` : 'No Skill (General Entry)'}
                  </span>
                  <ChevronDown size={14} className="text-[#2ec4b6]" />
                </button>

                {showSkillDropdown && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto border border-[#2ec4b6]/40 bg-[#0c1612] p-2 shadow-2xl rounded">
                    <div className="relative mb-2">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-[#f3eee4]/40" />
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="Search skills..."
                        className="w-full border border-[#f3eee4]/20 bg-[#12241b] pl-7 pr-2 py-1.5 text-xs text-[#f3eee4] outline-none focus:border-[#2ec4b6]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSkillId('')
                        setShowSkillDropdown(false)
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs transition-colors rounded ${
                        !selectedSkillId ? 'bg-[#2ec4b6] text-[#0c1612] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                      }`}
                    >
                      No Skill (General Entry)
                    </button>

                    <div className="my-1 border-t border-[#f3eee4]/10" />

                    {filteredSkills.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkillId(s.id)
                          setShowSkillDropdown(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs flex items-center justify-between transition-colors rounded ${
                          selectedSkillId === s.id ? 'bg-[#2ec4b6] text-[#0c1612] font-bold' : 'hover:bg-white/5 text-[#f3eee4]'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="text-[9px] uppercase font-mono opacity-80">{s.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Inline Forms */}
            {showInlineNewProject && (
              <div className="border border-[#c1a05b]/40 bg-[#0c1612] p-4 space-y-2.5 text-xs rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#c1a05b]">
                    QUICK CREATE PROJECT
                  </span>
                  <button type="button" onClick={() => setShowInlineNewProject(false)} className="text-[#f3eee4]/50">
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Project Name *"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Category (e.g. AI, Web)"
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value)}
                    className="w-1/2 border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateProjectInline}
                    className="w-1/2 bg-[#c1a05b] text-[#0c1612] font-bold text-[10px] uppercase tracking-wider py-2 rounded cursor-pointer"
                  >
                    Create & Select
                  </button>
                </div>
              </div>
            )}

            {showInlineNewSkill && (
              <div className="border border-[#2ec4b6]/40 bg-[#0c1612] p-4 space-y-2.5 text-xs rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#2ec4b6]">
                    QUICK CREATE SKILL
                  </span>
                  <button type="button" onClick={() => setShowInlineNewSkill(false)} className="text-[#f3eee4]/50">
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Skill Name (e.g. React, Computer Vision) *"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#2ec4b6]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Learning Goal"
                    value={newSkillGoal}
                    onChange={(e) => setNewSkillGoal(e.target.value)}
                    className="w-1/2 border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateSkillInline}
                    className="w-1/2 bg-[#2ec4b6] text-[#0c1612] font-bold text-[10px] uppercase tracking-wider py-2 rounded cursor-pointer"
                  >
                    Create & Select
                  </button>
                </div>
              </div>
            )}

            {/* 5. WHAT DID YOU LEARN? */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#2ec4b6]">
                WHAT DID YOU LEARN? (KEY TAKEAWAY)
              </label>
              <input
                value={learning}
                onChange={(e) => setLearning(e.target.value)}
                placeholder="e.g. Learned thresholding technique for low-contrast images..."
                className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3.5 py-2.5 text-xs text-[#f3eee4] placeholder-[#f3eee4]/40 outline-none focus:border-[#2ec4b6] rounded transition-all"
              />
            </div>

            {/* 6. STRUGGLES / BLOCKERS */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#ff6b6b]">
                WHAT DID YOU STRUGGLE WITH / BLOCKERS?
              </label>
              <input
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                placeholder="e.g. Currency sign misclassification on degraded receipts..."
                className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3.5 py-2.5 text-xs text-[#f3eee4] placeholder-[#f3eee4]/40 outline-none focus:border-[#ff6b6b] rounded transition-all"
              />
            </div>

            {/* 7. NEXT INTENTION */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-[.18em] text-[#c1a05b]">
                WHAT'S NEXT? (NEXT INTENTION)
              </label>
              <input
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="e.g. Add adaptive thresholding and bounding box validation..."
                className="w-full border border-[#f3eee4]/20 bg-[#0c1612] px-3.5 py-2.5 text-xs text-[#f3eee4] placeholder-[#f3eee4]/40 outline-none focus:border-[#c1a05b] rounded transition-all"
              />
            </div>

            {/* 8. Evidence Artifacts & Capabilities */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showAdvanced ? '− Hide Evidence & Capabilities' : '+ Add Evidence Artifacts & Capabilities'}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 border-t border-[#f3eee4]/15 pt-3 bg-[#0c1612] p-4 border border-[#f3eee4]/15 rounded">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]/70 mb-1">
                      Evidence Title / Proof Artifact
                    </label>
                    <input
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      placeholder="e.g. OCR Pipeline Test Screenshot & Benchmark Log"
                      className="w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]/70 mb-1">
                      Evidence URL / Repository Link
                    </label>
                    <input
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      placeholder="e.g. https://github.com/org/repo/pull/42"
                      className="w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]/70 mb-1">
                      Capabilities (Comma separated)
                    </label>
                    <input
                      value={capabilitiesStr}
                      onChange={(e) => setCapabilitiesStr(e.target.value)}
                      placeholder="React, Computer Vision, API Design"
                      className="w-full border border-[#f3eee4]/20 bg-[#12241b] px-3 py-2 text-xs text-[#f3eee4] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-[#f3eee4]/15 pt-5">
              <div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-xs font-bold uppercase tracking-wider text-[#ff6b6b] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete Entry
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4]/60 hover:text-[#f3eee4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#c1a05b] text-[#0c1612] px-6 py-2.5 text-xs font-bold uppercase tracking-[.16em] shadow-lg hover:bg-[#f3eee4] transition-all rounded cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Save Activity'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
