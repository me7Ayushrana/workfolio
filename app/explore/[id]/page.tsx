'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCode,
  Layers,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X
} from 'lucide-react'
import { WorkfolioHeader } from '@/components/workfolio-header'
import { ImplementModal } from '@/components/implement-modal'
import { ExploreCard } from '@/components/explore-card'
import { useWorkfolio, ExploreResource } from '@/lib/workfolio-store'

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const idOrSlug = resolvedParams.id
  const router = useRouter()

  const {
    resources,
    isSaved,
    saveResource,
    unsaveResource,
    recordView,
    submitResourceFeedback
  } = useWorkfolio()

  const [showImplementModal, setShowImplementModal] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [activeImage, setActiveImage] = useState<string>('')

  // Find resource by id or slug
  const resource = resources.find(
    (r) => r.id === idOrSlug || r.slug === idOrSlug || r.slug === idOrSlug.toLowerCase()
  ) || resources[0]

  useEffect(() => {
    if (resource) {
      recordView(resource.id)
      setActiveImage(resource.coverImage)
    }
  }, [resource?.id])

  if (!resource) {
    return (
      <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
        <WorkfolioHeader />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-serif text-5xl">Resource Not Found</h1>
          <p className="mt-4 text-sm opacity-60">The requested Explore resource does not exist.</p>
          <Link
            href="/explore"
            className="mt-8 inline-block bg-[#0c0d14] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] text-[#f3eee4]"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    )
  }

  const saved = isSaved(resource.id)

  const handleToggleSave = () => {
    if (saved) {
      unsaveResource(resource.id)
    } else {
      saveResource(resource.id)
    }
  }

  const handleFeedback = (useful: boolean) => {
    submitResourceFeedback(resource.id, useful, feedbackText)
    setFeedbackSent(useful)
  }

  // Find related resources by category or tags
  const relatedResources = resources
    .filter(
      (r) =>
        r.id !== resource.id &&
        (r.category === resource.category || r.type === resource.type || r.tags.some((t) => resource.tags.includes(t)))
    )
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-[#f3eee4] text-[#111318]">
      <WorkfolioHeader />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        {/* Breadcrumb Back link */}
        <div className="flex items-center justify-between border-b border-[#0c0d14]/10 pb-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#111318]/70 hover:text-[#111318]"
          >
            <ArrowLeft size={14} /> Back to Explore Ecosystem
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] transition-colors ${
                saved
                  ? 'border-[#7c2634] bg-[#7c2634] text-[#f3eee4]'
                  : 'border-[#0c0d14]/20 text-[#111318] hover:bg-[#e5dac9]'
              }`}
            >
              <Bookmark size={13} className={saved ? 'fill-[#f3eee4]' : ''} />
              <span>{saved ? 'SAVED' : 'SAVE FOR LATER'}</span>
            </button>

            <button
              onClick={() => setShowImplementModal(true)}
              className="flex items-center gap-2 bg-[#0c0d14] px-5 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] hover:bg-[#9b7b3b]"
            >
              IMPLEMENT <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Hero Product Detail Section */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Visual Showcase Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#0c0d14]/15 bg-[#122c21]">
              <Image
                src={activeImage || resource.coverImage}
                alt={resource.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#0c0d14] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#f3eee4]">
                  {resource.type}
                </span>
                <span className="bg-[#9b7b3b] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-[#111318]">
                  v{resource.version}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {resource.screenshots.length > 1 && (
              <div className="flex gap-3">
                {resource.screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-32 overflow-hidden border transition-all ${
                      activeImage === img ? 'border-[#9b7b3b] ring-2 ring-[#9b7b3b]/30' : 'border-[#0c0d14]/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="Screenshot" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Title, Metadata & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#9b7b3b]">
                <span>{resource.category}</span>
                <span>·</span>
                <span>{resource.difficulty}</span>
              </div>

              <h1 className="mt-3 font-serif text-4xl font-light leading-tight md:text-5xl">
                {resource.title}
              </h1>

              <div className="mt-4 border-y border-[#0c0d14]/10 py-3 flex items-center justify-between text-[10px] font-medium text-[#111318]/70">
                <span>Created by <strong className="text-[#111318]">{resource.createdBy}</strong></span>
                <span>Updated {resource.updatedDate}</span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#111318]/80">
                {resource.longDescription || resource.description}
              </p>

              {/* Technologies list */}
              <div className="mt-6 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b7b3b]">
                  Technologies & Frameworks
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {resource.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="border border-[#0c0d14]/20 bg-[#e5dac9] px-2.5 py-1 text-[10px] font-semibold text-[#111318]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="border border-[#0c0d14]/20 bg-[#e5dac9]/80 p-6 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                <span>READY TO USE</span>
                <span>{resource.implementationsCount} Implementations</span>
              </div>

              <button
                onClick={() => setShowImplementModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#0c0d14] py-3.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#f3eee4] transition-colors hover:bg-[#9b7b3b]"
              >
                IMPLEMENT THIS RESOURCE <ArrowUpRight size={14} />
              </button>

              {/* External Links */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
                {resource.externalUrl && (
                  <a
                    href={resource.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border border-[#0c0d14]/20 bg-[#f3eee4] p-2.5 text-[#111318] hover:bg-[#0c0d14] hover:text-[#f3eee4]"
                  >
                    <span>OPEN LIVE APP</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {resource.repositoryUrl && (
                  <a
                    href={resource.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between border border-[#0c0d14]/20 bg-[#f3eee4] p-2.5 text-[#111318] hover:bg-[#0c0d14] hover:text-[#f3eee4]"
                  >
                    <span>VIEW SOURCE</span>
                    <FileCode size={12} />
                  </a>
                )}
                {resource.documentationUrl && (
                  <a
                    href={resource.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 flex items-center justify-between border border-[#0c0d14]/20 bg-[#f3eee4] p-2.5 text-[#111318] hover:bg-[#0c0d14] hover:text-[#f3eee4]"
                  >
                    <span>READ DOCUMENTATION</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="mt-16 grid gap-12 border-t border-[#0c0d14]/15 pt-12 lg:grid-cols-12">
          {/* Main Specs & Guide */}
          <div className="lg:col-span-8 space-y-12">
            {/* Implementation Steps */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
                STEP-BY-STEP WORKFLOW
              </p>
              <h2 className="mt-2 font-serif text-3xl font-light">Implementation Guide</h2>
              <div className="mt-6 space-y-3">
                {resource.implementationGuide.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 border-b border-[#0c0d14]/10 py-4 text-sm"
                  >
                    <span className="font-serif text-2xl font-light text-[#9b7b3b] shrink-0">
                      0{idx + 1}
                    </span>
                    <p className="mt-1 leading-relaxed text-[#111318]/80">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn & Reuse Points */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-[#0c0d14]/15 bg-[#e5dac9]/50 p-6">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                  What You Can Learn
                </span>
                <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#111318]/80">
                  {resource.learnPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#9b7b3b]">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-[#0c0d14]/15 bg-[#e5dac9]/50 p-6">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                  What You Can Reuse
                </span>
                <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#111318]/80">
                  {resource.reusePoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#c1a05b]">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feedback Widget Section 26 */}
            <div className="border border-[#0c0d14]/15 bg-[#0c0d14] p-8 text-[#f3eee4]">
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c1a05b]">
                WORKFOLIO RESOURCE FEEDBACK
              </span>
              <h3 className="mt-2 font-serif text-3xl font-light">Was this resource useful?</h3>

              {feedbackSent !== null ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#c1a05b]">
                  <CheckCircle2 size={16} /> Thank you for helping improve Workfolio resources.
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="flex items-center gap-2 border border-[#f3eee4]/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-[#c1a05b] hover:text-[#111318]"
                    >
                      <ThumbsUp size={14} /> YES
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="flex items-center gap-2 border border-[#f3eee4]/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.16em] hover:bg-[#7c2634]"
                    >
                      <ThumbsDown size={14} /> NO
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Requirements & Specs */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="border border-[#0c0d14]/15 bg-[#e5dac9] p-6 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                Requirements
              </span>
              <ul className="space-y-2 text-xs text-[#111318]/80">
                {resource.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#c1a05b]" /> {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Changelog */}
            {resource.changelog && (
              <div className="border border-[#0c0d14]/15 bg-[#e5dac9]/50 p-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9b7b3b]">
                  Changelog & Versions
                </span>
                <div className="space-y-3 text-xs">
                  {resource.changelog.map((c, i) => (
                    <div key={i} className="border-b border-[#0c0d14]/10 pb-2">
                      <div className="flex justify-between font-bold">
                        <span>v{c.version}</span>
                        <span className="text-[9px] opacity-60">{c.date}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#111318]/70">{c.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Resources Section */}
        {relatedResources.length > 0 && (
          <section className="mt-24 border-t border-[#0c0d14]/15 pt-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#9b7b3b]">
                  RECOMMENDED EXTENSIONS
                </p>
                <h2 className="mt-1 font-serif text-3xl font-light">Related Resources</h2>
              </div>
              <Link
                href="/explore"
                className="text-[10px] font-bold uppercase tracking-[.16em] hover:text-[#9b7b3b]"
              >
                Explore All →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedResources.map((rel) => (
                <ExploreCard key={rel.id} resource={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showImplementModal && (
        <ImplementModal
          resource={resource}
          onClose={() => setShowImplementModal(false)}
          onSuccess={(projId) => router.push(`/projects/${projId}`)}
        />
      )}
    </main>
  )
}
