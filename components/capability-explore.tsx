'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowDown, ArrowUpRight, ExternalLink, Plus, Sparkles, X } from 'lucide-react'

const stages = [
  { label: 'STUDIED', title: 'Curiosity becomes direction.', detail: 'Courses, questions and first principles that started the motion.', count: '12 notes', tone: 'paper' },
  { label: 'LEARNED', title: 'Patterns become instinct.', detail: 'The frameworks, tools and hard-won lessons you can now reach for.', count: '24 activities', tone: 'gold' },
  { label: 'BUILT', title: 'Ideas become tangible.', detail: 'Interfaces, systems and experiments that made the abstract real.', count: '8 projects', tone: 'forest' },
  { label: 'SOLVED', title: 'Friction becomes fluency.', detail: 'The difficult edges where your judgment did the most work.', count: '16 proofs', tone: 'burgundy' },
  { label: 'SHIPPED', title: 'Work becomes proof.', detail: 'A trail of outcomes you can return to, explain and share.', count: '42 signals', tone: 'ink' },
]

const archive = [
  { type: 'LIVE APPLICATION', title: 'Expense Tracker', meta: 'React / OCR / API', size: 'tall', color: 'cream' },
  { type: 'ARCHITECTURE', title: 'The system behind the signal', meta: '4 layers / 12 connections', size: 'wide', color: 'gold' },
  { type: 'REPOSITORY', title: 'weather-api / main', meta: 'GitHub · updated 2d ago', size: 'small', color: 'forest' },
  { type: 'TECHNICAL NOTE', title: 'Why we chose the long way', meta: 'PDF · 6 pages', size: 'small', color: 'burgundy' },
  { type: 'SCREENSHOT', title: 'A calmer kind of dashboard', meta: 'Product UI · v03', size: 'wide', color: 'sand' },
]

const projects = [
  { name: 'EXPENSE TRACKER', description: 'Voice + OCR-powered expense management for people who want their data to stay theirs.', tags: ['REACT', 'OCR', 'API INTEGRATION', 'DEPLOYMENT'], stats: '8 activities · 5 evidence items', accent: 'gold' },
  { name: 'WEATHER API', description: 'A resilient data layer that turns raw conditions into decisions people can act on.', tags: ['PYTHON', 'DATA', 'AUTOMATION'], stats: '6 activities · 3 evidence items', accent: 'forest' },
]

const nodes = [
  { name: 'Python', x: 19, y: 27, kind: 'capability' }, { name: 'React', x: 49, y: 18, kind: 'capability' },
  { name: 'OCR', x: 76, y: 31, kind: 'capability' }, { name: 'Automation', x: 82, y: 66, kind: 'capability' },
  { name: 'Problem Solving', x: 48, y: 78, kind: 'capability' }, { name: 'Deployment', x: 18, y: 70, kind: 'capability' },
  { name: 'Expense Tracker', x: 48, y: 44, kind: 'project' }, { name: 'Weather API', x: 68, y: 57, kind: 'project' },
]

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9b7b3b]"><span>{number}</span><span className="h-px w-10 bg-[#9b7b3b]/50" /><span>{children}</span></div>
}

