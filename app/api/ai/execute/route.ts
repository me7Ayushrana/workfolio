import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'
import { AITaskKind, AIProviderId } from '@/lib/ai/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { task, payload, config, providerConfig } = body as {
      task: AITaskKind
      payload: any
      config?: { geminiApiKey?: string; groqApiKey?: string; primaryProvider?: AIProviderId }
      providerConfig?: { provider?: AIProviderId; apiKey?: string; model?: string }
    }

    if (!task) {
      return NextResponse.json({ success: false, message: 'AI task is required.' }, { status: 400 })
    }

    const apiKey = providerConfig?.apiKey || config?.geminiApiKey || config?.groqApiKey
    const options = { apiKey, model: providerConfig?.model }

    let result: any

    switch (task) {
      case 'ACTIVITY_STRUCTURING':
        result = await aiService.parseActivity(payload.rawText, payload.projects || [], payload.skills || [], options)
        break

      case 'WEEKLY_REFLECTION':
        result = await aiService.generateWeeklyReflection(payload.dateRange || 'This Week', payload.context || payload, options)
        break

      case 'PROJECT_CASE_STUDY':
        result = await aiService.generateProjectSummary(payload.project || {}, payload.projectActivities || [], payload.milestones || [], options)
        break

      case 'ASK_WORKFOLIO':
        result = await aiService.askWorkfolio(payload.userQuestion, payload.context || payload, options)
        break

      default:
        return NextResponse.json({ success: false, message: `Unsupported AI task kind: ${task}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    // Return sanitized human readable error response without exposing raw secret keys or stack traces
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'AI service processing error. Please check your provider settings.'
      },
      { status: 500 }
    )
  }
}
