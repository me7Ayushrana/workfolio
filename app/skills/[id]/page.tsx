'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  FileCode,
  Folder,
  GraduationCap,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  X,
  AlertTriangle,
  Target
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { SkillStatus, useWorkfolio } from '@/lib/workfolio-store'

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const {
    skills,
    activities,
    projects,
    goals,
    updateSkill,
    archiveSkill,
    restoreSkill,
    deleteSkill,
    addSkillLearningUpdate,
    updateActivityProject
  } = useWorkfolio()

  const skill = skills.find((s) => s.id === id) || skills[0]

  const [activeTab, setActiveTab] = useState<'Timeline' | 'Projects' | 'Evidence' | 'Capabilities' | 'Goals'>('Timeline')
  const [showLogModal, setShowLogModal] = useState(false)
  const [showApplyProjectModal, setShowApplyProjectModal] = useState(false)
  const [selectedApplyProjectId, setSelectedApplyProjectId] = useState('')

  // Currently Learning inline edit
  const [editingCurrentFocus, setEditingCurrentFocus] = useState(false)
  const [focusText, setFocusText] = useState(skill?.currentlyLearning || '')

  // Next step inline edit
  const [editingNextStep, setEditingNextStep] = useState(false)
  const [nextStepText, setNextStepText] = useState(skill?.nextStep || '')

  // Edit Skill Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [editLevel, setEditLevel] = useState<any>('Learning')
  const [editStatus, setEditStatus] = useState<SkillStatus>('LEARNING')

  // Delete Skill Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteOption, setDeleteOption] = useState<'archive' | 'keep_history' | 'delete_all'>('archive')
  const [confirmNameInput, setConfirmNameInput] = useState('')

  if (!skill) {
    return (
      <main className="min-h-screen bg-[#f3eee4] text-[#193b2c]">
        <WorkfolioHeader />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-serif text-5xl">Skill Not Found</h1>
          <Link
            href="/learning?tab=skills"
            className="mt-6 inline-block bg-[#193b2c] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] text-[#f3eee4]"
          >
            Back to Skills Workspace
          </Link>
        </div>
      </main>
    )
  }

  // Linked Activities
  const skillActivities = activities.filter((a) => a.skillId === skill.id)
  const skillEvidence = skillActivities.filter((a) => a.evidenceTitle)

  // Linked Projects
  const appliedProjects = projects.filter((p) =>
    skillActivities.some((a) => a.projectId === p.id) || skill.relatedProjectId === p.id
  )

  // Linked Goals
  const skillGoals = goals.filter((g) => g.skillId === skill.id)

  const handleSaveFocus = () => {
    updateSkill(skill.id, { currentlyLearning: focusText })
    setEditingCurrentFocus(false)
  }

  const handleSaveNextStep = () => {
    updateSkill(skill.id, { nextStep: nextStepText })
    setEditingNextStep(false)
  }

  const handleOpenEditModal = () => {
    setEditName(skill.name)
    setEditCategory(skill.category)
    setEditGoal(skill.learningGoal)
    setEditLevel(skill.currentLevel)
    setEditStatus(skill.status)
    setShowEditModal(true)
  }

  const handleSaveEditSkill = (e: React.FormEvent) => {
    e.preventDefault()
    updateSkill(skill.id, {
      name: editName.trim(),
      category: editCategory,
      learningGoal: editGoal.trim(),
      currentLevel: editLevel,
      status: editStatus
    })
    setShowEditModal(false)
  }

  const handleApplyToProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApplyProjectId) return
    updateSkill(skill.id, { relatedProjectId: selectedApplyProjectId })
    setShowApplyProjectModal(false)
  }

  const handleConfirmDeleteSkill = () => {
    if (deleteOption === 'archive') {
      archiveSkill(skill.id)
      setShowDeleteModal(false)
      router.push('/learning?tab=skills')
    } else if (deleteOption === 'keep_history') {
      deleteSkill(skill.id, 'keep_history')
      setShowDeleteModal(false)
      router.push('/learning?tab=skills')
    } else if (deleteOption === 'delete_all') {
      if (confirmNameInput.trim().toLowerCase() !== skill.name.trim().toLowerCase()) {
        alert(`Please type "${skill.name}" to confirm permanent deletion.`)
        return
      }
      deleteSkill(skill.id, 'delete_all')
      setShowDeleteModal(false)
      router.push('/learning?tab=skills')
    }
  }

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#193b2c]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 space-y-8">
        {/* BREADCRUMBS & TOP ACTIONS */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#193b2c]/10 pb-4 gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#193b2c]/60">
            <Link href="/learning" className="hover:text-[#193b2c]">
              Learning
            </Link>
            <span>/</span>
            <Link href="/learning?tab=skills" className="hover:text-[#193b2c]">
              Skills
            </Link>
            <span>/</span>
            <span className="text-[#26513d] font-bold">{skill.name}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowApplyProjectModal(true)}
              className="flex items-center gap-1.5 border border-[#26513d]/30 bg-[#26513d]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#26513d] hover:bg-[#26513d] hover:text-[#f3eee4] transition-colors"
            >
              <Folder size={12} /> Apply to Project
            </button>
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 border border-[#193b2c]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-[#e5dac9] transition-colors"
            >
              <Edit size={12} /> Edit Skill
            </button>
            {skill.status === 'ARCHIVED' ? (
              <button
                onClick={() => restoreSkill(skill.id)}
                className="flex items-center gap-1.5 border border-[#26513d] bg-[#26513d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#f3eee4]"
              >
                Restore Skill
              </button>
            ) : (
              <button
                onClick={() => archiveSkill(skill.id)}
                className="flex items-center gap-1.5 border border-[#193b2c]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-[#e5dac9] transition-colors"
              >
                Archive
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 border border-[#7c2634]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#7c2634] hover:bg-[#7c2634] hover:text-[#f3eee4] transition-colors"
            >
              <Trash2 size={12} /> Delete Skill
            </button>
          </div>
        </div>

        {/* SKILL HEADER */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#26513d]">
              <GraduationCap size={14} />
              <span>SKILL LEARNING PROFILE</span>
              <span>·</span>
              <span className="bg-[#26513d] text-[#f3eee4] px-2 py-0.5">{skill.status}</span>
              <span className="border border-[#193b2c]/20 px-2 py-0.5 text-[#193b2c]">{skill.currentLevel}</span>
            </div>
            <h1 className="mt-3 font-serif text-5xl font-light leading-none md:text-7xl">
              {skill.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#193b2c]/75">
              {skill.learningGoal}
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex shrink-0 items-center gap-2 bg-[#26513d] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4] hover:bg-[#193b2c] shadow-md transition-all"
          >
            <Plus size={14} /> + ADD LEARNING UPDATE
          </button>
        </div>

        {/* PROMINENT CURRENTLY LEARNING & NEXT STEP BOXES */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Currently Learning Focus Box */}
          <div className="border-l-4 border-[#26513d] bg-[#26513d]/10 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#26513d]">
                CURRENTLY LEARNING
              </span>
              <button
                onClick={() => setEditingCurrentFocus(!editingCurrentFocus)}
                className="text-[9px] font-bold uppercase text-[#26513d] hover:underline"
              >
                {editingCurrentFocus ? 'Cancel' : 'Edit Focus'}
              </button>
            </div>

            {editingCurrentFocus ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={focusText}
                  onChange={(e) => setFocusText(e.target.value)}
                  className="w-full border border-[#26513d]/40 bg-[#f3eee4] px-3 py-1.5 text-xs outline-none"
                />
                <button
                  onClick={handleSaveFocus}
                  className="bg-[#26513d] px-3 py-1 text-[10px] font-bold uppercase text-[#f3eee4]"
                >
                  Save Focus
                </button>
              </div>
            ) : (
              <p className="font-serif text-2xl font-light text-[#193b2c]">
                "{skill.currentlyLearning || 'Defining current focus topic...'}"
              </p>
            )}
          </div>

          {/* Next Learning Step Box */}
          <div className="border-l-4 border-[#9b7b3b] bg-[#9b7b3b]/10 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7b3b]">
                NEXT LEARNING STEP
              </span>
              <button
                onClick={() => setEditingNextStep(!editingNextStep)}
                className="text-[9px] font-bold uppercase text-[#9b7b3b] hover:underline"
              >
                {editingNextStep ? 'Cancel' : 'Edit Step'}
              </button>
            </div>

            {editingNextStep ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={nextStepText}
                  onChange={(e) => setNextStepText(e.target.value)}
                  className="w-full border border-[#9b7b3b]/40 bg-[#f3eee4] px-3 py-1.5 text-xs outline-none"
                />
                <button
                  onClick={handleSaveNextStep}
                  className="bg-[#9b7b3b] px-3 py-1 text-[10px] font-bold uppercase text-[#f3eee4]"
                >
                  Save Step
                </button>
              </div>
            ) : (
              <p className="font-serif text-2xl font-light text-[#193b2c]">
                {skill.nextStep || 'Plan next practical learning step...'}
              </p>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.18em] border-b border-[#193b2c]/15 pb-3">
          {(['Timeline', 'Projects', 'Evidence', 'Capabilities', 'Goals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 transition-all ${
                activeTab === tab
                  ? 'bg-[#26513d] text-[#f3eee4]'
                  : 'bg-[#e5dac9]/60 text-[#193b2c]/70 hover:text-[#193b2c]'
              }`}
            >
              {tab} {tab === 'Timeline' ? `(${skillActivities.length})` : tab === 'Projects' ? `(${appliedProjects.length})` : ''}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'Timeline' ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl font-light">Learning Timeline ({skillActivities.length} Sessions)</h2>
              <button
                onClick={() => setShowLogModal(true)}
                className="text-[10px] font-bold uppercase tracking-[.16em] text-[#26513d]"
              >
                + Add Update
              </button>
            </div>

            <div className="space-y-6 border-l-2 border-[#26513d]/30 pl-6">
              {skillActivities.length ? (
                skillActivities.map((act) => (
                  <div key={act.id} className="relative space-y-2">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-[#26513d] border-2 border-[#f3eee4]" />
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em]">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#26513d] text-[#f3eee4] px-2 py-0.5">{act.type}</span>
                        {act.projectTitle && (
                          <span className="text-[#9b7b3b] font-bold">Project: {act.projectTitle}</span>
                        )}
                      </div>
                      <span className="text-[#193b2c]/50">{act.date} · {act.time}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light">{act.work}</h3>
                    {act.learning && (
                      <p className="text-xs text-[#26513d]">Key Learning: {act.learning}</p>
                    )}
                    {act.struggle && (
                      <p className="text-xs text-[#7c2634]">Struggle / Blocker: {act.struggle}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-[#e5dac9]/40 p-8 text-center space-y-3 border border-[#193b2c]/10">
                  <BookOpen className="mx-auto text-[#193b2c]/40" size={32} />
                  <h3 className="font-serif text-2xl font-light">NO LEARNING UPDATES YET</h3>
                  <p className="text-xs text-[#193b2c]/60 max-w-sm mx-auto">
                    Start recording what you learn and practice for {skill.name}.
                  </p>
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="bg-[#26513d] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                  >
                    + ADD LEARNING UPDATE
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'Projects' ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b border-[#193b2c]/15 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
                  REAL WORLD APPLICATION
                </span>
                <h2 className="font-serif text-3xl font-light">Projects Where I Applied This Skill</h2>
              </div>
              <button
                onClick={() => setShowApplyProjectModal(true)}
                className="text-[10px] font-bold uppercase tracking-[.16em] text-[#26513d]"
              >
                + Apply to Another Project
              </button>
            </div>

            {appliedProjects.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appliedProjects.map((proj) => (
                  <div key={proj.id} className="border border-[#193b2c]/15 bg-[#e5dac9] p-5 space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em]">
                      <span className="bg-[#193b2c] text-[#f3eee4] px-2 py-0.5">{proj.status}</span>
                      <span className="text-[#9b7b3b]">{proj.category}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light">{proj.name}</h3>
                    <p className="text-xs text-[#193b2c]/75 line-clamp-2">{proj.description}</p>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex items-center justify-between w-full border border-[#193b2c]/20 bg-[#f3eee4] px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors"
                    >
                      <span>Open Project Workspace</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#193b2c]/60 py-6">No projects currently linked to this skill.</p>
            )}
          </div>
        ) : activeTab === 'Evidence' ? (
          <div className="space-y-6 pt-2">
            <h2 className="font-serif text-3xl font-light">Evidence Related to This Skill ({skillEvidence.length})</h2>
            {skillEvidence.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {skillEvidence.map((a) => (
                  <div key={a.id} className="border border-[#193b2c]/15 bg-[#e5dac9]/60 p-4 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#9b7b3b]">{a.date}</span>
                    <h3 className="font-serif text-xl font-light">{a.evidenceTitle}</h3>
                    {a.evidenceUrl && (
                      <a
                        href={a.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#26513d] hover:underline"
                      >
                        <span>View Artifact</span> <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#193b2c]/60 py-6">No direct evidence items attached yet.</p>
            )}
          </div>
        ) : (
          <div className="py-6 text-xs text-[#193b2c]/70">
            <p>Skill details and related capability mappings active for {skill.name}.</p>
          </div>
        )}
      </div>

      {/* EDIT SKILL MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193b2c]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#193b2c] shadow-2xl border border-[#193b2c]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#193b2c]/15 pb-3 mb-4">
              <h2 className="font-serif text-3xl font-light">Edit Skill</h2>
              <button onClick={() => setShowEditModal(false)} className="text-[#193b2c]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditSkill} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                  Learning Goal
                </label>
                <textarea
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  rows={3}
                  className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                    Learning Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SkillStatus)}
                    className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="LEARNING">LEARNING</option>
                    <option value="PRACTICING">PRACTICING</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="STRONG">STRONG</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#193b2c]/15">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#193b2c]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#26513d] px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4]"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY TO PROJECT MODAL */}
      {showApplyProjectModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193b2c]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#f3eee4] p-6 text-[#193b2c] shadow-2xl border border-[#193b2c]/20">
            <div className="flex justify-between items-center border-b border-[#193b2c]/15 pb-3 mb-4">
              <h2 className="font-serif text-2xl font-light">Apply Skill to Project</h2>
              <button onClick={() => setShowApplyProjectModal(false)} className="text-[#193b2c]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyToProject} className="space-y-4">
              <p className="text-xs text-[#193b2c]/75">
                Select a project where you are applying your learning in <strong>{skill.name}</strong>:
              </p>

              <select
                value={selectedApplyProjectId}
                onChange={(e) => setSelectedApplyProjectId(e.target.value)}
                className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                required
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyProjectModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#193b2c]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#26513d] px-5 py-2 text-xs font-bold uppercase text-[#f3eee4]"
                >
                  Connect Skill & Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SKILL CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193b2c]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#193b2c] shadow-2xl border border-[#7c2634]/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3 border-b border-[#193b2c]/15 pb-4">
              <AlertTriangle className="text-[#7c2634] shrink-0 mt-1" size={24} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#7c2634]">
                  CONFIRM ACTION
                </span>
                <h2 className="font-serif text-3xl font-light">Delete Skill?</h2>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-[#193b2c]/80">
                You're about to remove <strong className="font-bold text-[#193b2c]">{skill.name}</strong>.
              </p>

              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 p-3 border border-[#26513d]/40 bg-[#26513d]/10 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteSkillOption"
                    checked={deleteOption === 'archive'}
                    onChange={() => setDeleteOption('archive')}
                    className="mt-0.5 accent-[#26513d]"
                  />
                  <div>
                    <span className="font-bold text-[#26513d]">Archive skill instead (Recommended)</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Keep all learning history and project links intact. Skill moves to Archived status.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-[#193b2c]/20 bg-[#f3eee4] cursor-pointer">
                  <input
                    type="radio"
                    name="deleteSkillOption"
                    checked={deleteOption === 'keep_history'}
                    onChange={() => setDeleteOption('keep_history')}
                    className="mt-0.5 accent-[#193b2c]"
                  />
                  <div>
                    <span className="font-bold">Keep learning history (Remove skill association)</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Delete skill profile but preserve logged work & learning entries in Work Journal.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-[#7c2634]/30 bg-[#7c2634]/5 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteSkillOption"
                    checked={deleteOption === 'delete_all'}
                    onChange={() => setDeleteOption('delete_all')}
                    className="mt-0.5 accent-[#7c2634]"
                  />
                  <div>
                    <span className="font-bold text-[#7c2634]">Delete skill and associated learning records</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Irreversibly delete skill and all learning update activities.
                    </p>
                  </div>
                </label>
              </div>

              {deleteOption === 'delete_all' && (
                <div className="p-3 border border-[#7c2634] bg-[#7c2634]/10 space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-[#7c2634]">
                    Type "{skill.name}" to confirm permanent deletion:
                  </label>
                  <input
                    type="text"
                    value={confirmNameInput}
                    onChange={(e) => setConfirmNameInput(e.target.value)}
                    placeholder={skill.name}
                    className="w-full border border-[#7c2634]/40 bg-[#f3eee4] px-3 py-1.5 text-xs outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#193b2c]/15 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#193b2c]/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSkill}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4] shadow-md ${
                  deleteOption === 'delete_all' ? 'bg-[#7c2634]' : 'bg-[#26513d]'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <QuickCaptureModal
          defaultSkillId={skill.id}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </main>
  )
}
