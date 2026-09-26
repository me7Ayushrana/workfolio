import { AIProviderId, AISourceAttribution } from '../types'

export interface AIGenerateOptions {
  prompt: string
  systemInstruction?: string
  model?: string
  apiKey?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIChatOptions {
  messages: AIChatMessage[]
  systemInstruction?: string
  model?: string
  apiKey?: string
  contextSources?: AISourceAttribution[]
}

export abstract class BaseAIProvider {
  abstract id: AIProviderId
  abstract name: string
  abstract defaultModel: string
  abstract supportsMultimodal: boolean

  abstract testConnection(apiKey: string, model?: string): Promise<{ success: boolean; message: string }>
  
  abstract generateText(options: AIGenerateOptions): Promise<string>
  
  abstract generateStructuredOutput<T = any>(options: AIGenerateOptions): Promise<T>
  
  abstract chat(options: AIChatOptions): Promise<{ text: string; sources?: AISourceAttribution[] }>
  
  abstract analyzeImage?(imageUrl: string, prompt: string, apiKey?: string): Promise<string>
  
  abstract analyzeDocument?(documentText: string, prompt: string, apiKey?: string): Promise<string>
}
