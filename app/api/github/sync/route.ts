import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, token } = body as { username?: string; token?: string }

    if (!username && !token) {
      return NextResponse.json(
        { success: false, message: 'GitHub username or Personal Access Token is required.' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Workfolio-App'
    }
    if (token && token.trim()) {
      headers.Authorization = `token ${token.trim()}`
    }

    // 1. Fetch User Profile
    const userTarget = username ? username.trim() : 'me'
    const profileUrl = token && !username ? 'https://api.github.com/user' : `https://api.github.com/users/${userTarget}`

    const userRes = await fetch(profileUrl, { headers })
    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, message: `GitHub API returned status ${userRes.status}: Unable to fetch user profile.` },
        { status: userRes.status }
      )
    }
    const userData = await userRes.json()

    // 2. Fetch Repositories
    const reposUrl = token && !username
      ? 'https://api.github.com/user/repos?sort=updated&per_page=15'
      : `https://api.github.com/users/${userData.login}/repos?sort=updated&per_page=15`

    const reposRes = await fetch(reposUrl, { headers })
    const reposData = reposRes.ok ? await reposRes.json() : []

    const repositories = reposData.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      description: r.description || '',
      language: r.language || 'Code',
      stars: r.stargazers_count,
      forks: r.forks_count,
      url: r.html_url,
      updatedAt: r.updated_at ? r.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }))

    // 3. Fetch Recent Public Events / Commits for Observed Activity
    const eventsUrl = `https://api.github.com/users/${userData.login}/events/public?per_page=10`
    const eventsRes = await fetch(eventsUrl, { headers })
    const eventsData = eventsRes.ok ? await eventsRes.json() : []

    const observedActivities = eventsData
      .filter((ev: any) => ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent'].includes(ev.type))
      .map((ev: any, idx: number) => {
        let type: 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'RELEASE' = 'COMMIT'
        let title = 'Observed Engineering Event'

        if (ev.type === 'PushEvent') {
          type = 'COMMIT'
          const commitCount = ev.payload?.commits?.length || 1
          const msg = ev.payload?.commits?.[0]?.message || 'Pushed commits'
          title = `Pushed ${commitCount} commit(s): ${msg.slice(0, 60)}`
        } else if (ev.type === 'PullRequestEvent') {
          type = 'PULL_REQUEST'
          title = `PR #${ev.payload?.number} ${ev.payload?.action}: ${ev.payload?.pull_request?.title || 'Pull request update'}`
        } else if (ev.type === 'IssuesEvent') {
          type = 'ISSUE'
          title = `Issue #${ev.payload?.issue?.number} ${ev.payload?.action}: ${ev.payload?.issue?.title || 'Issue update'}`
        } else if (ev.type === 'ReleaseEvent') {
          type = 'RELEASE'
          title = `Published Release: ${ev.payload?.release?.name || ev.payload?.release?.tag_name || 'Version release'}`
        }

        return {
          id: `gh-evt-${ev.id || idx}`,
          type,
          title,
          repoName: ev.repo?.name || 'Repository',
          repoUrl: `https://github.com/${ev.repo?.name}`,
          date: ev.created_at ? ev.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          details: `Observed GitHub activity in ${ev.repo?.name}`
        }
      })

    return NextResponse.json({
      success: true,
      profile: {
        username: userData.login,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        bio: userData.bio || '',
        publicRepos: userData.public_repos
      },
      repositories,
      observedActivities
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Failed to connect to GitHub: ${error?.message || 'Network error'}` },
      { status: 500 }
    )
  }
}
