import { aiService } from './ai-service'

export interface GeminiOptions {
  prompt: string
  systemInstruction?: string
  apiKey?: string
  model?: string
  jsonMode?: boolean
}

export async function callGemini(options: GeminiOptions): Promise<string> {
  const result = await (aiService as any).executeStructuredAI(options.prompt, options, options.systemInstruction)
  if (typeof result === 'string') return result
  return JSON.stringify(result)
}

export async function callGeminiStructured<T = any>(options: GeminiOptions): Promise<T> {
  return (aiService as any).executeStructuredAI(options.prompt, options, options.systemInstruction) as Promise<T>
}
