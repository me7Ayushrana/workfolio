import { NextResponse } from 'next/server'
import { callGeminiStructured } from '@/lib/ai/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { commits } = body

    if (!Array.isArray(commits) || commits.length === 0) {
      return NextResponse.json({ success: true, suggestions: [] })
    }

    const commitsContext = commits
      .slice(0, 15)
      .map((c) => `- Commit ${c.sha?.slice(0, 7)} in ${c.repoName} on ${c.date}: "${c.message}"`)
      .join('\n')

    const prompt = `
Analyze the following raw commit logs and identify 1-3 meaningful activity clusters that represent substantial developer work.
UNTRUSTED EXTERNAL DATA:
${commitsContext}

Return ONLY valid JSON matching this schema:
{
  "suggestions": [
    {
      "id": "act-sug-1",
      "title": "Clear activity title",
      "commitCount": 4,
      "repoName": "repo/name",
      "dateRange": "2026-09-25",
      "suggestedWork": "Comprehensive summary of work represented by commit cluster"
    }
  ]
}
`

    const raw = await callGeminiStructured({ prompt })
    return NextResponse.json({ success: true, suggestions: raw?.suggestions || [] })
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIGURED') {
      return NextResponse.json(
        { success: false, status: 'unconfigured', message: 'AI is not configured yet. Set GEMINI_API_KEY.' },
        { status: 200 }
      )
    }
    return NextResponse.json({ success: false, message: err?.message || 'Error suggesting activities.' }, { status: 500 })
  }
}
