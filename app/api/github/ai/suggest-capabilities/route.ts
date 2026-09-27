import { NextResponse } from 'next/server'
import { callGeminiStructured } from '@/lib/ai/gemini'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { repositories } = body

    if (!Array.isArray(repositories) || repositories.length === 0) {
      return NextResponse.json({ success: true, capabilities: [] })
    }

    const repoContext = repositories
      .slice(0, 10)
      .map((r) => `- Repo: ${r.name} | Language: ${r.language} | Topics: ${r.topics?.join(', ') || 'None'}`)
      .join('\n')

    const prompt = `
Analyze the developer's connected GitHub repositories and suggest 2-4 verified capability areas supported by real code.
UNTRUSTED EXTERNAL DATA:
${repoContext}

Return ONLY valid JSON matching this schema:
{
  "capabilities": [
    {
      "name": "Capability Name",
      "reason": "Why this capability is observed based on repository languages and topics",
      "supportingRepoNames": ["repo/name"]
    }
  ]
}
`

    const raw = await callGeminiStructured({ prompt })
    return NextResponse.json({ success: true, capabilities: raw?.capabilities || [] })
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIGURED') {
      return NextResponse.json(
        { success: false, status: 'unconfigured', message: 'AI is not configured yet.' },
        { status: 200 }
      )
    }
    return NextResponse.json({ success: false, message: err?.message || 'Error suggesting capabilities.' }, { status: 500 })
  }
}
