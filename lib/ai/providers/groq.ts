import { BaseAIProvider, AIGenerateOptions, AIChatOptions } from './base'
import { AIProviderId, AISourceAttribution } from '../types'
import { AIProviderStatus } from '../credential-vault'

export class GroqProvider extends BaseAIProvider {
  id: AIProviderId = 'groq'
  name = 'Groq'
  defaultModel = 'llama-3.3-70b-versatile'
  supportsMultimodal = false

  async testConnection(
    apiKey: string,
    model: string = this.defaultModel
  ): Promise<{ success: boolean; status: AIProviderStatus; message: string }> {
    const cleanKey = apiKey?.trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '') || ''
    if (!cleanKey) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        message: 'Groq API key is missing. Please enter your API key.'
      }
    }

    try {
      // Direct REST call to Groq official models endpoint to strictly verify key accuracy
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'User-Agent': 'Workfolio/1.0',
          'Accept': 'application/json'
        }
      })

      if (res.ok) {
        return {
          success: true,
          status: 'VALID',
          message: `Successfully connected & verified Groq API Key (${model})!`
        }
      }

      const errorData = await res.json().catch(() => ({}))
      const rawMsg = errorData?.error?.message || `HTTP ${res.status}`
      const lowerMsg = rawMsg.toLowerCase()

      if (res.status === 401 || res.status === 400) {
        return {
          success: false,
          status: 'INVALID',
          message: `Groq rejected API key (${res.status}): ${rawMsg}. Please check your key at console.groq.com/keys.`
        }
      }

      if (res.status === 403) {
        if (lowerMsg.includes('billing') || lowerMsg.includes('quota')) {
          return {
            success: false,
            status: 'BILLING_REQUIRED',
            message: `Groq quota/billing limit reached (${res.status}): ${rawMsg}`
          }
        }
        return {
          success: false,
          status: 'PERMISSION_ERROR',
          message: `Groq permission error (${res.status}): ${rawMsg}`
        }
      }

      if (res.status === 429) {
        return {
          success: false,
          status: 'RATE_LIMITED',
          message: `Groq rate limit exceeded (${res.status}): ${rawMsg}`
        }
      }

      if (res.status >= 500) {
        return {
          success: false,
          status: 'PROVIDER_ERROR',
          message: `Groq service temporary error (HTTP ${res.status}): ${rawMsg}`
        }
      }

      return {
        success: false,
        status: 'INVALID',
        message: `Groq rejected key (HTTP ${res.status}): ${rawMsg}`
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'NETWORK_ERROR',
        message: `Network failure connecting to Groq API: ${err?.message || 'Connection refused'}`
      }
    }
  }

  async generateText(options: AIGenerateOptions): Promise<string> {
    const key = options.apiKey?.trim()
    if (!key) {
      const err: any = new Error('Groq API key is not configured.')
      err.code = 'NOT_CONFIGURED'
      throw err
    }

    const modelName = options.model && !options.model.includes('gemini') ? options.model : this.defaultModel
    const messages: any[] = []
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction })
    }
    messages.push({ role: 'user', content: options.prompt })

    const body: any = {
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.3
    }
    if (options.jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const msg = errData?.error?.message || `Groq API returned HTTP ${res.status}`
      const err: any = new Error(msg)
      if (res.status === 401) err.code = 'INVALID'
      else if (res.status === 429) err.code = 'RATE_LIMITED'
      else if (res.status === 403) err.code = 'PERMISSION_ERROR'
      else if (res.status >= 500) err.code = 'PROVIDER_ERROR'
      throw err
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  }

  async generateStructuredOutput<T = any>(options: AIGenerateOptions): Promise<T> {
    const text = await this.generateText({ ...options, jsonMode: true })
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      return JSON.parse(cleaned) as T
    } catch (e: any) {
      const err: any = new Error(`Failed to parse Groq structured JSON output: ${e.message}`)
      err.code = 'STRUCTURED_PARSE_ERROR'
      throw err
    }
  }

  async chat(options: AIChatOptions): Promise<{ text: string; sources?: AISourceAttribution[] }> {
    const key = options.apiKey?.trim()
    if (!key) {
      const err: any = new Error('Groq API key is not configured.')
      err.code = 'NOT_CONFIGURED'
      throw err
    }

    const modelName = options.model && !options.model.includes('gemini') ? options.model : this.defaultModel
    const messages: any[] = []
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction })
    }
    options.messages.forEach((m) => {
      messages.push({ role: m.role, content: m.content })
    })

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelName,
        messages
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData?.error?.message || `Groq API returned HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''
    return { text, sources: options.contextSources }
  }

  async analyzeImage(imageUrl: string, prompt: string, apiKey?: string): Promise<string> {
    throw new Error('Groq provider does not support direct image multimodal input.')
  }

  async analyzeDocument(documentText: string, prompt: string, apiKey?: string): Promise<string> {
    return this.generateText({ prompt: `${prompt}\n\nDocument Content:\n${documentText}`, apiKey })
  }
}
