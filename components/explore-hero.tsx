'use client'

import { Compass, Sparkles, Plus } from 'lucide-react'

interface ExploreHeroProps {
  onRequestResource: () => void
}

export function ExploreHero({ onRequestResource }: ExploreHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#0c0d14] text-[#f3eee4] px-6 py-16 md:px-12 md:py-24 border-b border-[#f3eee4]/15">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#c1a05b]">
          <Compass size={14} />
          <span>EXPLORE ECOSYSTEM</span>
          <span className="h-px w-8 bg-[#c1a05b]/40" />
          <span>DISCOVER USEFUL WORK, TOOLS AND IMPLEMENTATIONS</span>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <h1 className="font-serif text-5xl font-light leading-[.92] tracking-[-.04em] md:text-8xl">
              BUILD FROM WHAT<br />
              <em className="text-[#c1a05b]">ALREADY EXISTS.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#f3eee4]/75 md:text-base">
              Explore projects, systems and resources created within the Workfolio ecosystem and discover things you can adapt to your own work.
            </p>
          </div>

          <button
            onClick={onRequestResource}
            className="group flex shrink-0 items-center gap-2.5 border border-[#c1a05b] bg-[#c1a05b] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#111318] transition-all hover:bg-[#f3eee4] hover:border-[#f3eee4]"
          >
            <Sparkles size={14} className="transition-transform group-hover:rotate-12" />
            <span>Request a Resource</span>
          </button>
        </div>

        {/* Value chain indicators */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#f3eee4]/15 pt-6 text-[9px] font-bold uppercase tracking-[.18em] text-[#f3eee4]/60 md:grid-cols-5">
          <span>01 · WORK</span>
          <span>02 · PROOF</span>
          <span>03 · CAPABILITY</span>
          <span>04 · PROJECT</span>
          <span>05 · PROFILE</span>
        </div>
      </div>

      {/* Decorative accent geometry */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-[#c1a05b]/15 opacity-50" />
    </div>
  )
}
