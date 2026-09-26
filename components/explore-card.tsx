'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Bookmark, Eye, CheckCircle2, Sparkles } from 'lucide-react'
import { ExploreResource, useWorkfolio } from '@/lib/workfolio-store'

interface ExploreCardProps {
  resource: ExploreResource
  layout?: 'grid' | 'featured' | 'compact'
}

export function ExploreCard({ resource, layout = 'grid' }: ExploreCardProps) {
  const { isSaved, saveResource, unsaveResource } = useWorkfolio()
  const saved = isSaved(resource.id)

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      unsaveResource(resource.id)
    } else {
      saveResource(resource.id)
    }
  }

  const detailUrl = `/explore/${resource.slug || resource.id}`

  if (layout === 'featured') {
    return (
      <div className="group relative overflow-hidden border border-[#0c0d14]/15 bg-[#e5dac9] transition-all duration-300 hover:border-[#9b7b3b]">
        <div className="grid gap-0 md:grid-cols-12">
          {/* Large Image Column */}
          <Link href={detailUrl} className="relative block overflow-hidden md:col-span-7 aspect-[16/10] bg-[#122c21]">
            <Image
              src={resource.coverImage}
              alt={resource.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14]/80 via-[#193b2c]/20 to-transparent opacity-40 transition-opacity group-hover:opacity-60" />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="bg-[#0c0d14] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">
                {resource.type}
              </span>
              {resource.featured && (
                <span className="bg-[#c1a05b] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#111318]">
                  FEATURED
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 bg-[#f3eee4] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#111318] shadow-md">
                VIEW DETAILS <ArrowUpRight size={13} />
              </span>
              <span className="text-[10px] font-medium text-[#f3eee4]">Click image to explore</span>
            </div>
          </Link>

          {/* Details Column */}
          <div className="flex flex-col justify-between p-6 md:col-span-5 md:p-8">
            <div>
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.16em] text-[#9b7b3b]">
                <span>{resource.category}</span>
                <button
                  onClick={handleToggleSave}
                  className="flex items-center gap-1 hover:text-[#7c2634]"
                  title={saved ? 'Remove from saved' : 'Save resource'}
                >
                  <Bookmark size={14} className={saved ? 'fill-[#7c2634] text-[#7c2634]' : ''} />
                  <span>{saved ? 'SAVED' : 'SAVE'}</span>
                </button>
              </div>

              <Link href={detailUrl} className="block mt-3">
                <h3 className="font-serif text-3xl font-light leading-tight transition-colors group-hover:text-[#9b7b3b]">
                  {resource.title}
                </h3>
              </Link>

              <p className="mt-3 text-xs leading-relaxed text-[#111318]/70 line-clamp-3">
                {resource.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {resource.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="border border-[#0c0d14]/15 bg-[#f3eee4]/60 px-2 py-0.5 text-[9px] font-semibold text-[#111318]/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-[#0c0d14]/10 pt-4 flex items-center justify-between text-[10px] font-medium text-[#111318]/60">
              <span>Created by {resource.createdBy}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {resource.viewsCount}
                </span>
                <span className="flex items-center gap-1 text-[#c1a05b]">
                  <CheckCircle2 size={12} /> {resource.implementationsCount} used
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col justify-between border border-[#0c0d14]/12 bg-[#e5dac9] transition-all duration-300 hover:-translate-y-1 hover:border-[#9b7b3b]">
      {/* Large Image Header */}
      <Link href={detailUrl} className="relative block aspect-[16/10] overflow-hidden bg-[#122c21]">
        <Image
          src={resource.coverImage}
          alt={resource.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14]/70 via-transparent to-transparent opacity-30 transition-opacity group-hover:opacity-50" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="bg-[#0c0d14] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">
            {resource.type}
          </span>
          <button
            onClick={handleToggleSave}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3eee4]/90 text-[#111318] shadow-sm transition-transform hover:scale-110"
            title={saved ? 'Saved' : 'Save for later'}
          >
            <Bookmark size={13} className={saved ? 'fill-[#7c2634] text-[#7c2634]' : ''} />
          </button>
        </div>

        {/* Hover Overlay Hint */}
        <div className="absolute bottom-3 left-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 bg-[#f3eee4] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.16em] text-[#111318]">
            VIEW DETAILS <ArrowUpRight size={11} />
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[.16em] text-[#9b7b3b]">
            <span>{resource.category}</span>
            <span>v{resource.version}</span>
          </div>

          <Link href={detailUrl} className="block mt-2">
            <h3 className="font-serif text-2xl font-light leading-snug transition-colors group-hover:text-[#9b7b3b]">
              {resource.title}
            </h3>
          </Link>

          <p className="mt-2 text-xs leading-relaxed text-[#111318]/65 line-clamp-2">
            {resource.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1">
            {resource.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="border border-[#0c0d14]/15 bg-[#f3eee4]/70 px-1.5 py-0.5 text-[8px] font-semibold text-[#111318]/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 border-t border-[#0c0d14]/10 pt-3 flex items-center justify-between text-[9px] font-medium text-[#111318]/60">
          <span className="truncate max-w-[150px]">By {resource.createdBy}</span>
          <div className="flex items-center gap-2">
            <span title="Implementations">{resource.implementationsCount} implementations</span>
          </div>
        </div>
      </div>
    </div>
  )
}
