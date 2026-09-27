import { NextResponse } from 'next/server'
import { gitHubSyncService } from '@/lib/github/sync-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, token } = body as { username?: string; token?: string }

    if (!username && !token) {
      return NextResponse.json(
        { success: false, status: 'unconfigured', message: 'GitHub username or App installation token is required.' },
        { status: 400 }
      )
    }

    const userTarget = username ? username.trim() : 'me'

    // 1. Sync Profile & Repositories
    const profile = await gitHubSyncService.syncProfile(userTarget, token)
    const repos = await gitHubSyncService.syncRepositories(userTarget, token)

    // 2. For top repos, sync detailed commits, PRs, issues, releases, and workflows
    let allCommits: any[] = []
    let allPRs: any[] = []
    let allIssues: any[] = []
    let allReleases: any[] = []
    let allWorkflows: any[] = []

    for (const repo of repos.slice(0, 5)) {
      const [owner, repoName] = repo.fullName.split('/')
      if (owner && repoName) {
        const [commits, prs, issues, releases, workflows] = await Promise.all([
          gitHubSyncService.syncCommits(owner, repoName, token),
          gitHubSyncService.syncPullRequests(owner, repoName, token),
          gitHubSyncService.syncIssues(owner, repoName, token),
          gitHubSyncService.syncReleases(owner, repoName, token),
          gitHubSyncService.syncWorkflowRuns(owner, repoName, token)
        ])

        allCommits = [...allCommits, ...commits]
        allPRs = [...allPRs, ...prs]
        allIssues = [...allIssues, ...issues]
        allReleases = [...allReleases, ...releases]
        allWorkflows = [...allWorkflows, ...workflows]
      }
    }

    return NextResponse.json({
      success: true,
      status: 'success',
      profile,
      repositories: repos,
      commits: allCommits,
      pullRequests: allPRs,
      issues: allIssues,
      releases: allReleases,
      workflows: allWorkflows,
      syncedAt: new Date().toISOString()
    })
  } catch (err: any) {
    if (err?.code === 'RATE_LIMIT') {
      return NextResponse.json(
        { success: false, status: 'error', message: 'GitHub API rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { success: false, status: 'error', message: err?.message || 'Failed to synchronize with GitHub API.' },
      { status: 500 }
    )
  }
}
