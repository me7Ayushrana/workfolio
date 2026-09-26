'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Edit,
  ExternalLink,
  FileCode,
  FileText,
  Folder,
  GraduationCap,
  Layers,
  Link as LinkIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { useWorkfolio } from '@/lib/workfolio-store'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const {
    projects,
    activities,
    skills,
    implementations,
    updateProject,
    updateProjectNotes,
    addProjectMilestone,
    toggleProjectMilestone,
    duplicateProject,
    archiveProject,
    restoreProject,
    deleteProject
  } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Timeline' | 'Skills' | 'Updates' | 'Evidence' | 'Capabilities' | 'Milestones' | 'Links'
  >('Overview')

  const [showLogModal, setShowLogModal] = useState(false)
  const [newMilestoneText, setNewMilestoneText] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  // Edit Project Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editStatus, setEditStatus] = useState<any>('In progress')
  const [editRepo, setEditRepo] = useState('')
  const [editLive, setEditLive] = useState('')
  const [editDoc, setEditDoc] = useState('')

  // Delete Project Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteOption, setDeleteOption] = useState<'archive' | 'keep_associated' | 'delete_all'>('archive')
  const [confirmNameInput, setConfirmNameInput] = useState('')
  const [showPermanentInput, setShowPermanentInput] = useState(false)

  const project = projects.find((p) => p.id === id || p.id.split('-').slice(0, -1).join('-') === id) || projects[0]

  const projectActivities = activities.filter((a) => a.projectId === project?.id)
  const projectImplementations = implementations.filter((imp) => imp.projectId === project?.id)
  const projectEvidence = projectActivities.filter((a) => a.evidenceTitle)

  // Associated Skills
  const projectSkills = skills.filter((s) =>
    projectActivities.some((a) => a.skillId === s.id) || s.relatedProjectId === project?.id
  )

  const [notesText, setNotesText] = useState(project?.notes || '')

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f3eee4] text-[#193b2c]">
        <WorkfolioHeader />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-serif text-5xl">Project Not Found</h1>
          <Link
            href="/projects"
            className="mt-6 inline-block bg-[#193b2c] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] text-[#f3eee4]"
          >
            Back to Projects Workspace
          </Link>
        </div>
      </main>
    )
  }

  const handleOpenEditModal = () => {
    setEditName(project.name)
    setEditDesc(project.description)
    setEditCategory(project.category)
    setEditStatus(project.status)
    setEditRepo(project.repositoryUrl || '')
    setEditLive(project.liveUrl || '')
    setEditDoc(project.documentationUrl || '')
    setShowEditModal(true)
  }

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault()
    updateProject(project.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      category: editCategory,
      status: editStatus,
      repositoryUrl: editRepo.trim() || undefined,
      liveUrl: editLive.trim() || undefined,
      documentationUrl: editDoc.trim() || undefined
    })
    setShowEditModal(false)
  }

  const handleSaveNotes = () => {
    updateProjectNotes(project.id, notesText)
    setEditingNotes(false)
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestoneText.trim()) return
    addProjectMilestone(project.id, newMilestoneText.trim())
    setNewMilestoneText('')
  }

  const handleDuplicate = () => {
    const dupe = duplicateProject(project.id)
    router.push(`/projects/${dupe.id}`)
  }

  const handleArchive = () => {
    archiveProject(project.id)
    router.push('/projects')
  }

  const handleConfirmDeleteAction = () => {
    if (deleteOption === 'archive') {
      archiveProject(project.id)
      setShowDeleteModal(false)
      router.push('/projects')
    } else if (deleteOption === 'keep_associated') {
      deleteProject(project.id, 'keep_associated')
      setShowDeleteModal(false)
      router.push('/projects')
    } else if (deleteOption === 'delete_all') {
      if (confirmNameInput.trim().toLowerCase() !== project.name.trim().toLowerCase()) {
        alert(`Please type "${project.name}" to confirm permanent deletion.`)
        return
      }
      deleteProject(project.id, 'delete_all')
      setShowDeleteModal(false)
      router.push('/projects')
    }
  }

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#193b2c]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 space-y-8">
        {/* BREADCRUMB & TOP ACTIONS */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#193b2c]/10 pb-4 gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#193b2c]/60">
            <Link href="/projects" className="hover:text-[#193b2c]">
              Projects
            </Link>
            <span>/</span>
            <span className="text-[#9b7b3b]">{project.name}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 border border-[#193b2c]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-[#e5dac9] transition-colors"
            >
              <Edit size={12} /> Edit Project
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 border border-[#193b2c]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-[#e5dac9] transition-colors"
            >
              <Copy size={12} /> Duplicate
            </button>
            {project.status === 'Archived' ? (
              <button
                onClick={() => restoreProject(project.id)}
                className="flex items-center gap-1.5 border border-[#26513d]/40 bg-[#26513d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#f3eee4]"
              >
                Restore Project
              </button>
            ) : (
              <button
                onClick={handleArchive}
                className="flex items-center gap-1.5 border border-[#193b2c]/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-[#e5dac9] transition-colors"
              >
                Archive
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 border border-[#7c2634]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#7c2634] hover:bg-[#7c2634] hover:text-[#f3eee4] transition-colors"
            >
              <Trash2 size={12} /> Delete Project
            </button>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
              <span>PROJECT WORKSPACE</span>
              <span>·</span>
              <span className="bg-[#193b2c] text-[#f3eee4] px-2 py-0.5">{project.status}</span>
            </div>
            <h1 className="mt-3 font-serif text-5xl font-light leading-none md:text-7xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#193b2c]/75">
              {project.description}
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex shrink-0 items-center gap-2 bg-[#193b2c] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4] hover:bg-[#9b7b3b] shadow-md transition-all"
          >
            <Plus size={14} /> + ADD PROJECT UPDATE
          </button>
        </div>

        {/* EXTERNAL LINKS ROW */}
        <div className="border border-[#193b2c]/15 bg-[#e5dac9] p-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b] mb-3">
            <span className="flex items-center gap-1.5"><LinkIcon size={13} /> EXTERNAL PROJECT LINKS</span>
            <span>Verified Source Endpoints</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-[10px] font-bold uppercase tracking-[.14em]">
            <a
              href={project.liveUrl || 'https://expense-demo.workfolio.app'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#193b2c]/20 bg-[#f3eee4] p-3 text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors"
            >
              <span>LIVE DEMO ↗</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={project.repositoryUrl || 'https://github.com/workfolio/project'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#193b2c]/20 bg-[#f3eee4] p-3 text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors"
            >
              <span>REPOSITORY ↗</span>
              <FileCode size={12} />
            </a>

            <a
              href={project.documentationUrl || 'https://docs.workfolio.app'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#193b2c]/20 bg-[#f3eee4] p-3 text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors"
            >
              <span>DOCUMENTATION ↗</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={project.figmaUrl || 'https://figma.com'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-[#193b2c]/20 bg-[#f3eee4] p-3 text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors"
            >
              <span>FIGMA SPECS ↗</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* LOCAL PROJECT NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[.18em] border-b border-[#193b2c]/15 pb-3">
          {(['Overview', 'Timeline', 'Skills', 'Updates', 'Evidence', 'Capabilities', 'Milestones', 'Links'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 transition-all ${
                  activeTab === tab
                    ? 'bg-[#193b2c] text-[#f3eee4]'
                    : 'bg-[#e5dac9]/60 text-[#193b2c]/70 hover:text-[#193b2c]'
                }`}
              >
                {tab} {tab === 'Skills' ? `(${projectSkills.length})` : tab === 'Timeline' ? `(${projectActivities.length})` : ''}
              </button>
            )
          )}
        </div>

        {/* NEXT ACTION BOX */}
        <div className="border-l-4 border-[#9b7b3b] bg-[#e5dac9]/50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
              CURRENT NEXT ACTION
            </span>
            <p className="font-serif text-lg font-light text-[#193b2c] mt-0.5">
              Implement adaptive receipt image preprocessing and fallback verification.
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="shrink-0 bg-[#193b2c] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b] transition-colors"
          >
            Log Progress
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'Skills' ? (
          /* SKILLS USED & LEARNING CONTEXT SECTION */
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b border-[#193b2c]/15 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#26513d]">
                  SKILLS & KNOWLEDGE CONTEXT
                </span>
                <h2 className="font-serif text-3xl font-light">Skills Used in {project.name}</h2>
              </div>
              <Link
                href="/learning?tab=skills"
                className="text-[10px] font-bold uppercase tracking-[.16em] text-[#193b2c] hover:text-[#9b7b3b]"
              >
                View All Skills →
              </Link>
            </div>

            {projectSkills.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectSkills.map((sk) => (
                  <div
                    key={sk.id}
                    className="border border-[#193b2c]/15 bg-[#e5dac9]/60 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em]">
                        <span className="bg-[#26513d] text-[#f3eee4] px-2 py-0.5">{sk.status}</span>
                        <span className="text-[#9b7b3b]">{sk.category}</span>
                      </div>
                      <h3 className="mt-2 font-serif text-2xl font-light">{sk.name}</h3>
                      <p className="mt-1 text-xs text-[#193b2c]/70 line-clamp-2">{sk.learningGoal}</p>
                      {sk.currentlyLearning && (
                        <p className="mt-2 text-[11px] font-medium text-[#26513d] bg-[#26513d]/10 p-2">
                          Focus: {sk.currentlyLearning}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/skills/${sk.id}`}
                      className="inline-flex items-center justify-between w-full border border-[#193b2c]/20 bg-[#f3eee4] px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#193b2c] hover:bg-[#193b2c] hover:text-[#f3eee4] transition-colors mt-2"
                    >
                      <span>Open Skill Profile</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#e5dac9]/40 border border-[#193b2c]/10 p-8 text-center space-y-3">
                <GraduationCap className="mx-auto text-[#193b2c]/40" size={36} />
                <h3 className="font-serif text-2xl font-light">No Skills Associated Yet</h3>
                <p className="text-xs text-[#193b2c]/60 max-w-md mx-auto">
                  Log an activity for this project and select a Skill to automatically connect your learning journey to this project.
                </p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="bg-[#193b2c] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                >
                  + Log Activity with Skill
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Timeline' || activeTab === 'Updates' ? (
          /* CHRONOLOGICAL PROJECT TIMELINE */
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl font-light">Project Timeline ({projectActivities.length} Entries)</h2>
              <button
                onClick={() => setShowLogModal(true)}
                className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b7b3b]"
              >
                + Add Update
              </button>
            </div>

            <div className="space-y-6 border-l-2 border-[#193b2c]/15 pl-6">
              {projectActivities.length ? (
                projectActivities.map((act) => (
                  <div key={act.id} className="relative space-y-2">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-[#9b7b3b] border-2 border-[#f3eee4]" />
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em]">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#193b2c] text-[#f3eee4] px-2 py-0.5">{act.type}</span>
                        {act.skillName && (
                          <span className="text-[#26513d] bg-[#26513d]/10 px-2 py-0.5">Skill: {act.skillName}</span>
                        )}
                      </div>
                      <span className="text-[#193b2c]/50">{act.date} · {act.time}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light">{act.work}</h3>
                    {act.learning && (
                      <p className="text-xs text-[#26513d]">Learned: {act.learning}</p>
                    )}
                    {act.struggle && (
                      <p className="text-xs text-[#7c2634]">Struggle: {act.struggle}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#193b2c]/60">No project timeline updates logged yet.</p>
              )}
            </div>
          </div>
        ) : (
          /* DEFAULT OVERVIEW TAB */
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Left Column: Notes & Implemented Extensions */}
            <div className="lg:col-span-8 space-y-10">
              {/* Private Project Notes */}
              <div>
                <div className="flex items-center justify-between border-b border-[#193b2c]/15 pb-2">
                  <h2 className="font-serif text-3xl font-light">Project Overview & Notes</h2>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b7b3b]"
                  >
                    {editingNotes ? 'Close' : 'Edit Notes'}
                  </button>
                </div>

                {editingNotes ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={4}
                      className="w-full border border-[#193b2c]/20 bg-transparent p-3 text-xs outline-none focus:border-[#9b7b3b]"
                      placeholder="Private technical notes, decisions, and constraints..."
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="bg-[#193b2c] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4]"
                    >
                      Save Notes
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-[#193b2c]/80 bg-[#e5dac9]/60 p-4 border border-[#193b2c]/10">
                    {project.notes ||
                      'This project turns a messy workflow into an understandable, useful system. The record keeps the implementation connected to its evidence instead of treating a project as a static thumbnail.'}
                  </p>
                )}
              </div>

              {/* WHAT I'M LEARNING WHILE BUILDING THIS */}
              {projectSkills.length > 0 && (
                <div className="border border-[#26513d]/30 bg-[#26513d]/10 p-5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#26513d]">
                    WHAT I'M LEARNING WHILE BUILDING THIS
                  </span>
                  <div className="space-y-2">
                    {projectSkills.map((sk) => (
                      <div key={sk.id} className="flex items-center justify-between text-xs">
                        <Link href={`/skills/${sk.id}`} className="font-serif text-lg font-light hover:underline">
                          {sk.name}
                        </Link>
                        <span className="text-[10px] text-[#26513d] font-bold">→ {sk.currentlyLearning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implemented Resources */}
              <div>
                <div className="flex items-center justify-between border-b border-[#193b2c]/15 pb-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                      EXPLORE EXTENSIONS
                    </span>
                    <h3 className="font-serif text-2xl font-light">Implemented Resources</h3>
                  </div>
                  <Link
                    href="/explore"
                    className="text-[10px] font-bold uppercase tracking-[.16em] text-[#193b2c] hover:text-[#9b7b3b]"
                  >
                    + Add from Explore
                  </Link>
                </div>

                {projectImplementations.length ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {projectImplementations.map((imp) => (
                      <div
                        key={imp.id}
                        className="border border-[#193b2c]/15 bg-[#e5dac9] p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em] text-[#9b7b3b]">
                          <span>{imp.status}</span>
                          <span>v{imp.resourceVersion}</span>
                        </div>
                        <h4 className="font-serif text-xl font-light">{imp.resourceTitle}</h4>
                        <span className="text-[9px] text-[#193b2c]/50 block">Implemented {imp.implementedAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-[#193b2c]/60">No Explore resources implemented into this project yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Milestones */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="border border-[#193b2c]/15 bg-[#e5dac9] p-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                  Project Milestones
                </span>

                <div className="space-y-2">
                  {(project.milestones || []).map((m, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 text-xs cursor-pointer border-b border-[#193b2c]/10 pb-2"
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => toggleProjectMilestone(project.id, idx)}
                        className="accent-[#193b2c]"
                      />
                      <span className={m.completed ? 'line-through opacity-50' : 'font-medium'}>
                        {m.title}
                      </span>
                    </label>
                  ))}
                </div>

                <form onSubmit={handleAddMilestone} className="flex gap-2 pt-2">
                  <input
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    placeholder="Add milestone..."
                    className="flex-1 border border-[#193b2c]/20 bg-transparent px-2.5 py-1.5 text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#193b2c] px-3 py-1.5 text-[10px] font-bold uppercase text-[#f3eee4]"
                  >
                    Add
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* EDIT PROJECT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193b2c]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#193b2c] shadow-2xl border border-[#193b2c]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#193b2c]/15 pb-3 mb-4">
              <h2 className="font-serif text-3xl font-light">Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="text-[#193b2c]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                  Project Name
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
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Paused">Paused</option>
                    <option value="Planning">Planning</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                  Repository URL
                </label>
                <input
                  type="text"
                  value={editRepo}
                  onChange={(e) => setEditRepo(e.target.value)}
                  className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-1.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#193b2c]/70 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="text"
                  value={editLive}
                  onChange={(e) => setEditLive(e.target.value)}
                  className="w-full border border-[#193b2c]/20 bg-transparent px-3 py-1.5 text-xs outline-none"
                />
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
                  className="bg-[#193b2c] px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#193b2c]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#193b2c] shadow-2xl border border-[#7c2634]/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3 border-b border-[#193b2c]/15 pb-4">
              <AlertTriangle className="text-[#7c2634] shrink-0 mt-1" size={24} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#7c2634]">
                  CONFIRM ACTION
                </span>
                <h2 className="font-serif text-3xl font-light">Delete Project?</h2>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-[#193b2c]/80">
                You're about to delete <strong className="font-bold text-[#193b2c]">{project.name}</strong>.
              </p>

              {/* Summary of affected records */}
              <div className="bg-[#e5dac9]/60 border border-[#193b2c]/15 p-4 space-y-1 text-xs">
                <div className="font-bold text-[10px] uppercase tracking-wider text-[#9b7b3b] mb-1">
                  PROJECT CONTAINS:
                </div>
                <div className="flex justify-between">
                  <span>Activities Logged:</span>
                  <span className="font-bold">{projectActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Evidence Items:</span>
                  <span className="font-bold">{projectEvidence.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Milestones:</span>
                  <span className="font-bold">{project.milestones?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Associated:</span>
                  <span className="font-bold">{projectSkills.length}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="font-bold text-[10px] uppercase tracking-wider text-[#193b2c]">
                  WHAT SHOULD HAPPEN TO ASSOCIATED RECORDS?
                </div>

                <label className="flex items-start gap-3 p-3 border border-[#26513d]/40 bg-[#26513d]/10 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={deleteOption === 'archive'}
                    onChange={() => setDeleteOption('archive')}
                    className="mt-0.5 accent-[#26513d]"
                  />
                  <div>
                    <span className="font-bold text-[#26513d]">Archive project instead (Recommended)</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Keep all activities, evidence, and milestones intact. Project moves to Archived tab.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-[#193b2c]/20 bg-[#f3eee4] cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={deleteOption === 'keep_associated'}
                    onChange={() => setDeleteOption('keep_associated')}
                    className="mt-0.5 accent-[#193b2c]"
                  />
                  <div>
                    <span className="font-bold">Keep activities & evidence (Disassociate project)</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Delete project container but preserve historical work entries as independent logs.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-[#7c2634]/30 bg-[#7c2634]/5 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    checked={deleteOption === 'delete_all'}
                    onChange={() => setDeleteOption('delete_all')}
                    className="mt-0.5 accent-[#7c2634]"
                  />
                  <div>
                    <span className="font-bold text-[#7c2634]">Permanently delete project and records</span>
                    <p className="text-[11px] text-[#193b2c]/70 mt-0.5">
                      Irreversibly delete project and all associated activity records.
                    </p>
                  </div>
                </label>
              </div>

              {deleteOption === 'delete_all' && (
                <div className="p-3 border border-[#7c2634] bg-[#7c2634]/10 space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-[#7c2634]">
                    Type "{project.name}" to confirm permanent deletion:
                  </label>
                  <input
                    type="text"
                    value={confirmNameInput}
                    onChange={(e) => setConfirmNameInput(e.target.value)}
                    placeholder={project.name}
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
                onClick={handleConfirmDeleteAction}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider text-[#f3eee4] shadow-md ${
                  deleteOption === 'delete_all' ? 'bg-[#7c2634] hover:bg-black' : 'bg-[#193b2c]'
                }`}
              >
                {deleteOption === 'archive' ? 'Archive Project' : deleteOption === 'keep_associated' ? 'Delete Project (Keep Records)' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <QuickCaptureModal
          defaultProjectId={project.id}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </main>
  )
}
