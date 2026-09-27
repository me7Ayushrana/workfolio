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
  Mic,
  MicOff,
  AlertCircle,
  RefreshCw,
  Save,
  RotateCcw
} from 'lucide-react'
import { ActivityLogEntry, ActivityType, useWorkfolio } from '@/lib/workfolio-store'

interface QuickCaptureModalProps {
  onClose: () => void
  onSuccess?: () => void
  defaultProjectId?: string
  defaultSkillId?: string
  activityToEdit?: ActivityLogEntry
  initialMode?: 'direct' | 'ai' | 'voice'
}

export function QuickCaptureModal({
  onClose,
  onSuccess,
  defaultProjectId,
  defaultSkillId,
  activityToEdit,
  initialMode = 'direct'
}: QuickCaptureModalProps) {
  const {
    projects,
    skills,
    logActivityEntry,
    updateActivityEntry,
    createProject
  } = useWorkfolio()

  const isEditing = !!activityToEdit

  // Mode Selection: 'direct' | 'ai' | 'voice'
  const [entryMode, setEntryMode] = useState<'direct' | 'ai' | 'voice'>(initialMode)

  // AI & Voice State
  const [naturalInput, setNaturalInput] = useState('')
  const [isParsingAI, setIsParsingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'LOADING' | 'REVIEW' | 'NOT_CONFIGURED' | 'ERROR'>('IDLE')

  // Voice recording
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [recognition, setRecognition] = useState<any>(null)

  // AI Draft Review state
  const [aiDraft, setAiDraft] = useState<{
    type: ActivityType
    work: string
    learning?: string
    struggle?: string
    nextStep?: string
    projectId?: string | null
    projectTitle?: string | null
    suggestedSkills?: string[]
    suggestedTags?: string[]
  } | null>(null)

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
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setVoiceSupported(false)
      }
    }
  }, [])

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

  // Voice recording toggle
  const toggleVoiceRecording = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return
    }

    if (isRecording) {
      if (recognition) recognition.stop()
      setIsRecording(false)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event: any) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setNaturalInput(currentTranscript)
      }

      rec.onerror = (err: any) => {
        console.warn('Voice error', err)
        setIsRecording(false)
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      rec.start()
      setRecognition(rec)
      setIsRecording(true)
    } catch (err: any) {
      setVoiceSupported(false)
    }
  }

  const handleAIParse = async () => {
    if (!naturalInput.trim() || isParsingAI) return
    setIsParsingAI(true)
    setAiError(null)
    setAiStatus('LOADING')

    try {
      const res = await fetch('/api/ai/activity/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: naturalInput,
          projects: projects.map((p) => ({ id: p.id, name: p.name })),
          skills: skills.map((s) => ({ id: s.id, name: s.name }))
        })
      })

      const data = await res.json()

      if (!data.success) {
        if (data.status === 'unconfigured') {
          setAiStatus('NOT_CONFIGURED')
          setAiError('AI is not configured yet. Please set GEMINI_API_KEY on your server.')
        } else {
          setAiStatus('ERROR')
          setAiError(data.message || 'Failed to parse natural language activity.')
        }
        return
      }

      const draft = data.draft
      setAiDraft({
        type: draft.type || 'BUILD',
        work: draft.work || naturalInput,
        learning: draft.learning,
        struggle: draft.struggle,
        nextStep: draft.nextStep,
        projectTitle: draft.projectTitle || 'No matching project found',
        projectId: draft.projectId || null,
        suggestedSkills: draft.suggestedSkills,
        suggestedTags: draft.suggestedTags
      })
      setAiStatus('REVIEW')
    } catch (err: any) {
      setAiStatus('ERROR')
      setAiError(err.message || 'Failed to parse text with AI.')
    } finally {
      setIsParsingAI(false)
    }
  }

  const handleAcceptAIDraft = () => {
    if (!aiDraft) return
    logActivityEntry({
      work: aiDraft.work,
      learning: aiDraft.learning,
      struggle: aiDraft.struggle,
      intention: aiDraft.nextStep,
      projectId: aiDraft.projectId || undefined,
      type: aiDraft.type,
      capabilities: aiDraft.suggestedTags || []
    })

    setSavedAction('created')
    setIsSaved(true)
    setTimeout(() => {
      onSuccess?.()
      onClose()
    }, 600)
  }

  const handleEditAIDraft = () => {
    if (!aiDraft) return
    setWork(aiDraft.work)
    if (aiDraft.learning) setLearning(aiDraft.learning)
    if (aiDraft.struggle) setStruggle(aiDraft.struggle)
    if (aiDraft.nextStep) setIntention(aiDraft.nextStep)
    if (aiDraft.type) setActivityType(aiDraft.type)
    if (aiDraft.projectId) setSelectedProjectId(aiDraft.projectId)
    if (aiDraft.suggestedTags?.length) setCapabilitiesStr(aiDraft.suggestedTags.join(', '))
    
    setEntryMode('direct')
    setAiStatus('IDLE')
    setAiDraft(null)
    setShowReflections(!!aiDraft.learning || !!aiDraft.struggle || !!aiDraft.nextStep)
  }

  const handleRejectAIDraft = () => {
    setAiDraft(null)
    setAiStatus('IDLE')
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
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#090a10] px-8 py-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
              <Sparkles size={14} />
              <span>{isEditing ? 'UPDATE ACTIVITY ENTRY' : 'LOG DAILY ENGINEERING ACTIVITY'}</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-light text-[#f3eee4]">
              {isEditing ? 'Refine Work Record' : 'Record Verified Activity'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setEntryMode('direct')}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    entryMode === 'direct'
                      ? 'bg-[#c1a05b] text-[#08090f] shadow-sm'
                      : 'text-[#f3eee4]/70 hover:text-white'
                  }`}
                >
                  Form
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('ai')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    entryMode === 'ai'
                      ? 'bg-[#c1a05b] text-[#08090f] shadow-sm'
                      : 'text-[#f3eee4]/70 hover:text-white'
                  }`}
                >
                  <Sparkles size={12} /> AI Text
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('voice')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    entryMode === 'voice'
                      ? 'bg-[#c1a05b] text-[#08090f] shadow-sm'
                      : 'text-[#f3eee4]/70 hover:text-white'
                  }`}
                >
                  <Mic size={12} /> Voice
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#f3eee4]/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
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

            {/* AI REVIEW SCREEN (FEATURE 1 & 2 DRAFT REVIEW) */}
            {aiStatus === 'REVIEW' && aiDraft && (
              <div className="space-y-5 rounded-2xl border border-[#c1a05b]/40 bg-[#121420] p-6 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#c1a05b] px-2.5 py-0.5 text-[10px] font-bold text-[#08090f]">
                      AI DRAFT REVIEW
                    </span>
                    <span className="text-[10px] font-bold text-[#c1a05b] uppercase">
                      TYPE: {aiDraft.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#f3eee4]/50">Verify before saving to Workfolio</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Matched Project</label>
                    <p className="mt-0.5 font-semibold text-white">
                      {aiDraft.projectTitle || 'No matching project found'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Work Accomplished</label>
                    <p className="mt-0.5 text-sm text-[#f3eee4] leading-relaxed">{aiDraft.work}</p>
                  </div>

                  {aiDraft.learning && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Learning Concept</label>
                      <p className="mt-0.5 text-[#f3eee4]/80">{aiDraft.learning}</p>
                    </div>
                  )}

                  {aiDraft.struggle && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Challenge / Problem</label>
                      <p className="mt-0.5 text-amber-300/90">{aiDraft.struggle}</p>
                    </div>
                  )}

                  {aiDraft.nextStep && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Planned Next Step</label>
                      <p className="mt-0.5 text-[#f3eee4]/80">{aiDraft.nextStep}</p>
                    </div>
                  )}

                  {aiDraft.suggestedTags?.length ? (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Suggested Tags</label>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {aiDraft.suggestedTags.map((tag) => (
                          <span key={tag} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={handleRejectAIDraft}
                    className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-[#f3eee4]/70 hover:text-white"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleEditAIDraft}
                    className="flex items-center gap-1.5 rounded-xl border border-[#c1a05b]/40 bg-[#c1a05b]/10 px-4 py-2 text-xs font-semibold text-[#c1a05b] hover:bg-[#c1a05b]/20"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAIDraft}
                    className="flex items-center gap-1.5 rounded-xl bg-[#c1a05b] px-5 py-2 text-xs font-bold text-[#08090f] hover:bg-white transition-all shadow-md"
                  >
                    <Save size={13} /> Save Activity
                  </button>
                </div>
              </div>
            )}

            {/* AI TEXT LOG MODE */}
            {entryMode === 'ai' && !isEditing && aiStatus !== 'REVIEW' && (
              <div className="space-y-4 rounded-2xl border border-[#c1a05b]/30 bg-[#121420] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
                    <Sparkles size={15} />
                    <span>AI NATURAL LANGUAGE PARSER</span>
                  </div>
                  <span className="text-[11px] text-[#f3eee4]/50">Describe what you worked on</span>
                </div>

                <textarea
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="e.g. Spent 2 hours refactoring database queries and adding automated unit tests for API endpoints..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0d14] p-4 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#c1a05b] focus:ring-1 focus:ring-[#c1a05b] transition-all leading-relaxed"
                  autoFocus
                />

                {aiStatus === 'NOT_CONFIGURED' && (
                  <div className="rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-4 text-xs text-[#f3eee4]/80">
                    <p className="font-bold text-[#c1a05b] flex items-center gap-1.5"><AlertCircle size={15} /> AI is not configured yet.</p>
                    <p className="mt-1">{aiError}</p>
                  </div>
                )}

                {aiStatus === 'ERROR' && (
                  <div className="rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 p-3 text-xs text-[#ff6b6b]">
                    {aiError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#f3eee4]/40">
                    Matches existing projects and creates a review draft before saving.
                  </p>
                  <button
                    type="button"
                    onClick={handleAIParse}
                    disabled={isParsingAI || !naturalInput.trim()}
                    className="flex items-center gap-2 rounded-xl bg-[#c1a05b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#08090f] hover:bg-white transition-all disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    {isParsingAI ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    <span>{isParsingAI ? 'Structuring...' : 'Structure with AI'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* VOICE LOGGING MODE (FEATURE 2) */}
            {entryMode === 'voice' && !isEditing && aiStatus !== 'REVIEW' && (
              <div className="space-y-4 rounded-2xl border border-[#c1a05b]/30 bg-[#121420] p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c1a05b]">
                  <Mic size={16} />
                  <span>AI VOICE LOGGING</span>
                </div>

                {!voiceSupported && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                    <AlertCircle size={16} className="mx-auto mb-1 text-amber-400" />
                    Voice input is not supported in this browser. You can paste or type your activity instead.
                  </div>
                )}

                {voiceSupported && (
                  <div className="py-4 space-y-3">
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all cursor-pointer shadow-lg ${
                        isRecording
                          ? 'animate-pulse border-red-500 bg-red-500/20 text-red-400 scale-105'
                          : 'border-[#c1a05b] bg-[#c1a05b]/10 text-[#c1a05b] hover:scale-105 hover:bg-[#c1a05b]/20'
                      }`}
                    >
                      {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                    </button>
                    <p className="text-xs font-semibold text-[#f3eee4]">
                      {isRecording ? 'Listening... speak clearly about what you worked on' : 'Click to start recording voice input'}
                    </p>
                  </div>
                )}

                <div className="text-left space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">
                    Editable Voice Transcript
                  </label>
                  <textarea
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder="Transcript will appear here as you speak..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-[#0c0d14] p-4 text-xs text-[#f3eee4] placeholder:text-[#f3eee4]/30 outline-none focus:border-[#c1a05b]"
                  />
                </div>

                {aiStatus === 'NOT_CONFIGURED' && (
                  <div className="rounded-xl border border-[#c1a05b]/30 bg-[#c1a05b]/10 p-3 text-xs text-[#f3eee4]/80 text-left">
                    {aiError}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAIParse}
                    disabled={isParsingAI || !naturalInput.trim()}
                    className="flex items-center gap-2 rounded-xl bg-[#c1a05b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#08090f] hover:bg-white transition-all disabled:opacity-40"
                  >
                    {isParsingAI ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    <span>Structure Transcript with AI</span>
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

                {/* REFLECTIONS EXPANDER */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReflections(!showReflections)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#c1a05b] hover:underline"
                  >
                    <span>{showReflections ? '− Hide Learning & Struggles' : '+ Add Learning, Struggles & Next Intention'}</span>
                  </button>

                  {showReflections && (
                    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Concept Learned</label>
                        <input
                          type="text"
                          value={learning}
                          onChange={(e) => setLearning(e.target.value)}
                          placeholder="e.g. Adaptive thresholding"
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c0d14] p-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Struggle / Blocker</label>
                        <input
                          type="text"
                          value={struggle}
                          onChange={(e) => setStruggle(e.target.value)}
                          placeholder="e.g. Low-light recognition"
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c0d14] p-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b]">Next Intention</label>
                        <input
                          type="text"
                          value={intention}
                          onChange={(e) => setIntention(e.target.value)}
                          placeholder="e.g. Test CLAHE"
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c0d14] p-2.5 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* FORM BUTTONS */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-white/20 px-5 py-2.5 text-xs font-semibold text-[#f3eee4]/70 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-[#c1a05b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#08090f] hover:bg-white transition-all shadow-md cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{isEditing ? 'Save Updates' : 'Log Activity'}</span>
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
