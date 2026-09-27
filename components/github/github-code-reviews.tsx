'use client'

import { GitPullRequest, MessageSquare, CheckCircle2, Shield } from 'lucide-react'
import { GitHubPRItem } from '@/lib/github/types'

interface GitHubCodeReviewsProps {
  pullRequests: GitHubPRItem[]
}

export function GitHubCodeReviews({ pullRequests }: GitHubCodeReviewsProps) {
  const totalComments = pullRequests.reduce((acc, pr) => acc + (pr.commentsCount || 0), 0)
  const prsWithReviewers = pullRequests.filter((pr) => pr.reviewers && pr.reviewers.length > 0)

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <Shield size={14} /> GITHUB CODE REVIEW ACTIVITY
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Peer Review & Quality Collaboration</h3>
          <p className="mt-0.5 text-xs text-[#f3eee4]/60">
            Observed code review participation, comment threads, and reviewer allocations.
          </p>
        </div>
        <span className="text-[10px] text-[#f3eee4]/50">SOURCE: GITHUB</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#f3eee4]/60">Review Comments</span>
          <p className="mt-1 font-serif text-3xl font-light text-[#c1a05b]">{totalComments}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-[#f3eee4]/60">PRs with Reviewers</span>
          <p className="mt-1 font-serif text-3xl font-light text-white">{prsWithReviewers.length}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold uppercase text-[#f3eee4]/60">Total PRs Reviewed</span>
          <p className="mt-1 font-serif text-3xl font-light text-[#c1a05b]">{pullRequests.length}</p>
        </div>
      </div>
    </div>
  )
}
