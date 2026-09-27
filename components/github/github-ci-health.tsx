'use client'

import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { GitHubWorkflowRunItem } from '@/lib/github/types'

interface GitHubCIHealthProps {
  workflowRuns?: GitHubWorkflowRunItem[]
}

export function GitHubCIHealth({ workflowRuns = [] }: GitHubCIHealthProps) {
  const latestRun = workflowRuns[0]
  const ciStatus: 'Healthy' | 'Failing' | 'No CI Data' = !latestRun
    ? 'No CI Data'
    : latestRun.success
    ? 'Healthy'
    : 'Failing'

  return (
    <div className="rounded-2xl border border-white/15 bg-[#090a10] p-6 text-[#f3eee4] shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#c1a05b]">
            <RefreshCw size={14} /> GITHUB ACTIONS · CI HEALTH
          </div>
          <h3 className="mt-1 font-serif text-2xl font-light">Continuous Integration Health</h3>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
            ciStatus === 'Healthy'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : ciStatus === 'Failing'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-white/10 text-[#f3eee4]/70 border border-white/20'
          }`}
        >
          {ciStatus === 'Healthy' && <CheckCircle2 size={14} />}
          {ciStatus === 'Failing' && <XCircle size={14} />}
          {ciStatus === 'No CI Data' && <AlertCircle size={14} />}
          <span>{ciStatus}</span>
        </span>
      </div>

      {workflowRuns.length === 0 ? (
        <p className="py-4 text-center text-xs text-[#f3eee4]/60">No recent GitHub Actions workflow runs detected.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {workflowRuns.slice(0, 3).map((run) => (
            <div key={run.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${run.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="font-medium text-white">{run.workflowName} #{run.runNumber}</span>
                <span className="text-[10px] text-[#f3eee4]/50">({run.branch})</span>
              </div>
              <a
                href={run.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] text-[#c1a05b] hover:underline"
              >
                <span>Logs</span>
                <ExternalLink size={10} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
