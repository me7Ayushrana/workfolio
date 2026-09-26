'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Edit,
  Folder,
  GraduationCap,
  HelpCircle,
  Layers,
  Plus,
  Search,
  Sparkles,
  Target,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { SkillStatus, useWorkfolio } from '@/lib/workfolio-store'

function LearningContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'LEARNING' | 'SKILLS' | 'GOALS') || 'SKILLS'

  const {
    skills,
    learningTracks,
    goals,
    problems,
    activities,
    projects,
    toggleLearningStep,
    toggleGoal,
    resolveProblem,
    addGoal,
    createSkill
  } = useWorkfolio()

  const [activeTab, setActiveTab] = useState<'LEARNING' | 'SKILLS' | 'GOALS'>(initialTab)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'SKILLS' || tabParam === 'LEARNING' || tabParam === 'GOALS') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const [showLogModal, setShowLogModal] = useState(false)

  // Skill Filters & Search
  const [skillSearch, setSkillSearch] = useState('')
  const [skillStatusFilter, setSkillStatusFilter] = useState<string>('ALL')
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('ALL')

  // Create Skill Modal State
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('AI / Data')
  const [newSkillGoal, setNewSkillGoal] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<any>('Learning')
  const [newSkillStatus, setNewSkillStatus] = useState<SkillStatus>('LEARNING')
  const [newSkillFocus, setNewSkillFocus] = useState('')
  const [newSkillNextStep, setNewSkillNextStep] = useState('')

  // Create Goal Modal State
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalType, setGoalType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Learning' | 'Project'>('Weekly')
  const [goalDeadline, setGoalDeadline] = useState('2026-10-01')

  // Filtered Skills
  const filteredSkills = useMemo(() => {
    let result = [...skills]
    if (skillStatusFilter !== 'ALL') {
      result = result.filter((s) => s.status === skillStatusFilter)
    }
    if (skillCategoryFilter !== 'ALL') {
      result = result.filter((s) => s.category === skillCategoryFilter)
    }
    if (skillSearch.trim()) {
      const q = skillSearch.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.learningGoal.toLowerCase().includes(q) ||
          s.currentlyLearning.toLowerCase().includes(q)
      )
    }
    return result
  }, [skills, skillStatusFilter, skillCategoryFilter, skillSearch])

  // Yesterday's intention for continuity
  const latestWithIntention = activities.find((a) => a.intention && a.intention.trim())

  const handleCreateSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    createSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      currentLevel: newSkillLevel,
      learningGoal: newSkillGoal.trim() || 'Master practical concepts.',
      status: newSkillStatus,
      currentlyLearning: newSkillFocus.trim() || 'Foundational topics and application',
      nextStep: newSkillNextStep.trim() || 'Complete first practical exercise'
    })
    setShowCreateSkillModal(false)
    setNewSkillName('')
    setNewSkillGoal('')
    setNewSkillFocus('')
    setNewSkillNextStep('')
  }

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim()) return
    addGoal({
      title: goalTitle.trim(),
      deadline: goalDeadline,
      type: goalType,
      totalSteps: 3
    })
    setShowNewGoalModal(false)
    setGoalTitle('')
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#0c0d14]/10 pb-4 gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#111318]/70 hover:text-[#111318]"
        >
          <ArrowLeft size={14} /> Back to Workspace Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateSkillModal(true)}
            className="flex items-center gap-1.5 border border-[#c1a05b]/30 bg-[#c1a05b]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#f3eee4] transition-colors"
          >
            <Plus size={12} /> + ADD SKILL
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 bg-[#0c0d14] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b] shadow-sm transition-colors"
          >
            <Plus size={13} /> LOG WORK & LEARNING
          </button>
        </div>
      </div>

      {/* VISUAL HERO BANNER WITH REAL ARTWORK */}
      <div className="relative overflow-hidden rounded-3xl border border-[#0c0d14]/20 bg-[#0c0d14] text-[#f3eee4] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="p-8 md:p-12 md:col-span-8 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
              KNOWLEDGE & CAPABILITIES GRAPH
            </span>
            <h1 className="font-serif text-4xl font-light md:text-6xl text-[#f3eee4] leading-tight">
              Learning & Skill Intelligence.
            </h1>
            <p className="text-xs md:text-sm text-[#f3eee4]/80 max-w-xl leading-relaxed">
              Track active skill acquisition, learning roadmaps, and problem-solving logs. Ground your technical growth with verifiable practice evidence.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setShowCreateSkillModal(true)}
                className="flex items-center gap-2 bg-[#c1a05b] px-5 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#08090f] shadow-lg transition-all hover:bg-[#f3eee4] cursor-pointer font-bold"
              >
                <Plus size={14} /> + ADD NEW SKILL
              </button>
            </div>
          </div>

          <div className="relative h-48 md:h-full md:col-span-4 min-h-[220px]">
            <Image
              src="/images/mono-2.png"
              alt="Learning & Skills Artwork"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d14] via-transparent to-transparent hidden md:block" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-6 border-b border-[#0c0d14]/15 pb-8 md:flex-row md:items-end">
        <div>
          <h1 className="mt-1 font-serif text-5xl font-light md:text-7xl text-[#111318]">
            Skills & Learning.
          </h1>
          <p className="mt-3 text-sm text-[#111318]/80 max-w-xl leading-relaxed">
            Track what you are currently learning, practicing, and developing. Skills represent your active development path, while evidence informs capabilities.
          </p>
        </div>
      </div>

      {/* TOP TABS: LEARNING | SKILLS | GOALS */}
      <div className="flex border-b border-[#0c0d14]/15 text-[10px] font-bold uppercase tracking-[.18em]">
        <button
          onClick={() => setActiveTab('SKILLS')}
          className={`px-6 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'SKILLS'
              ? 'border-[#c1a05b] text-[#08090f] bg-[#c1a05b] font-bold shadow'
              : 'border-transparent text-[#111318]/70 hover:text-[#111318]'
          }`}
        >
          SKILLS ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('LEARNING')}
          className={`px-6 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'LEARNING'
              ? 'border-[#c1a05b] text-[#08090f] bg-[#c1a05b] font-bold shadow'
              : 'border-transparent text-[#111318]/70 hover:text-[#111318]'
          }`}
        >
          LEARNING LOGS & TRACKS ({learningTracks.length})
        </button>
        <button
          onClick={() => setActiveTab('GOALS')}
          className={`px-6 py-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'GOALS'
              ? 'border-[#c1a05b] text-[#08090f] bg-[#c1a05b] font-bold shadow'
              : 'border-transparent text-[#111318]/70 hover:text-[#111318]'
          }`}
        >
          GOALS ({goals.length})
        </button>
      </div>

      {/* TAB 1: SKILLS WORKSPACE */}
      {activeTab === 'SKILLS' && (
        <div className="space-y-6">
          {/* Search & Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#0c0d14] p-4 border border-[#c1a05b]/40 shadow-md rounded">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-3 text-[#c1a05b]" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills, topics, goals..."
                className="w-full border border-[#f3eee4]/20 bg-[#08090f] pl-9 pr-3 py-2 text-xs text-[#f3eee4] outline-none focus:border-[#c1a05b] rounded"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold uppercase tracking-wider">
              <span className="text-[#c1a05b] mr-1">Status:</span>
              {['ALL', 'LEARNING', 'PRACTICING', 'APPLIED', 'PLANNED', 'PAUSED', 'ARCHIVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSkillStatusFilter(st)}
                  className={`px-2.5 py-1 transition-colors border cursor-pointer rounded ${
                    skillStatusFilter === st
                      ? 'bg-[#c1a05b] text-[#08090f] border-[#c1a05b] font-bold'
                      : 'bg-[#08090f] text-[#f3eee4]/70 border-[#f3eee4]/15 hover:border-[#c1a05b] hover:text-[#f3eee4]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Cards Grid - Dark Theme Editorial Boxes */}
          {filteredSkills.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((sk) => {
                const linkedProjs = projects.filter((p) =>
                  activities.some((a) => a.skillId === sk.id && a.projectId === p.id) || sk.relatedProjectId === p.id
                )
                return (
                  <div
                    key={sk.id}
                    className="border border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] p-6 flex flex-col justify-between space-y-4 hover:border-[#c1a05b] shadow-xl hover:shadow-2xl transition-all rounded"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.14em]">
                        <span className="bg-[#c1a05b] text-[#08090f] px-2.5 py-0.5 font-bold">{sk.status}</span>
                        <span className="text-[#2ec4b6] bg-[#2ec4b6]/15 px-2 py-0.5">{sk.category}</span>
                      </div>

                      <div>
                        <h3 className="font-serif text-3xl font-light text-[#f3eee4] hover:text-[#c1a05b] transition-colors">{sk.name}</h3>
                        <span className="text-[10px] text-[#f3eee4]/60 block mt-0.5">Level: {sk.currentLevel}</span>
                      </div>

                      <p className="text-xs text-[#f3eee4]/80 leading-relaxed line-clamp-2">
                        {sk.learningGoal}
                      </p>

                      {/* Currently Learning Focus */}
                      {sk.currentlyLearning && (
                        <div className="bg-[#08090f] border-l-2 border-[#2ec4b6] p-3 text-xs text-[#2ec4b6] rounded-r">
                          <span className="text-[9px] font-bold uppercase tracking-wider block opacity-80 text-[#2ec4b6]">
                            CURRENT FOCUS
                          </span>
                          <span className="font-serif text-sm italic font-light text-[#f3eee4]">
                            "{sk.currentlyLearning}"
                          </span>
                        </div>
                      )}

                      {/* Next Step */}
                      {sk.nextStep && (
                        <div className="text-[11px] text-[#c1a05b]">
                          <span className="font-bold uppercase tracking-wider text-[9px] block text-[#c1a05b]/80">Next Step: </span>
                          {sk.nextStep}
                        </div>
                      )}

                      {/* Projects Applied */}
                      {linkedProjs.length > 0 && (
                        <div className="text-[10px] text-[#f3eee4]/70 flex items-center gap-1 pt-1 border-t border-[#f3eee4]/10">
                          <Folder size={11} className="text-[#c1a05b]" />
                          <span>Applied in: <strong className="text-[#f3eee4]">{linkedProjs.map((p) => p.name).join(', ')}</strong></span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/skills/${sk.id}`}
                      className="inline-flex items-center justify-between w-full border border-[#c1a05b]/40 bg-[#08090f] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#08090f] transition-colors rounded"
                    >
                      <span>OPEN SKILL PROFILE</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#0c0d14] border border-[#c1a05b]/40 text-[#f3eee4] p-12 text-center space-y-4 rounded">
              <GraduationCap className="mx-auto text-[#c1a05b]" size={40} />
              <h3 className="font-serif text-3xl font-light">No Skills Found</h3>
              <p className="text-xs text-[#f3eee4]/70 max-w-md mx-auto">
                Create your first Skill to track your active learning, study goals, and practical application.
              </p>
              <button
                onClick={() => setShowCreateSkillModal(true)}
                className="bg-[#c1a05b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.16em] text-[#08090f]"
              >
                + Create First Skill
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEARNING LOGS & TRACKS */}
      {activeTab === 'LEARNING' && (
        <div className="space-y-8">
          {/* Yesterday's Intention Banner */}
          {latestWithIntention && (
            <div className="border border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] p-5 flex flex-col justify-between gap-4 md:flex-row md:items-center rounded shadow-xl">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                  CONTINUITY · PREVIOUS INTENTION
                </span>
                <p className="mt-1 font-serif text-xl font-light text-[#f3eee4]">
                  "{latestWithIntention.intention}"
                </p>
                <span className="text-[10px] text-[#f3eee4]/60 block mt-1">Logged on {latestWithIntention.date}</span>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="shrink-0 bg-[#c1a05b] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#08090f] hover:bg-[#f3eee4] font-bold rounded cursor-pointer"
              >
                LOG PROGRESS ON THIS INTENTION →
              </button>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-serif text-3xl font-light text-[#111318]">Structured Learning Tracks</h2>
              {learningTracks.map((track) => (
                <div key={track.id} className="border border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] p-6 space-y-4 rounded shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-2xl font-light text-[#f3eee4]">{track.topic}</h3>
                    <span className="font-serif text-2xl font-light text-[#c1a05b]">{track.progress}%</span>
                  </div>

                  <div className="h-2 w-full bg-[#08090f] rounded-full overflow-hidden border border-[#f3eee4]/10">
                    <div className="h-full bg-[#c1a05b]" style={{ width: `${track.progress}%` }} />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {track.steps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => toggleLearningStep(track.id, step.id)}
                        className="flex items-center gap-3 text-xs cursor-pointer hover:opacity-90"
                      >
                        {step.status === 'COMPLETED' ? (
                          <CheckCircle2 size={16} className="text-[#2ec4b6] shrink-0" />
                        ) : (
                          <Circle size={16} className="text-[#f3eee4]/40 shrink-0" />
                        )}
                        <span className={step.status === 'COMPLETED' ? 'line-through opacity-50 text-[#f3eee4]' : 'font-medium text-[#f3eee4]'}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-serif text-3xl font-light text-[#111318]">Blockers & Struggle Resolutions</h2>
              {problems.map((prob) => (
                <div key={prob.id} className="border border-[#c1a05b]/40 bg-[#0c0d14] text-[#f3eee4] p-5 space-y-3 text-xs rounded shadow-xl">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#c1a05b]">STRUGGLE LOGGED</span>
                  <p className="font-serif text-lg font-light text-[#f3eee4]">{prob.problem}</p>
                  {prob.solution && (
                    <p className="text-xs text-[#2ec4b6] bg-[#08090f] p-3 border border-[#2ec4b6]/30 rounded">
                      <strong className="block text-[9px] uppercase tracking-wider text-[#2ec4b6] mb-0.5">Resolution:</strong> {prob.solution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOALS WORKSPACE */}
      {activeTab === 'GOALS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#0c0d14]/15 pb-4">
            <h2 className="font-serif text-3xl font-light text-[#111318]">Learning & Project Goals</h2>
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="bg-[#0c0d14] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] border border-[#c1a05b]/40 hover:bg-[#c1a05b] hover:text-[#08090f] transition-colors rounded cursor-pointer"
            >
              + NEW GOAL
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`border p-5 space-y-3 cursor-pointer transition-all rounded shadow-xl ${
                  g.completed ? 'bg-[#0c0d14] border-[#2ec4b6]/50 text-[#f3eee4]' : 'bg-[#0c0d14] border-[#c1a05b]/40 text-[#f3eee4]'
                }`}
              >
                <div className="flex justify-between text-[9px] font-bold uppercase">
                  <span className="bg-[#c1a05b] text-[#08090f] px-2 py-0.5 font-bold">{g.type}</span>
                  <span className="text-[#2ec4b6]">Target: {g.deadline}</span>
                </div>

                <div className="flex items-start gap-2">
                  {g.completed ? (
                    <CheckCircle2 className="text-[#2ec4b6] shrink-0 mt-1" size={18} />
                  ) : (
                    <Circle className="text-[#f3eee4]/40 shrink-0 mt-1" size={18} />
                  )}
                  <h3 className={`font-serif text-xl font-light ${g.completed ? 'line-through opacity-60' : 'text-[#f3eee4]'}`}>
                    {g.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE SKILL MODAL */}
      {showCreateSkillModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0c0d14]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#f3eee4] p-7 text-[#111318] shadow-2xl border border-[#0c0d14]/20 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#0c0d14]/15 pb-3 mb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                  ADD NEW SKILL
                </span>
                <h2 className="font-serif text-3xl font-light">Create Skill Profile</h2>
              </div>
              <button onClick={() => setShowCreateSkillModal(false)} className="text-[#111318]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                  Skill Name <span className="text-[#7c2634]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, React Architecture"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#c1a05b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI / Data, Frontend"
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                    Current Status
                  </label>
                  <select
                    value={newSkillStatus}
                    onChange={(e) => setNewSkillStatus(e.target.value as SkillStatus)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="LEARNING">LEARNING</option>
                    <option value="PRACTICING">PRACTICING</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="STRONG">STRONG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                  Overall Learning Goal
                </label>
                <textarea
                  placeholder="e.g. Build and deploy practical ML evaluation pipelines"
                  value={newSkillGoal}
                  onChange={(e) => setNewSkillGoal(e.target.value)}
                  rows={2}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#c1a05b] mb-1">
                  Currently Learning Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Model evaluation and cross-validation metrics"
                  value={newSkillFocus}
                  onChange={(e) => setNewSkillFocus(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9b7b3b] mb-1">
                  Next Practical Step
                </label>
                <input
                  type="text"
                  placeholder="e.g. Implement cross-validation on Expense Intelligence dataset"
                  value={newSkillNextStep}
                  onChange={(e) => setNewSkillNextStep(e.target.value)}
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#0c0d14]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateSkillModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#111318]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#c1a05b] px-6 py-2.5 text-xs font-bold uppercase text-[#f3eee4] shadow-md"
                >
                  Create Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0c0d14]/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#f3eee4] p-6 text-[#111318] shadow-2xl border border-[#0c0d14]/20">
            <div className="flex justify-between items-center border-b border-[#0c0d14]/15 pb-3 mb-4">
              <h2 className="font-serif text-2xl font-light">Add New Goal</h2>
              <button onClick={() => setShowNewGoalModal(false)} className="text-[#111318]/50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Complete cross-validation model pipeline"
                  className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                    Goal Type
                  </label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as any)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Learning">Learning</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111318]/70 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full border border-[#0c0d14]/20 bg-transparent px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase text-[#111318]/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0c0d14] px-5 py-2 text-xs font-bold uppercase text-[#f3eee4]"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogModal && <QuickCaptureModal onClose={() => setShowLogModal(false)} />}
    </div>
  )
}

export default function LearningPage() {
  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />
      <Suspense fallback={<div className="p-10 text-center text-xs">Loading Learning Workspace...</div>}>
        <LearningContent />
      </Suspense>
    </main>
  )
}