export function CapabilityExplore() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0, label: '' })
  const [showCursor, setShowCursor] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: mainRef })
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const heroY = useTransform(progress, [0, .2], [0, -60])

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    let frame = 0
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(frame); lenis.destroy() }
  }, [])

  useEffect(() => {
    const move = (event: MouseEvent) => setCursor((current) => ({ ...current, x: event.clientX, y: event.clientY }))
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const cursorProps = (label: string) => ({ onMouseEnter: () => { setShowCursor(true); setCursor((c) => ({ ...c, label })) }, onMouseLeave: () => { setShowCursor(false); setCursor((c) => ({ ...c, label: '' })) } })

  return (
    <main ref={mainRef} className="min-h-screen overflow-hidden bg-[#f3eee4] text-[#111318] selection:bg-[#9b7b3b] selection:text-white">
      <motion.div className="fixed left-0 top-0 z-[60] h-1 origin-left bg-[#9b7b3b]" style={{ scaleX: progress, width: '100%' }} />
      <motion.div className="pointer-events-none fixed z-[70] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#9b7b3b] text-[8px] font-bold uppercase tracking-wider text-white mix-blend-multiply md:flex" animate={{ left: cursor.x, top: cursor.y, opacity: showCursor ? 1 : 0, scale: showCursor ? 1 : .5 }}>{cursor.label}</motion.div>

      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#0c0d14]/10 bg-[#f3eee4]/80 px-5 py-4 backdrop-blur-md md:px-10">
        <a href="#top" className="flex items-center gap-3" {...cursorProps('HOME')}><span className="flex h-8 w-8 items-center justify-center bg-[#0c0d14] text-xs font-bold text-[#f3eee4]">WF</span><span className="hidden text-xs font-semibold tracking-[.18em] md:block">WORKFOLIO</span></a>
        <div className="hidden gap-7 text-[10px] font-semibold uppercase tracking-[.18em] md:flex"><a href="#journey">Proof Ledger</a><a href="#archive">Evidence</a><a href="#constellation">Capabilities</a></div>
        <button onClick={() => setActiveAction('Log activity')} className="flex items-center gap-2 border border-[#0c0d14] px-4 py-2 text-[10px] font-semibold uppercase tracking-[.16em] transition-colors hover:bg-[#0c0d14] hover:text-[#f3eee4]" {...cursorProps('LOG')}><Plus size={13} /> Log Activity</button>
      </nav>

      <section id="top" className="relative flex min-h-screen items-center px-6 pb-20 pt-32 md:px-[10vw]">
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-40" />
        <motion.div style={{ y: heroY }} className="relative z-10 max-w-5xl">
          <SectionLabel number="00 / 06">A LIVING RECORD OF WORK</SectionLabel>
          <h1 className="mt-7 max-w-4xl font-serif text-[clamp(4rem,11vw,10.5rem)] font-light leading-[.83] tracking-[-.07em]">YOUR WORK<br /><em className="text-[#9b7b3b]">BECOMES</em><br />PROOF.</h1>
          <div className="mt-10 flex max-w-xl flex-col gap-8 md:ml-[22vw] md:flex-row md:items-end"><p className="max-w-sm text-base leading-relaxed text-[#111318]/70">Record what you built, learned, solved and shipped. Your evidence becomes a living capability profile.</p><button onClick={() => setActiveAction('Log activity')} className="group flex shrink-0 items-center gap-3 text-xs font-bold uppercase tracking-[.18em]" {...cursorProps('ADD')}><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0c0d14] text-white transition-transform group-hover:rotate-45"><Plus size={17} /></span> Log Activity</button></div>
        </motion.div>
        <div className="absolute bottom-8 left-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.24em] md:left-10"><ArrowDown size={14} className="animate-bounce" /> Scroll to explore</div>
        <div className="absolute bottom-10 right-8 hidden font-serif text-8xl font-light text-[#111318]/10 md:block">01</div>
        <div className="absolute right-[8%] top-[30%] h-72 w-72 rounded-full border border-[#9b7b3b]/30 md:h-[26vw] md:w-[26vw]"><div className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#9b7b3b] shadow-[0_0_0_14px_#9b7b3b22]" /><span className="absolute left-[15%] top-[23%] h-1.5 w-1.5 rounded-full bg-[#7c2634]" /><span className="absolute bottom-[18%] right-[10%] h-1.5 w-1.5 rounded-full bg-[#0c0d14]" /></div>
      </section>

      <section id="journey" className="bg-[#0c0d14] px-6 py-28 text-[#f3eee4] md:px-10 md:py-40"><div className="mx-auto max-w-7xl"><SectionLabel number="01 / 06">THE WORK JOURNEY</SectionLabel><div className="mt-7 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-3xl font-serif text-5xl font-light leading-none tracking-[-.04em] md:text-8xl">From learning<br /><em className="text-[#c1a05b]">to shipping.</em></h2><p className="max-w-xs text-sm leading-relaxed text-[#f3eee4]/60">Every step leaves evidence. Follow the trail from the first question to the thing that works.</p></div><div className="mt-20 flex snap-x gap-4 overflow-x-auto pb-5 md:mt-28 md:gap-6">{stages.map((stage, i) => <motion.article key={stage.label} whileHover={{ y: -8 }} className={`min-w-[82vw] snap-center border border-[#f3eee4]/15 p-6 md:min-w-[31vw] md:p-8 ${stage.tone === 'forest' ? 'bg-[#c1a05b]' : stage.tone === 'burgundy' ? 'bg-[#6f2736]' : stage.tone === 'gold' ? 'bg-[#9b7b3b] text-[#111318]' : stage.tone === 'ink' ? 'bg-[#122c21]' : 'bg-[#e8dfd0] text-[#111318]'}`}><div className="flex items-center justify-between text-[10px] font-bold tracking-[.2em]"><span>{String(i + 1).padStart(2, '0')}</span><span>{stage.count}</span></div><div className="mt-28 text-xs font-bold tracking-[.22em]">{stage.label}</div><h3 className="mt-4 font-serif text-4xl leading-none md:text-5xl">{stage.title}</h3><p className="mt-5 max-w-xs text-sm leading-relaxed opacity-70">{stage.detail}</p><div className="mt-14 h-px w-full bg-current opacity-20" /><div className="mt-4 flex items-center justify-between text-[10px] font-bold tracking-[.18em]"><span>TRACE EVIDENCE</span><ArrowUpRight size={15} /></div></motion.article>)}</div></div></section>

      <section id="archive" className="px-6 py-28 md:px-10 md:py-40"><div className="mx-auto max-w-7xl"><SectionLabel number="02 / 06">THE PROOF ARCHIVE</SectionLabel><div className="mt-7 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="font-serif text-5xl font-light leading-none tracking-[-.04em] md:text-8xl">The work behind<br /><em className="text-[#7c2634]">the profile.</em></h2><p className="max-w-xs text-sm leading-relaxed text-[#111318]/60">A visual archive of the things you made, documented and put into the world.</p></div><div className="mt-16 grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[190px] md:grid-cols-4">{archive.map((item, i) => <motion.button key={item.title} onClick={() => setActiveAction(item.title)} whileHover={{ scale: 1.015 }} className={`group relative overflow-hidden p-5 text-left ${item.size === 'tall' ? 'row-span-2' : item.size === 'wide' ? 'col-span-2' : ''} ${item.color === 'forest' ? 'bg-[#0c0d14] text-[#f3eee4]' : item.color === 'gold' ? 'bg-[#c1a05b]' : item.color === 'burgundy' ? 'bg-[#7c2634] text-[#f3eee4]' : item.color === 'sand' ? 'bg-[#d8c8ad]' : 'bg-[#e8dfd0] text-[#111318]'}`} {...cursorProps('OPEN PROOF')}><span className="absolute right-5 top-5 text-[9px] font-bold tracking-[.15em] opacity-60">0{i + 1}</span><div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110" style={{ background: 'radial-gradient(circle at 70% 30%, currentColor, transparent 40%)' }} /><div className="relative flex h-full flex-col justify-end"><span className="text-[9px] font-bold tracking-[.18em] opacity-70">{item.type}</span><strong className="mt-2 font-serif text-2xl font-light leading-none md:text-3xl">{item.title}</strong><span className="mt-3 text-[10px] opacity-65">{item.meta}</span></div><ExternalLink className="absolute bottom-5 right-5 opacity-0 transition-opacity group-hover:opacity-100" size={16} /></motion.button>)}</div></div></section>

      <section id="projects" className="border-t border-[#0c0d14]/10 px-6 py-28 md:px-10 md:py-40"><div className="mx-auto max-w-7xl"><SectionLabel number="03 / 06">PROJECT STORIES</SectionLabel><h2 className="mt-7 max-w-3xl font-serif text-5xl font-light leading-none tracking-[-.04em] md:text-8xl">Work that became<br /><em className="text-[#9b7b3b]">projects.</em></h2><div className="mt-16 space-y-5">{projects.map((project, i) => <motion.article key={project.name} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 35 }} viewport={{ once: true }} className="grid min-h-[340px] overflow-hidden bg-[#e5dac9] md:grid-cols-2"><div className={`relative min-h-[260px] overflow-hidden ${project.accent === 'gold' ? 'bg-[#9b7b3b]' : 'bg-[#c1a05b]'}`}><div className="absolute inset-10 border border-[#f3eee4]/40" /><div className="absolute bottom-7 left-7 text-[9px] font-bold tracking-[.18em] text-[#f3eee4]/70">PROJECT / {String(i + 1).padStart(2, '0')}</div><Sparkles className="absolute right-12 top-12 text-[#f3eee4]/70" size={34} /></div><div className="flex flex-col justify-between p-7 md:p-10"><div><div className="flex justify-between text-[10px] font-bold tracking-[.18em] text-[#111318]/50"><span>CASE STUDY</span><span>{project.stats}</span></div><h3 className="mt-16 font-serif text-4xl leading-none md:text-6xl">{project.name}</h3><p className="mt-5 max-w-md text-sm leading-relaxed text-[#111318]/65">{project.description}</p></div><div className="mt-12 flex flex-wrap items-center gap-2"><div className="flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="border border-[#0c0d14]/20 px-2 py-1 text-[9px] font-bold tracking-[.12em]">{tag}</span>)}</div><button onClick={() => setActiveAction(project.name)} className="ml-auto flex items-center gap-2 text-[10px] font-bold tracking-[.16em]" {...cursorProps('EXPLORE')}>VIEW PROJECT <ArrowUpRight size={15} /></button></div></div></motion.article>)}</div></div></section>

      <section id="constellation" className="bg-[#0c0d14] px-6 py-28 text-[#f3eee4] md:px-10 md:py-40"><div className="mx-auto max-w-7xl"><SectionLabel number="04 / 06">CAPABILITY CONSTELLATION</SectionLabel><div className="mt-7 flex flex-col justify-between gap-6 md:flex-row"><h2 className="max-w-2xl font-serif text-5xl font-light leading-none tracking-[-.04em] md:text-8xl">See how your work<br /><em className="text-[#c1a05b]">connects.</em></h2><p className="max-w-xs text-sm leading-relaxed text-[#f3eee4]/60">Hover a node to trace the chain from evidence, through projects, to what you can demonstrate.</p></div><div className="relative mt-16 h-[520px] overflow-hidden border border-[#f3eee4]/15 bg-[#122c21] md:h-[650px]">{[[19,27,48,44],[49,18,48,44],[76,31,48,44],[82,66,68,57],[48,78,48,44],[18,70,48,44],[48,44,68,57]].map(([x1,y1,x2,y2], i) => <svg key={i} className="absolute inset-0 h-full w-full"><line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#c1a05b" strokeOpacity=".28" strokeWidth="1" strokeDasharray="4 6" /></svg>)}{nodes.map((node) => <button key={node.name} onClick={() => setActiveNode(node.name)} className={`absolute -translate-x-1/2 -translate-y-1/2 text-left transition-all hover:scale-110 ${node.kind === 'project' ? 'z-10' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} {...cursorProps('TRACE')}><span className={`block rounded-full border ${node.kind === 'project' ? 'h-14 w-14 border-[#c1a05b] bg-[#9b7b3b]' : 'h-5 w-5 border-[#f3eee4]/50 bg-[#f3eee4]'}`} /><span className={`absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-[.14em] ${node.kind === 'project' ? 'text-[#c1a05b]' : 'text-[#f3eee4]/60'}`}>{node.name}</span></button>)}</div></div></section>

      <section className="relative overflow-hidden px-6 py-28 md:px-10 md:py-48"><div className="mx-auto max-w-7xl"><SectionLabel number="05 / 06">PROFILE ASSEMBLY</SectionLabel><div className="mt-7 grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-end"><h2 className="font-serif text-6xl font-light leading-[.9] tracking-[-.05em] md:text-9xl">A record<br />worth <em className="text-[#7c2634]">sharing.</em></h2><div className="max-w-md pb-2"><p className="text-lg leading-relaxed text-[#111318]/65">The evidence you collect is more than a history. It is a clear, living answer to the question: what can you do?</p><button onClick={() => setActiveAction('Public profile')} className="mt-8 flex items-center gap-3 bg-[#0c0d14] px-5 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4]" {...cursorProps('VIEW')}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9b7b3b]"><ArrowUpRight size={14} /></span> View public profile</button></div></div><div className="mt-20 flex flex-col border-y border-[#0c0d14]/15 py-8 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-5"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#9b7b3b] font-serif text-2xl text-[#f3eee4]">AR</div><div><p className="font-serif text-3xl">Alex Rivera</p><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#111318]/50">Product engineer · curious by default</p></div></div><div className="mt-7 grid grid-cols-3 gap-8 md:mt-0"><div><strong className="font-serif text-3xl">08</strong><span className="block text-[9px] font-bold tracking-[.14em] opacity-50">PROJECTS</span></div><div><strong className="font-serif text-3xl">14</strong><span className="block text-[9px] font-bold tracking-[.14em] opacity-50">CAPABILITIES</span></div><div><strong className="font-serif text-3xl">42</strong><span className="block text-[9px] font-bold tracking-[.14em] opacity-50">EVIDENCE</span></div></div></div></div></section>

      <footer className="flex flex-col justify-between gap-8 bg-[#7c2634] px-6 py-10 text-[#f3eee4] md:flex-row md:items-end md:px-10"><div><p className="font-serif text-3xl">WORKFOLIO</p><p className="mt-2 text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/60">TRACE THE TASK · Turn your work into proof.</p></div><p className="text-[10px] uppercase tracking-[.18em] text-[#f3eee4]/60">06 / 06 · Keep building.</p></footer>

      <AnimatePresence>{activeNode && <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col bg-[#f3eee4] p-8 text-[#111318] shadow-2xl md:p-12"><button onClick={() => setActiveNode(null)} className="self-end" aria-label="Close inspector"><X size={20} /></button><div className="mt-auto"><SectionLabel number="INSPECTOR">SELECTED CAPABILITY</SectionLabel><h3 className="mt-5 font-serif text-6xl">{activeNode}</h3><p className="mt-4 text-sm leading-relaxed text-[#111318]/60">Strong evidence connects this capability to the work you have made visible.</p><div className="mt-10 grid grid-cols-3 gap-3 border-y border-[#0c0d14]/15 py-5">{[['08','ACTIVITIES'],['03','PROJECTS'],['05','PROOFS']].map(([num,label]) => <div key={label}><strong className="font-serif text-3xl">{num}</strong><span className="mt-1 block text-[9px] font-bold tracking-[.1em] opacity-50">{label}</span></div>)}</div><p className="mt-10 text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">Recent proof</p><ul className="mt-4 space-y-3 font-serif text-xl"><li>CRM Automation</li><li>Weather API</li><li>Data Processing</li></ul><button onClick={() => setActiveAction(activeNode)} className="mt-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">View capability <ArrowUpRight size={15} /></button></div></motion.aside>}</AnimatePresence>
      <AnimatePresence>{activeAction && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0c0d14]/60 p-5" role="dialog" aria-modal="true" aria-labelledby="action-title"><motion.div initial={{ y: 18 }} animate={{ y: 0 }} className="w-full max-w-md bg-[#f3eee4] p-8 text-[#111318] shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7b3b]">Action ready</p><h2 id="action-title" className="mt-2 font-serif text-4xl font-light">{activeAction}</h2></div><button onClick={() => setActiveAction(null)} aria-label="Close action dialog"><X size={18} /></button></div><p className="mt-6 text-sm leading-relaxed text-[#111318]/65">This interaction is connected and ready for the next step. Keep building your proof ledger to make this record more useful.</p><button onClick={() => setActiveAction(null)} className="mt-8 w-full bg-[#0c0d14] px-5 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">Continue</button></motion.div></motion.div>}</AnimatePresence>
    </main>
  )
}
