'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Compass,
  Edit3,
  FileText,
  Flame,
  Folder,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { QuickCaptureModal } from '@/components/quick-capture-modal'
import { ActivityHeatmap } from '@/components/activity-heatmap'
import { WorkfolioMascot } from '@/components/workfolio-mascot'
import { AuthModal } from '@/components/auth-modal'
import { WeeklyReflectionSection } from '@/components/weekly-reflection'
import { NextActionSection } from '@/components/next-action-section'
import { AskWorkfolioModal } from '@/components/ask-workfolio-modal'
import { ActivityLogEntry, useWorkfolio } from '@/lib/workfolio-store'

export default function Home() {
  const { userProfile, setMascotVariant, activities, projects, skills, learningTracks, goals, problems, implementations, deleteActivity } = useWorkfolio()
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [captureInitialMode, setCaptureInitialMode] = useState<'direct' | 'ai' | 'voice'>('direct')
  const [showAskModal, setShowAskModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityLogEntry | null>(null)

  // Filter today's activities
  const todayStr = new Date().toISOString().split('T')[0]
  const todayActivities = activities.filter((a) => a.date === todayStr)

  // Sort projects by recent activity date (non-archived)
  const activeProjects = projects
    .filter((p) => p.status !== 'Archived')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const recentlyActiveProjects = activeProjects.slice(0, 3)

  // Active skills
  const activeSkills = skills.filter((s) => s.status !== 'ARCHIVED').slice(0, 3)

  const [greetingPrefix, setGreetingPrefix] = useState('Good morning')

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 12) {
      setGreetingPrefix('Good morning')
    } else if (hour >= 12 && hour < 17) {
      setGreetingPrefix('Good afternoon')
    } else if (hour >= 17 && hour < 22) {
      setGreetingPrefix('Good evening')
    } else {
      setGreetingPrefix('Good night')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-7xl px-5 py-6 md:px-10 md:py-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* HERO SECTION: EDITORIAL BANNER CARD & DASHBOARD CONTROL STRIP */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* HERO SECTION: DYNAMIC USER GREETING & INTERACTIVE 3D MASCOT */}
        {/* ========================================================================= */}
        <section className="border border-[#c1a05b]/30 bg-[#0c0d14] p-6 md:p-8 text-[#f3eee4] shadow-xl rounded">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Left Content Column - Dynamic Greeting */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="font-serif text-4xl font-light leading-none tracking-[-.03em] md:text-5xl text-[#f3eee4]">
                {userProfile?.display_name || userProfile?.first_name
                  ? `${greetingPrefix}, ${userProfile.display_name || userProfile.first_name}.`
                  : `${greetingPrefix}.`}
              </h1>

              {/* Quick Metrics Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold uppercase tracking-wider text-[#f3eee4]">
                <div className="flex items-center gap-1.5 bg-[#08090f] px-3 py-1.5 border border-[#c1a05b]/30">
                  <Flame size={14} className="text-[#c1a05b]" />
                  <span>{activities.length > 0 ? 'Active Streak' : '0 Day Streak'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#08090f] px-3 py-1.5 border border-[#c1a05b]/30">
                  <BookOpen size={14} className="text-[#c1a05b]" />
                  <span>{todayActivities.length} Today's Logs</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#08090f] px-3 py-1.5 border border-[#c1a05b]/30">
                  <Folder size={14} className="text-[#2ec4b6]" />
                  <span>{activeProjects.length} Active Projects</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setShowCaptureModal(true)}
                  className="group inline-flex items-center gap-3 bg-[#c1a05b] px-6 py-3.5 text-xs font-bold uppercase tracking-[.18em] text-[#08090f] shadow-md transition-all hover:bg-[#f3eee4] cursor-pointer"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#08090f] text-[#c1a05b] transition-transform group-hover:rotate-45">
                    <Plus size={12} />
                  </span>
                  <span>+ LOG DAILY ACTIVITY</span>
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-2 border border-[#c1a05b]/40 bg-[#08090f] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#08090f] transition-colors cursor-pointer"
                >
                  <User size={13} /> Account & Identity
                </button>
              </div>
            </div>

            {/* Right 3D Mascot Column - High Contrast Spotlight Backdrop & Highlighted Settings Pill */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center border border-[#c1a05b]/50 bg-gradient-to-b from-[#121420] via-[#08090f] to-[#05060a] p-4 shadow-2xl relative overflow-hidden rounded group min-h-[340px] transition-all duration-300 hover:border-[#c1a05b] hover:shadow-[0_20px_50px_rgba(193,160,91,0.3)] hover:scale-[1.02]">
              {/* Highlighted Settings Button Pill */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group/btn flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#c1a05b] hover:text-[#08090f] bg-[#08090f]/90 hover:bg-[#c1a05b] px-3.5 py-1.5 border border-[#c1a05b]/60 hover:border-[#c1a05b] rounded-full shadow-[0_4px_14px_rgba(193,160,91,0.25)] hover:shadow-[0_6px_20px_rgba(193,160,91,0.45)] transition-all duration-300 cursor-pointer backdrop-blur-md hover:scale-105"
                  title="Manage Name, Gender & API Keys in Settings"
                >
                  <span className="text-xs transition-transform duration-300 group-hover/btn:rotate-90">⚙</span>
                  <span>SETTINGS</span>
                </button>
              </div>

              <WorkfolioMascot
                variant={userProfile?.mascot_variant || 'male'}
                size="lg"
                interactive={true}
                showGenderToggle={false}
              />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD MULTI-COLUMN GRID: 8 COLS MAIN STREAM / 4 COLS SIDEBAR */}
        {/* ========================================================================= */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT MAIN COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CONTAINER 1: TODAY'S WORK STREAM */}
            <section className="border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] shadow-xl">
              <div className="flex items-center justify-between border-b border-[#c1a05b]/20 bg-[#08090f] px-6 py-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#c1a05b]">
                    TODAY'S WORK STREAM
                  </span>
                  <h2 className="font-serif text-2xl font-light text-[#f3eee4] mt-0.5">{todayStr}</h2>
                </div>
                <button
                  onClick={() => setShowCaptureModal(true)}
                  className="flex items-center gap-1.5 border border-[#c1a05b]/40 bg-[#c1a05b] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#08090f] hover:bg-[#f3eee4] transition-colors cursor-pointer"
                >
                  <Plus size={12} /> + LOG UPDATE
                </button>
              </div>

              <div className="p-6">
                {todayActivities.length > 0 ? (
                  <div className="space-y-6">
                    {todayActivities.map((act) => (
                      <div
                        key={act.id}
                        className="relative pl-6 border-l-2 border-[#c1a05b]/40 space-y-3 py-1"
                      >
                        <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-[#c1a05b] border-2 border-[#08090f]" />
                        
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[.16em]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-[#c1a05b] text-[#08090f] px-2 py-0.5 font-bold">{act.type}</span>
                            <span className="text-[#c1a05b] font-semibold">{act.projectTitle || 'Independent Work'}</span>
                            {act.skillName && (
                              <span className="text-[#2ec4b6] bg-[#2ec4b6]/15 px-2 py-0.5">Skill: {act.skillName}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <span className="text-[#f3eee4]/60 font-mono">{act.time}</span>
                            <button
                              onClick={() => setEditingActivity(act)}
                              className="flex items-center gap-1 bg-[#c1a05b]/20 hover:bg-[#c1a05b] text-[#c1a05b] hover:text-[#08090f] border border-[#c1a05b]/40 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              title="Edit this log entry"
                            >
                              <Edit3 size={10} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete activity log: "${act.work.slice(0, 35)}..."?`)) {
                                  deleteActivity(act.id)
                                }
                              }}
                              className="flex items-center gap-1 bg-[#e63946]/15 hover:bg-[#e63946] text-[#ff6b6b] hover:text-white border border-[#e63946]/30 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 size={10} /> Delete
                            </button>
                          </div>
                        </div>

                        <p className="font-serif text-2xl font-light leading-snug text-[#f3eee4]">{act.work}</p>

                        <div className="grid gap-3 md:grid-cols-3 text-xs pt-1">
                          {act.learning && (
                            <div className="bg-[#2ec4b6]/15 border-l-2 border-[#2ec4b6] p-3 text-[#2ec4b6]">
                              <strong className="block text-[9px] font-bold uppercase tracking-[.12em] mb-0.5 opacity-80">WHAT WAS LEARNED:</strong>
                              {act.learning}
                            </div>
                          )}
                          {act.struggle && (
                            <div className="bg-[#e63946]/15 border-l-2 border-[#e63946] p-3 text-[#ff6b6b]">
                              <strong className="block text-[9px] font-bold uppercase tracking-[.12em] mb-0.5 opacity-80">STRUGGLE / BLOCKER:</strong>
                              {act.struggle}
                            </div>
                          )}
                          {act.intention && (
                            <div className="bg-[#c1a05b]/15 border-l-2 border-[#c1a05b] p-3 text-[#c1a05b]">
                              <strong className="block text-[9px] font-bold uppercase tracking-[.12em] mb-0.5 opacity-80">NEXT INTENTION:</strong>
                              {act.intention}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-[#c1a05b]/30 bg-[#08090f] p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <BookOpen size={32} className="text-[#c1a05b]/60" />
                    <h3 className="font-serif text-3xl font-light text-[#f3eee4]">What did you work on today?</h3>
                    <p className="text-xs text-[#f3eee4]/70 max-w-md">
                      Log what you built, learned, struggled with, and intend to do next in under 30 seconds.
                    </p>
                    <button
                      onClick={() => setShowCaptureModal(true)}
                      className="bg-[#c1a05b] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#08090f] hover:bg-[#f3eee4] transition-colors cursor-pointer"
                    >
                      + LOG YOUR FIRST UPDATE
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* CONTAINER 2: CURRENT PROJECTS WORKSPACE */}
            <section className="border-t-4 border-[#c1a05b] border-x border-b border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] p-6 shadow-xl space-y-5">
              <div className="flex items-end justify-between border-b border-[#c1a05b]/20 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
                    CURRENT PROJECTS WORKSPACE
                  </p>
                  <h2 className="mt-0.5 font-serif text-3xl font-light text-[#f3eee4]">Active Builds & Systems</h2>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#c1a05b] hover:text-[#f3eee4] transition-colors"
                >
                  SEE ALL PROJECTS →
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {recentlyActiveProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group border border-[#c1a05b]/30 bg-[#08090f] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#c1a05b] hover:shadow-[0_10px_30px_rgba(193,160,91,0.15)] rounded-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className="bg-[#c1a05b]/20 text-[#c1a05b] border border-[#c1a05b]/40 px-2 py-0.5 rounded-xs">
                          {project.category}
                        </span>
                        <span className="text-[#f3eee4]/60 font-mono text-[9px] uppercase">
                          {project.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-light text-[#f3eee4] group-hover:text-[#c1a05b] transition-colors leading-tight">
                        {project.name}
                      </h3>

                      <p className="text-xs text-[#f3eee4]/75 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-[#f3eee4]/10 pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#f3eee4]/60">
                      <span className="font-mono">Updated {project.date}</span>
                      <span className="inline-flex items-center gap-1 text-[#c1a05b] group-hover:text-[#f3eee4] transition-colors">
                        OPEN <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* CONTAINER 3: CURRENTLY LEARNING & ACTIVE SKILLS PATH */}
            <section className="border-l-4 border-[#2ec4b6] border-y border-r border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] p-6 shadow-xl space-y-5">
              <div className="flex items-end justify-between border-b border-[#c1a05b]/20 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#2ec4b6]">
                    CURRENTLY LEARNING
                  </p>
                  <h2 className="mt-0.5 font-serif text-3xl font-light text-[#f3eee4]">Active Skill Development Path</h2>
                </div>
                <Link
                  href="/learning?tab=SKILLS"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#2ec4b6] hover:text-[#f3eee4]"
                >
                  VIEW ALL SKILLS →
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {activeSkills.map((sk) => (
                  <Link
                    key={sk.id}
                    href={`/skills/${sk.id}`}
                    className="group border border-[#2ec4b6]/30 bg-[#08090f] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#2ec4b6] hover:shadow-[0_10px_30px_rgba(46,196,182,0.15)] rounded-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-[#2ec4b6]/20 border border-[#2ec4b6]/40 text-[#2ec4b6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs">
                          {sk.status}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#c1a05b] truncate max-w-[130px]">
                          {sk.category}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-light text-[#f3eee4] group-hover:text-[#2ec4b6] transition-colors leading-tight">
                        {sk.name}
                      </h3>

                      {sk.currentlyLearning && (
                        <p className="text-xs text-[#2ec4b6]/90 font-medium leading-relaxed border-l-2 border-[#2ec4b6] pl-2.5 py-0.5">
                          "{sk.currentlyLearning}"
                        </p>
                      )}
                    </div>

                    <div className="mt-5 border-t border-[#f3eee4]/10 pt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#2ec4b6]">
                      <span>View Skill Profile</span>
                      <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* AI FEATURE 4: NEXT ACTION SECTION */}
            <div id="next-action">
              <NextActionSection />
            </div>

            {/* AI FEATURE 3: WEEKLY REFLECTION SECTION */}
            <div id="reflection">
              <WeeklyReflectionSection />
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (4 COLS) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* SIDEBAR WIDGET 1: REFLECTION STREAK & HEATMAP */}
            <div className="border border-[#c1a05b]/30 bg-[#0c0d14] text-[#f3eee4] p-5 shadow-xl space-y-4">
              <ActivityHeatmap activities={activities} />
            </div>

            {/* ASK WORKFOLIO ASSISTANT LAUNCHER CARD */}
            <div className="rounded-2xl border border-[#c1a05b]/40 bg-[#0c0d14] p-6 text-[#f3eee4] shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                <Sparkles size={14} /> ASK WORKFOLIO ASSISTANT
              </div>
              <h3 className="font-serif text-2xl font-light">Natural Language Query Engine</h3>
              <p className="text-xs text-[#f3eee4]/70 leading-relaxed">
                Query your activities, skills, and evidence through controlled tool lookups.
              </p>
              <button
                onClick={() => setShowAskModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c1a05b] py-3 text-xs font-bold uppercase tracking-wider text-[#08090f] hover:bg-white transition-all shadow-md cursor-pointer"
              >
                <Sparkles size={14} /> Launch Workfolio Assistant
              </button>
            </div>

          </aside>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-20 flex flex-col justify-between gap-8 bg-[#7c2634] px-6 py-10 text-[#f3eee4] md:flex-row md:items-end md:px-10">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#f3eee4]/30 shadow-md shrink-0 bg-[#08090f]">
            <Image
              src="/images/workfolio-logo.jpg"
              alt="Workfolio Emblem Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-serif text-3xl font-light">WORKFOLIO</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/70">
              TRACE THE TASK · Personal Work Operating System
            </p>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/60">
          Your work. Your proof. Your profile.
        </p>
      </footer>

      {showCaptureModal && (
        <QuickCaptureModal
          initialMode={captureInitialMode}
          onClose={() => {
            setShowCaptureModal(false)
            setCaptureInitialMode('direct')
          }}
        />
      )}
      {editingActivity && (
        <QuickCaptureModal
          activityToEdit={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
      {showAskModal && <AskWorkfolioModal isOpen={showAskModal} onClose={() => setShowAskModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  )
}
