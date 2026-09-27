import { SYSTEM_SECURITY_INSTRUCTION } from './prompts'

export interface GeminiOptions {
  prompt: string
  systemInstruction?: string
  apiKey?: string
  model?: string
  jsonMode?: boolean
}

export async function callGemini(options: GeminiOptions): Promise<string> {
  const apiKey = options.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    const error: any = new Error('AI is not configured yet. Missing GEMINI_API_KEY.')
    error.code = 'NOT_CONFIGURED'
    throw error
  }

  const modelName = options.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `SYSTEM INSTRUCTIONS:\n${options.systemInstruction || SYSTEM_SECURITY_INSTRUCTION}\n\nTASK PROMPT:\n${options.prompt}`
        }
      ]
    }
  ]

  const body: any = { contents }
  if (options.jsonMode) {
    body.generationConfig = { responseMimeType: 'application/json' }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    const rawMsg = errData?.error?.message || `HTTP ${res.status}`

    if (res.status === 400 || res.status === 403) {
      if (rawMsg.toLowerCase().includes('key') || rawMsg.toLowerCase().includes('invalid')) {
        const err: any = new Error('Invalid Gemini API Key or quota exhausted.')
        err.code = 'INVALID_API_KEY'
        throw err
      }
    }

    if (res.status === 429) {
      const err: any = new Error('Gemini API rate limit reached. Please wait a moment.')
      err.code = 'RATE_LIMIT'
      throw err
    }

    const err: any = new Error(`Gemini API error: ${rawMsg}`)
    err.code = 'PROVIDER_ERROR'
    throw err
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return text
}

export async function callGeminiStructured<T = any>(options: GeminiOptions): Promise<T> {
  const text = await callGemini({ ...options, jsonMode: true })
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch (e: any) {
    const err: any = new Error(`Failed to parse AI JSON response: ${e.message}`)
    err.code = 'INVALID_JSON'
    throw err
  }
}
