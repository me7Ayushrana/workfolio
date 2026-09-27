import { NextResponse } from 'next/server'
import { callGeminiStructured } from '@/lib/ai/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { repo, readmeText, commits, prs } = body

    if (!repo || !repo.name) {
      return NextResponse.json({ success: false, message: 'Repository details are required.' }, { status: 400 })
    }

    const context = `
Repository Name: ${repo.name} (${repo.fullName})
Language: ${repo.language}
Description: ${repo.description || 'N/A'}
README Content Snippet: ${readmeText?.slice(0, 1500) || 'None available.'}
Recent Commits Count: ${commits?.length || 0}
Recent PRs Count: ${prs?.length || 0}
`

    const prompt = `
Generate a structured GitHub Project Summary based on the provided repository metadata and README context.
UNTRUSTED EXTERNAL DATA:
${context}

Return ONLY valid JSON matching this schema:
{
  "projectPurpose": "Clear statement of purpose...",
  "technicalStack": ["Tech 1", "Tech 2"],
  "majorWorkCompleted": ["Work item 1"],
  "importantChallenges": ["Challenge 1"],
  "developmentHistory": "Overview of development journey...",
  "currentState": "Active / Stable / In Progress",
  "potentialNextSteps": ["Step 1"]
}
`

    const raw = await callGeminiStructured({ prompt })
    return NextResponse.json({ success: true, summary: raw })
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIGURED') {
      return NextResponse.json(
        { success: false, status: 'unconfigured', message: 'AI is not configured yet. Set GEMINI_API_KEY.' },
        { status: 200 }
      )
    }
    return NextResponse.json({ success: false, message: err?.message || 'Error generating GitHub summary.' }, { status: 500 })
  }
}
