import { NextResponse } from 'next/server'
import { callGeminiStructured } from '@/lib/ai/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { issues } = body

    if (!Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json({ success: true, suggestions: [] })
    }

    const issuesContext = issues
      .slice(0, 10)
      .map((iss) => `- Issue #${iss.number} in ${iss.repoName}: "${iss.title}" (${iss.body?.slice(0, 100) || 'No body'})`)
      .join('\n')

    const prompt = `
Analyze the following GitHub issues and suggest potential Workfolio Problems for the developer to document solutions for.
UNTRUSTED EXTERNAL DATA:
${issuesContext}

Return ONLY valid JSON matching this schema:
{
  "suggestions": [
    {
      "id": "prob-sug-1",
      "title": "Clear problem statement",
      "sourceIssueNumber": 12,
      "repoName": "repo/name",
      "issueBody": "Brief context",
      "issueUrl": "https://github.com/..."
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
    return NextResponse.json({ success: false, message: err?.message || 'Error suggesting problems.' }, { status: 500 })
  }
}
