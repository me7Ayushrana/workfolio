'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'

export default function CapabilitiesPage() {
  const items = [
    'React & Next.js Architecture',
    'Problem Solving & System Design',
    'API Integration & Resilience',
    'Automation & Workflow Engines',
    'Python & Data Processing',
    'Editorial UI & Design Systems',
    'OCR & Document Parsing',
    'Cloud Deployment & Infrastructure'
  ]

  const nodes = [
    { name: 'Python', x: 19, y: 27, kind: 'capability' },
    { name: 'React', x: 49, y: 18, kind: 'capability' },
    { name: 'OCR', x: 76, y: 31, kind: 'capability' },
    { name: 'Automation', x: 82, y: 66, kind: 'capability' },
    { name: 'Problem Solving', x: 48, y: 78, kind: 'capability' },
    { name: 'Deployment', x: 18, y: 70, kind: 'capability' }
  ]

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <p className="mt-12 text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
          WORKFOLIO CAPABILITY INDEX
        </p>
        <h1 className="mt-4 font-serif text-6xl font-light md:text-7xl">What you can show.</h1>
        <p className="mt-3 text-sm text-[#111318]/65 max-w-lg">
          Capabilities are not self-asserted claims—they emerge directly from verified projects and evidence.
        </p>

        {/* Constellation Canvas Section */}
        <section id="constellation" className="mt-12 border border-[#0c0d14]/15 bg-[#0c0d14] p-8 text-[#f3eee4]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#c1a05b]">
            <Sparkles size={14} /> CAPABILITY CONSTELLATION GRAPH
          </div>
          <h2 className="mt-2 font-serif text-4xl font-light">Trace the connections</h2>
          <p className="mt-2 text-xs text-[#f3eee4]/70 max-w-md">
            See how evidence and projects connect to form verified capability signals.
          </p>

          <div className="relative mt-8 h-[420px] overflow-hidden border border-[#f3eee4]/15 bg-[#122c21]">
            {[[19,27,48,44],[49,18,48,44],[76,31,48,44],[82,66,68,57],[48,78,48,44],[18,70,48,44],[48,44,68,57]].map(([x1,y1,x2,y2], i) => (
              <svg key={i} className="absolute inset-0 h-full w-full">
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#c1a05b"
                  strokeOpacity=".35"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            ))}
            {nodes.map((node) => (
              <div
                key={node.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <span
                  className={`block rounded-full border mx-auto transition-transform hover:scale-125 ${
                    node.kind === 'project'
                      ? 'h-10 w-10 border-[#c1a05b] bg-[#9b7b3b]'
                      : 'h-4 w-4 border-[#f3eee4]/50 bg-[#f3eee4]'
                  }`}
                />
                <span
                  className={`mt-1.5 block whitespace-nowrap text-[9px] font-bold tracking-[.14em] ${
                    node.kind === 'project' ? 'text-[#c1a05b]' : 'text-[#f3eee4]/70'
                  }`}
                >
                  {node.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Capability List */}
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between border-b border-[#0c0d14]/15 py-6 font-serif text-2xl transition-colors hover:bg-[#e5dac9] px-3"
            >
              <span>
                <small className="mr-5 font-sans text-[10px] font-bold tracking-[.15em] opacity-40">
                  0{index + 1}
                </small>
                {item}
              </span>
              <ArrowUpRight size={17} className="text-[#9b7b3b]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
